/**
 * Quote API Service
 * 
 * Handles sales quote creation in Business Central API.
 */

import { BusinessCentralApiClient } from './BusinessCentralApiClient';
import { BusinessCentralQuoteRequest } from '../models/BusinessCentralQuoteRequest';
import { BusinessCentralQuoteResponse } from '../models/BusinessCentralQuoteResponse';
import { QuoteSubmissionData } from '../../../shared/types/QuoteSubmissionData';
import { ApiError, ApiErrorCode, createApiError } from '../models/ApiError';

/**
 * Service for creating sales quotes in Business Central
 */
export class QuoteApiService {
  constructor(private readonly apiClient: BusinessCentralApiClient) {}
  
  /**
   * Creates a sales quote in Business Central
   * 
   * Transforms the generic QuoteSubmissionData format into Business Central's
   * specific API format and submits it.
   * 
   * @param submissionData - Generic quote submission data
   * @returns Business Central quote response with quote number
   * @throws ApiError if the request fails
   */
  async submitQuote(submissionData: QuoteSubmissionData): Promise<BusinessCentralQuoteResponse> {
    try {
      // Transform generic format to BC format
      const bcRequest = this.transformToBusinessCentralFormat(submissionData);
      
      // Submit to Business Central API
      const response = await this.apiClient.post<BusinessCentralQuoteResponse>(
        '/salesQuotes',
        bcRequest
      );
      
      return response;
    } catch (error) {
      const apiError = createApiError(error);
      
      // Provide more specific error messages
      if (apiError.code === ApiErrorCode.BadRequest || apiError.statusCode === 400) {
        throw createApiError(
          error,
          'Invalid quote data. Please check customer number, item numbers, and quantities.'
        );
      }
      
      if (apiError.code === ApiErrorCode.NotFound || apiError.statusCode === 404) {
        throw createApiError(
          error,
          'Customer or product not found in Business Central.'
        );
      }
      
      throw createApiError(error, 'Failed to create sales quote in Business Central');
    }
  }
  
  /**
   * Transforms generic QuoteSubmissionData to Business Central format
   * 
   * @param submissionData - Generic submission data
   * @returns Business Central quote request
   */
  private transformToBusinessCentralFormat(
    submissionData: QuoteSubmissionData
  ): BusinessCentralQuoteRequest {
    // Map line items to BC format
    const salesQuoteLines = submissionData.lines.map((line, index) => ({
      itemNumber: line.itemNumber,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineAmount: line.lineAmount,
      currencyCode: line.currencyCode,
      lineNumber: line.lineNumber || index + 1,
    }));
    
    return {
      customerNumber: submissionData.customerNumber,
      currencyCode: submissionData.currencyCode,
      salesQuoteLines,
    };
  }
  
  /**
   * Gets a sales quote by number
   * 
   * @param quoteNumber - Quote number
   * @returns Quote or null if not found
   * @throws ApiError if the request fails (except 404)
   */
  async getQuoteByNumber(quoteNumber: string): Promise<BusinessCentralQuoteResponse | null> {
    try {
      const response = await this.apiClient.get<{ value: BusinessCentralQuoteResponse[] }>(
        `/salesQuotes?$filter=number eq '${encodeURIComponent(quoteNumber)}'`
      );
      
      const quotes = response.value || [];
      return quotes.length > 0 ? quotes[0] : null;
    } catch (error) {
      const apiError = createApiError(error);
      
      // Return null for 404 (not found)
      if (apiError.code === ApiErrorCode.NotFound || apiError.statusCode === 404) {
        return null;
      }
      
      throw createApiError(error, `Failed to fetch quote ${quoteNumber} from Business Central`);
    }
  }
  
  /**
   * Gets a sales quote by ID (UUID)
   * 
   * @param quoteId - Quote ID (UUID)
   * @returns Quote or null if not found
   * @throws ApiError if the request fails (except 404)
   */
  async getQuoteById(quoteId: string): Promise<BusinessCentralQuoteResponse | null> {
    try {
      const quote = await this.apiClient.get<BusinessCentralQuoteResponse>(
        `/salesQuotes(${quoteId})`
      );
      return quote;
    } catch (error) {
      const apiError = createApiError(error);
      
      // Return null for 404 (not found)
      if (apiError.code === ApiErrorCode.NotFound || apiError.statusCode === 404) {
        return null;
      }
      
      throw createApiError(error, `Failed to fetch quote ${quoteId} from Business Central`);
    }
  }
}
