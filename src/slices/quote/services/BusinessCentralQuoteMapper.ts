/**
 * Business Central Quote Mapper
 * 
 * Maps Quote domain model to Business Central Sales Quote API format.
 * 
 * Mapping Strategy:
 * - Quote line items → BC salesQuoteLines
 * - Configuration details → BC line description field
 * - Prices → BC unitPrice and lineAmount
 * - Currency → BC currencyCode
 * 
 * Business Central API Reference (v2.0):
 * - Sales Quote: POST /api/v2.0/companies({companyId})/salesQuotes
 * - Sales Quote Lines: Array of salesQuoteLines in the request body
 */

import { Quote, QuoteStatus } from '../models/Quote';
import { QuoteSubmissionData } from '../../../shared/types/QuoteSubmissionData';

/**
 * Maps a Quote to Business Central Sales Quote submission format
 * 
 * Business Central Sales Quote Structure:
 * {
 *   "customerNumber": "C00123",
 *   "salesQuoteLines": [
 *     {
 *       "itemId": "uuid",
 *       "itemNumber": "ITEM001",
 *       "description": "Line description",
 *       "quantity": 5,
 *       "unitPrice": 100.00,
 *       "lineAmount": 500.00,
 *       "currencyCode": "EUR"
 *     }
 *   ]
 * }
 * 
 * Mapping Decisions:
 * 1. Line descriptions: Use generated description from QuoteLineItem
 *    - Rationale: Provides clear, human-readable context in BC
 *    - Format: "Product Name - Dimensions - Coating Sides - Qty: X"
 * 
 * 2. Item identification: Use productId as itemNumber
 *    - Rationale: BC uses item numbers to identify products
 *    - Note: itemId (UUID) may need to be resolved from itemNumber
 * 
 * 3. Prices: Map unitPrice and calculate lineAmount
 *    - Rationale: BC requires both unit and line amounts
 *    - Line amount = unitPrice × quantity (already calculated in Quote)
 * 
 * 4. Currency: Map currency code directly
 *    - Rationale: BC uses ISO currency codes
 *    - Assumption: Single currency per quote (MVP constraint)
 * 
 * 5. Customer number: Required by BC but not in Quote model
 *    - Rationale: BC requires customer for sales quotes
 *    - Solution: Pass as parameter (will be provided by caller)
 * 
 * @param quote - The quote to map
 * @param customerNumber - Business Central customer number (required by BC API)
 * @returns QuoteSubmissionData in generic format (BC Integration slice will transform further)
 */
export function mapQuoteToBusinessCentral(
  quote: Quote,
  customerNumber: string
): QuoteSubmissionData {
  if (quote.lineItems.length === 0) {
    throw new Error('Cannot submit quote with no line items');
  }

  if (quote.status === QuoteStatus.Submitted) {
    throw new Error('Quote has already been submitted');
  }

  // Map line items
  const lines = quote.lineItems.map((lineItem, index) => ({
    lineNumber: index + 1, // BC uses 1-based line numbers
    itemNumber: lineItem.productId,
    description: lineItem.description,
    quantity: lineItem.quantity,
    unitPrice: lineItem.unitPrice,
    lineAmount: lineItem.lineTotal,
    currencyCode: lineItem.currency,
    // Include configuration details in description for BC visibility
    // BC may have additional fields for variant codes, attributes, etc.
  }));

  return {
    customerNumber,
    currencyCode: quote.totals.currency,
    lines,
    // Include summary totals for reference (BC will recalculate)
    totals: {
      subtotal: quote.totals.subtotal,
      tax: quote.totals.tax,
      total: quote.totals.total,
    },
  };
}
