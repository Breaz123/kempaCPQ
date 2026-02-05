/**
 * Quote Builder Service
 * 
 * Combines configuration and pricing information into quote line items
 * and builds complete quotes with deterministic totals.
 */

import { MdfConfiguration } from '../../configuration/models/MdfConfiguration';
import { Quote, QuoteStatus } from '../models/Quote';
import {
  createQuoteLineItem,
  calculateLineTotal,
  generateLineDescription,
} from '../models/QuoteLineItem';
import { calculateQuoteTotals } from '../models/QuoteTotals';

/**
 * Price response structure from Pricing slice
 * 
 * This matches the expected PriceResponse interface from the Pricing slice.
 * We use this structure to avoid direct dependency on Pricing slice models.
 */
export interface PriceResponse {
  /** Base price per unit */
  basePrice: number;

  /** Additional prices for options/attributes */
  optionPrices: number[];

  /** Total price per unit (basePrice + sum of optionPrices) */
  totalPrice: number;

  /** Currency code */
  currency: string;
}

/**
 * Adds a line item to a quote
 * 
 * Combines configuration and pricing to create a quote line item,
 * then recalculates quote totals.
 * 
 * @param quote - The quote to add the line item to
 * @param productId - Product identifier
 * @param productName - Product name
 * @param configuration - MDF configuration
 * @param priceResponse - Price response from Pricing slice
 * @returns Updated quote with new line item and recalculated totals
 */
export function addLineItemToQuote(
  quote: Quote,
  productId: string,
  productName: string,
  configuration: MdfConfiguration,
  priceResponse: PriceResponse
): Quote {
  // Validate currency matches
  if (quote.totals.currency !== priceResponse.currency && quote.lineItems.length > 0) {
    throw new Error(
      `Currency mismatch: Quote uses ${quote.totals.currency}, but price is in ${priceResponse.currency}`
    );
  }

  // Create line item
  const lineItem = createQuoteLineItem(
    generateLineItemId(),
    productId,
    productName,
    configuration,
    configuration.quantity,
    priceResponse.totalPrice,
    priceResponse.currency
  );

  // Add line item to quote
  const updatedLineItems = [...quote.lineItems, lineItem];

  // Recalculate totals
  const lineTotals = updatedLineItems.map(item => item.lineTotal);
  const totals = calculateQuoteTotals(
    lineTotals,
    priceResponse.currency,
    0 // Tax rate: 0 for MVP (Business Central handles tax)
  );

  return {
    ...quote,
    lineItems: updatedLineItems,
    totals,
    status: QuoteStatus.Ready,
    updatedAt: new Date(),
  };
}

/**
 * Removes a line item from a quote
 * 
 * @param quote - The quote to remove the line item from
 * @param lineItemId - ID of the line item to remove
 * @returns Updated quote with line item removed and recalculated totals
 */
export function removeLineItemFromQuote(
  quote: Quote,
  lineItemId: string
): Quote {
  const updatedLineItems = quote.lineItems.filter(item => item.id !== lineItemId);

  // Recalculate totals
  const lineTotals = updatedLineItems.map(item => item.lineTotal);
  const totals = calculateQuoteTotals(
    lineTotals,
    quote.totals.currency,
    0 // Tax rate: 0 for MVP
  );

  // Update status to Draft if no line items remain
  const status =
    updatedLineItems.length === 0 ? QuoteStatus.Draft : QuoteStatus.Ready;

  return {
    ...quote,
    lineItems: updatedLineItems,
    totals,
    status,
    updatedAt: new Date(),
  };
}

/**
 * Updates the quantity of a line item
 * 
 * Note: This recalculates the line total and quote totals, but does not
 * re-fetch pricing from Business Central. The unit price remains the same.
 * 
 * @param quote - The quote to update
 * @param lineItemId - ID of the line item to update
 * @param newQuantity - New quantity
 * @returns Updated quote with recalculated totals
 */
export function updateLineItemQuantity(
  quote: Quote,
  lineItemId: string,
  newQuantity: number
): Quote {
  if (newQuantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const updatedLineItems = quote.lineItems.map(item => {
    if (item.id === lineItemId) {
      const updatedConfiguration = {
        ...item.configuration,
        quantity: newQuantity,
      };
      const lineTotal = calculateLineTotal(item.unitPrice, newQuantity);
      const description = generateLineDescription(
        item.productName,
        updatedConfiguration
      );

      return {
        ...item,
        configuration: updatedConfiguration,
        quantity: newQuantity,
        lineTotal,
        description,
      };
    }
    return item;
  });

  // Recalculate totals
  const lineTotals = updatedLineItems.map(item => item.lineTotal);
  const totals = calculateQuoteTotals(
    lineTotals,
    quote.totals.currency,
    0 // Tax rate: 0 for MVP
  );

  return {
    ...quote,
    lineItems: updatedLineItems,
    totals,
    updatedAt: new Date(),
  };
}

/**
 * Generates a unique line item ID
 * 
 * Uses timestamp + random number for uniqueness.
 * In a real system, this would use a proper ID generator.
 * 
 * @returns Unique line item ID
 */
function generateLineItemId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
