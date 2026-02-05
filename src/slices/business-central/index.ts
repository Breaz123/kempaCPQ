/**
 * Business Central Integration Slice - Public Exports
 * 
 * This module exports the public interface of the Business Central Integration slice.
 * Other slices should only import from this file.
 * 
 * This slice handles all communication with Business Central API:
 * - Product catalog retrieval
 * - Price calculation
 * - Sales quote creation
 * - Error handling
 */

import { createApiClientFromEnv as createClientFromEnv, BusinessCentralApiClient } from './services/BusinessCentralApiClient';
import { ProductApiService } from './services/ProductApiService';
import { PriceApiService } from './services/PriceApiService';
import { QuoteApiService } from './services/QuoteApiService';

// Models
export type { ApiError } from './models/ApiError';
export { ApiErrorCode, createApiError, isRetryableError } from './models/ApiError';

export type { BusinessCentralProduct } from './models/BusinessCentralProduct';

export type { BusinessCentralPriceRequest } from './models/BusinessCentralPriceRequest';

export type { BusinessCentralPriceResponse } from './models/BusinessCentralPriceResponse';

export type {
  BusinessCentralQuoteRequest,
  BusinessCentralQuoteLine,
} from './models/BusinessCentralQuoteRequest';

export type { BusinessCentralQuoteResponse } from './models/BusinessCentralQuoteResponse';

// API Client
export {
  BusinessCentralApiClient,
  createApiClientFromEnv,
} from './services/BusinessCentralApiClient';

export type { BusinessCentralApiConfig } from './services/BusinessCentralApiClient';

// Services
export { ProductApiService } from './services/ProductApiService';

export { PriceApiService } from './services/PriceApiService';

export { QuoteApiService } from './services/QuoteApiService';

/**
 * Convenience function to create all services from an API client
 * 
 * @param apiClient - Configured API client
 * @returns Object with all services
 */
export function createBusinessCentralServices(
  apiClient: BusinessCentralApiClient
): {
  products: ProductApiService;
  pricing: PriceApiService;
  quotes: QuoteApiService;
} {
  return {
    products: new ProductApiService(apiClient),
    pricing: new PriceApiService(apiClient),
    quotes: new QuoteApiService(apiClient),
  };
}

/**
 * Convenience function to create all services from environment variables
 * 
 * Reads configuration from environment variables and creates:
 * - API client
 * - Product service
 * - Price service
 * - Quote service
 * 
 * @returns Object with API client and all services
 * @throws Error if required environment variables are missing
 */
export function createBusinessCentralServicesFromEnv() {
  const apiClient = createClientFromEnv();
  return {
    apiClient,
    ...createBusinessCentralServices(apiClient),
  };
}
