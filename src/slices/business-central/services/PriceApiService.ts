/**
 * Price API Service
 * 
 * Handles price calculation requests to Business Central API.
 */

import { BusinessCentralApiClient } from './BusinessCentralApiClient';
import { BusinessCentralPriceRequest } from '../models/BusinessCentralPriceRequest';
import { BusinessCentralPriceResponse } from '../models/BusinessCentralPriceResponse';
import { ApiErrorCode, createApiError } from '../models/ApiError';

/**
 * Service for fetching prices from Business Central
 */
export class PriceApiService {
  constructor(private readonly apiClient: BusinessCentralApiClient) {}
  
  /**
   * Calculates price for a configured product
   * 
   * Business Central API approach:
   * - Option 1: Use item unit price endpoint with query parameters
   * - Option 2: Create a temporary sales quote line and get price
   * - Option 3: Use dedicated pricing endpoint (if available)
   * 
   * This implementation uses Option 1 (item unit price) as it's the simplest
   * and most direct approach for MVP.
   * 
   * @param request - Price calculation request
   * @returns Price response with unit and total prices
   * @throws ApiError if the request fails
   */
  async calculatePrice(request: BusinessCentralPriceRequest): Promise<BusinessCentralPriceResponse> {
    try {
      // First, get the item to retrieve its base unit price
      // Business Central API returns { value: [...] } for filtered queries
      const itemResponse = await this.apiClient.get<{
        value: Array<{
          id: string;
          number: string;
          unitPrice: number;
          currencyCode: string;
          unitOfMeasure?: string;
        }>;
      }>(`/items?$filter=number eq '${encodeURIComponent(request.itemNumber)}'&$select=id,number,unitPrice,currencyCode,unitOfMeasure`);
      
      const items = itemResponse.value || [];
      
      if (items.length === 0) {
        throw createApiError(
          new Error('Item not found'),
          `Product ${request.itemNumber} not found in Business Central`
        );
      }
      
      const itemData = items[0];
      
      // Calculate total price
      const unitPrice = itemData.unitPrice || 0;
      const quantity = request.quantity || 1;
      const totalPrice = unitPrice * quantity;
      
      return {
        unitPrice,
        totalPrice: this.roundToCurrencyPrecision(totalPrice),
        currencyCode: itemData.currencyCode || 'EUR',
        itemNumber: itemData.number,
        quantity,
        unitOfMeasure: request.unitOfMeasure || itemData.unitOfMeasure,
        details: {
          itemId: itemData.id,
          variantCode: request.variantCode,
          customerNumber: request.customerNumber,
          attributes: request.attributes,
        },
      };
    } catch (error) {
      const apiError = createApiError(error);
      
      // Re-throw with more context
      if (apiError.code === ApiErrorCode.NotFound || apiError.statusCode === 404) {
        throw createApiError(
          error,
          `Product ${request.itemNumber} not found in Business Central`
        );
      }
      
      throw createApiError(error, `Failed to calculate price for product ${request.itemNumber}`);
    }
  }
  
  /**
   * Gets unit price for an item
   * 
   * @param itemNumber - Item number
   * @param customerNumber - Optional customer number for customer-specific pricing
   * @returns Unit price
   * @throws ApiError if the request fails
   */
  async getUnitPrice(itemNumber: string, customerNumber?: string): Promise<number> {
    const response = await this.calculatePrice({
      itemNumber,
      quantity: 1,
      customerNumber,
    });
    
    return response.unitPrice;
  }
  
  /**
   * Rounds a number to currency precision (2 decimal places)
   */
  private roundToCurrencyPrecision(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
