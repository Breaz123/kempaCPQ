/**
 * Quote Model
 * 
 * Represents a complete quote combining configuration and pricing information.
 * Quotes are immutable after creation (no editing in MVP scope).
 */

import { QuoteLineItem } from './QuoteLineItem';
import { QuoteTotals } from './QuoteTotals';

/**
 * Status of a quote
 */
export enum QuoteStatus {
  /** Quote is being built (draft) */
  Draft = 'draft',

  /** Quote is complete and ready for submission */
  Ready = 'ready',

  /** Quote has been submitted to Business Central */
  Submitted = 'submitted',
}

/**
 * A complete quote
 */
export interface Quote {
  /** Unique identifier for this quote */
  id: string;

  /** Line items in this quote */
  lineItems: QuoteLineItem[];

  /** Summary totals */
  totals: QuoteTotals;

  /** Status of the quote */
  status: QuoteStatus;

  /** Timestamp when quote was created */
  createdAt: Date;

  /** Timestamp when quote was last updated */
  updatedAt: Date;
}

/**
 * Creates a new empty quote
 * 
 * @param id - Unique identifier for the quote
 * @param currency - Currency code (default: 'EUR')
 * @returns New quote with empty line items and zero totals
 */
export function createQuote(id: string, currency: string = 'EUR'): Quote {
  const now = new Date();
  
  const totals: QuoteTotals = {
    subtotal: 0,
    tax: 0,
    total: 0,
    currency,
    lineItemCount: 0,
  };

  return {
    id,
    lineItems: [],
    totals,
    status: QuoteStatus.Draft,
    createdAt: now,
    updatedAt: now,
  };
}
