/**
 * Product API Service
 * 
 * Handles product catalog retrieval from Business Central API.
 */

import { BusinessCentralApiClient } from './BusinessCentralApiClient';
import { BusinessCentralProduct } from '../models/BusinessCentralProduct';
import { ApiErrorCode, createApiError } from '../models/ApiError';

/**
 * Service for fetching products from Business Central
 */
export class ProductApiService {
  constructor(private readonly apiClient: BusinessCentralApiClient) {}
  
  /**
   * Gets all products from Business Central
   * 
   * @returns Array of products
   * @throws ApiError if the request fails
   */
  async getProducts(): Promise<BusinessCentralProduct[]> {
    try {
      const response = await this.apiClient.get<{ value: BusinessCentralProduct[] }>('/items');
      return response.value || [];
    } catch (error) {
      throw createApiError(error, 'Failed to fetch products from Business Central');
    }
  }
  
  /**
   * Gets a product by item number
   * 
   * @param itemNumber - Item number (product code)
   * @returns Product or null if not found
   * @throws ApiError if the request fails (except 404)
   */
  async getProductByNumber(itemNumber: string): Promise<BusinessCentralProduct | null> {
    try {
      // Try to get by number using filter
      const response = await this.apiClient.get<{ value: BusinessCentralProduct[] }>(
        `/items?$filter=number eq '${encodeURIComponent(itemNumber)}'`
      );
      
      const products = response.value || [];
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      const apiError = createApiError(error);
      
      // Return null for 404 (not found)
      if (apiError.code === ApiErrorCode.NotFound || apiError.statusCode === 404) {
        return null;
      }
      
      throw createApiError(error, `Failed to fetch product ${itemNumber} from Business Central`);
    }
  }
  
  /**
   * Gets a product by ID (UUID)
   * 
   * @param itemId - Item ID (UUID)
   * @returns Product or null if not found
   * @throws ApiError if the request fails (except 404)
   */
  async getProductById(itemId: string): Promise<BusinessCentralProduct | null> {
    try {
      const product = await this.apiClient.get<BusinessCentralProduct>(`/items(${itemId})`);
      return product;
    } catch (error) {
      const apiError = createApiError(error);
      
      // Return null for 404 (not found)
      if (apiError.code === ApiErrorCode.NotFound || apiError.statusCode === 404) {
        return null;
      }
      
      throw createApiError(error, `Failed to fetch product ${itemId} from Business Central`);
    }
  }
}
