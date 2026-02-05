/**
 * API Error Model
 * 
 * Represents errors from Business Central API calls.
 * Provides structured error information for error handling.
 */

/**
 * Error codes that can be returned by Business Central API
 */
export enum ApiErrorCode {
  /** Authentication failed (401) */
  AuthenticationFailed = 'AUTHENTICATION_FAILED',
  
  /** Authorization failed (403) */
  AuthorizationFailed = 'AUTHORIZATION_FAILED',
  
  /** Resource not found (404) */
  NotFound = 'NOT_FOUND',
  
  /** Bad request (400) */
  BadRequest = 'BAD_REQUEST',
  
  /** Rate limit exceeded (429) */
  RateLimitExceeded = 'RATE_LIMIT_EXCEEDED',
  
  /** Server error (500+) */
  ServerError = 'SERVER_ERROR',
  
  /** Network/connection error */
  NetworkError = 'NETWORK_ERROR',
  
  /** Request timeout */
  Timeout = 'TIMEOUT',
  
  /** Unknown error */
  Unknown = 'UNKNOWN',
}

/**
 * Structured API error
 */
export interface ApiError {
  /** Error code */
  code: ApiErrorCode;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details (optional) */
  details?: Record<string, unknown>;
  
  /** HTTP status code (if available) */
  statusCode?: number;
  
  /** Original error (if available) */
  originalError?: unknown;
}

/**
 * Creates an ApiError from an unknown error
 * 
 * @param error - The error to convert
 * @param defaultMessage - Default message if error doesn't have one
 * @returns Structured ApiError
 */
export function createApiError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): ApiError {
  // Handle fetch Response errors
  if (error instanceof Response) {
    return createApiErrorFromResponse(error);
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return {
      code: ApiErrorCode.Unknown,
      message: error.message || defaultMessage,
      originalError: error,
    };
  }
  
  // Handle objects with error-like structure
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    // Check for Business Central API error format
    if (errorObj.error && typeof errorObj.error === 'object') {
      const bcError = errorObj.error as Record<string, unknown>;
      return {
        code: mapBcErrorCode(bcError.code as string),
        message: (bcError.message as string) || defaultMessage,
        details: bcError,
        originalError: error,
      };
    }
    
    return {
      code: ApiErrorCode.Unknown,
      message: (errorObj.message as string) || defaultMessage,
      details: errorObj,
      originalError: error,
    };
  }
  
  // Fallback for primitive errors
  return {
    code: ApiErrorCode.Unknown,
    message: String(error) || defaultMessage,
    originalError: error,
  };
}

/**
 * Creates an ApiError from a fetch Response
 * 
 * @param response - The HTTP response
 * @returns Structured ApiError
 */
function createApiErrorFromResponse(response: Response): ApiError {
  const statusCode = response.status;
  const code = mapHttpStatusCode(statusCode);
  
  return {
    code,
    message: `Business Central API error: ${response.statusText}`,
    statusCode,
  };
}

/**
 * Maps HTTP status code to ApiErrorCode
 * 
 * @param statusCode - HTTP status code
 * @returns Corresponding ApiErrorCode
 */
function mapHttpStatusCode(statusCode: number): ApiErrorCode {
  if (statusCode === 401) return ApiErrorCode.AuthenticationFailed;
  if (statusCode === 403) return ApiErrorCode.AuthorizationFailed;
  if (statusCode === 404) return ApiErrorCode.NotFound;
  if (statusCode === 400) return ApiErrorCode.BadRequest;
  if (statusCode === 429) return ApiErrorCode.RateLimitExceeded;
  if (statusCode >= 500) return ApiErrorCode.ServerError;
  return ApiErrorCode.Unknown;
}

/**
 * Maps Business Central error code to ApiErrorCode
 * 
 * @param bcCode - Business Central error code
 * @returns Corresponding ApiErrorCode
 */
function mapBcErrorCode(bcCode: string): ApiErrorCode {
  const upperCode = bcCode.toUpperCase();
  
  if (upperCode.includes('AUTH') || upperCode.includes('UNAUTHORIZED')) {
    return ApiErrorCode.AuthenticationFailed;
  }
  if (upperCode.includes('FORBIDDEN') || upperCode.includes('PERMISSION')) {
    return ApiErrorCode.AuthorizationFailed;
  }
  if (upperCode.includes('NOT_FOUND') || upperCode.includes('NOTFOUND')) {
    return ApiErrorCode.NotFound;
  }
  if (upperCode.includes('BAD_REQUEST') || upperCode.includes('VALIDATION')) {
    return ApiErrorCode.BadRequest;
  }
  if (upperCode.includes('RATE_LIMIT') || upperCode.includes('THROTTLE')) {
    return ApiErrorCode.RateLimitExceeded;
  }
  
  return ApiErrorCode.Unknown;
}

/**
 * Checks if an error is retryable
 * 
 * @param error - The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  return (
    error.code === ApiErrorCode.NetworkError ||
    error.code === ApiErrorCode.Timeout ||
    error.code === ApiErrorCode.ServerError ||
    error.code === ApiErrorCode.RateLimitExceeded
  );
}
