/**
 * Business Central API Client
 * 
 * Typed HTTP client for Business Central API with authentication support.
 * Handles all HTTP communication, authentication, and error transformation.
 * 
 * This client is designed to be easily mockable for testing.
 */

import { ApiError, createApiError, ApiErrorCode } from '../models/ApiError';

/**
 * Configuration for Business Central API client
 */
export interface BusinessCentralApiConfig {
  /** Base URL for Business Central API (e.g., 'https://api.businesscentral.dynamics.com') */
  baseUrl: string;
  
  /** Company ID */
  companyId: string;
  
  /** API version (default: 'v2.0') */
  apiVersion?: string;
  
  /** Authentication token (Bearer token) */
  accessToken?: string;
  
  /** API key (alternative to accessToken) */
  apiKey?: string;
  
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  
  /** Enable retry on retryable errors (default: true) */
  enableRetry?: boolean;
  
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
}

/**
 * HTTP request options
 */
interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * Typed Business Central API client
 */
export class BusinessCentralApiClient {
  private readonly config: Required<Omit<BusinessCentralApiConfig, 'accessToken' | 'apiKey'>> & Pick<BusinessCentralApiConfig, 'accessToken' | 'apiKey'>;
  
  constructor(config: BusinessCentralApiConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      companyId: config.companyId,
      apiVersion: config.apiVersion || 'v2.0',
      timeout: config.timeout || 30000,
      enableRetry: config.enableRetry !== false,
      maxRetries: config.maxRetries || 3,
      accessToken: config.accessToken,
      apiKey: config.apiKey,
    };
    
    this.validateConfig();
  }
  
  /**
   * Validates the configuration
   */
  private validateConfig(): void {
    if (!this.config.baseUrl) {
      throw new Error('Business Central API baseUrl is required');
    }
    
    if (!this.config.companyId) {
      throw new Error('Business Central API companyId is required');
    }
    
    if (!this.config.accessToken && !this.config.apiKey) {
      throw new Error('Either accessToken or apiKey must be provided for Business Central API authentication');
    }
  }
  
  /**
   * Updates the access token
   */
  updateAccessToken(token: string): void {
    this.config.accessToken = token;
  }
  
  /**
   * Updates the API key
   */
  updateApiKey(key: string): void {
    this.config.apiKey = key;
  }
  
  /**
   * Gets the base URL for API requests
   */
  private getBaseUrl(): string {
    return `${this.config.baseUrl}/api/${this.config.apiVersion}/companies(${this.config.companyId})`;
  }
  
  /**
   * Gets authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    } else if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    return headers;
  }
  
  /**
   * Makes a GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      endpoint,
      headers,
    });
  }
  
  /**
   * Makes a POST request
   */
  async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'POST',
      endpoint,
      body,
      headers,
    });
  }
  
  /**
   * Makes a PATCH request
   */
  async patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      endpoint,
      body,
      headers,
    });
  }
  
  /**
   * Makes a PUT request
   */
  async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      endpoint,
      body,
      headers,
    });
  }
  
  /**
   * Makes a DELETE request
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      endpoint,
      headers,
    });
  }
  
  /**
   * Makes an HTTP request with retry logic
   */
  private async request<T>(options: RequestOptions): Promise<T> {
    const url = `${this.getBaseUrl()}${options.endpoint}`;
    const requestHeaders = this.buildHeaders(options.headers);
    const timeout = options.timeout || this.config.timeout;
    
    let lastError: ApiError | null = null;
    let attempt = 0;
    const maxAttempts = this.config.enableRetry ? this.config.maxRetries : 1;
    
    while (attempt < maxAttempts) {
      try {
        const response = await this.executeRequest<T>(url, options, requestHeaders, timeout);
        return response;
      } catch (error) {
        lastError = createApiError(error);
        
        // Don't retry on non-retryable errors
        if (!this.shouldRetry(lastError, attempt, maxAttempts)) {
          throw lastError;
        }
        
        attempt++;
        
        // Exponential backoff: wait 2^attempt * 100ms
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 100;
          await this.sleep(delay);
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError || createApiError(new Error('Request failed after retries'));
  }
  
  /**
   * Executes a single HTTP request
   */
  private async executeRequest<T>(
    url: string,
    options: RequestOptions,
    headers: Record<string, string>,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
        signal: controller.signal,
      };
      
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(url, fetchOptions);
      
      clearTimeout(timeoutId);
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        const error = createApiError(response);
        error.details = errorData as Record<string, unknown>;
        throw error;
      }
      
      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw createApiError(new Error('Request timeout'), 'Request timeout');
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const apiError = createApiError(error, 'Network error');
        apiError.code = ApiErrorCode.NetworkError;
        throw apiError;
      }
      
      throw error;
    }
  }
  
  /**
   * Builds request headers
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
      'Accept': 'application/json',
      ...customHeaders,
    };
    
    return headers;
  }
  
  /**
   * Determines if a request should be retried
   */
  private shouldRetry(error: ApiError, attempt: number, maxAttempts: number): boolean {
    if (attempt >= maxAttempts - 1) {
      return false;
    }
    
    return (
      error.code === ApiErrorCode.NetworkError ||
      error.code === ApiErrorCode.Timeout ||
      error.code === ApiErrorCode.ServerError ||
      error.code === ApiErrorCode.RateLimitExceeded
    );
  }
  
  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Creates a Business Central API client from environment variables
 * 
 * Reads configuration from environment variables:
 * - BC_API_BASE_URL
 * - BC_COMPANY_ID
 * - BC_API_VERSION (optional, defaults to 'v2.0')
 * - BC_ACCESS_TOKEN or BC_API_KEY
 * - BC_API_TIMEOUT (optional, defaults to 30000)
 * 
 * @returns Configured API client
 * @throws Error if required environment variables are missing
 */
export function createApiClientFromEnv(): BusinessCentralApiClient {
  // Vite uses import.meta.env for environment variables
  // Variables must be prefixed with VITE_ to be exposed to the browser
  const baseUrl = import.meta.env.VITE_BC_API_BASE_URL || import.meta.env.BC_API_BASE_URL;
  const companyId = import.meta.env.VITE_BC_COMPANY_ID || import.meta.env.BC_COMPANY_ID;
  const apiVersion = import.meta.env.VITE_BC_API_VERSION || import.meta.env.BC_API_VERSION || 'v2.0';
  const accessToken = import.meta.env.VITE_BC_ACCESS_TOKEN || import.meta.env.BC_ACCESS_TOKEN;
  const apiKey = import.meta.env.VITE_BC_API_KEY || import.meta.env.BC_API_KEY;
  const timeout = (import.meta.env.VITE_BC_API_TIMEOUT || import.meta.env.BC_API_TIMEOUT) 
    ? parseInt((import.meta.env.VITE_BC_API_TIMEOUT || import.meta.env.BC_API_TIMEOUT) as string, 10) 
    : undefined;
  
  if (!baseUrl) {
    throw new Error('BC_API_BASE_URL environment variable is required (use VITE_BC_API_BASE_URL for Vite)');
  }
  
  if (!companyId) {
    throw new Error('BC_COMPANY_ID environment variable is required (use VITE_BC_COMPANY_ID for Vite)');
  }
  
  if (!accessToken && !apiKey) {
    throw new Error('Either BC_ACCESS_TOKEN or BC_API_KEY environment variable is required (use VITE_ prefix for Vite)');
  }
  
  return new BusinessCentralApiClient({
    baseUrl,
    companyId,
    apiVersion,
    accessToken,
    apiKey,
    timeout,
  });
}
