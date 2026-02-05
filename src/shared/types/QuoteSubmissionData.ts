/**
 * Quote Submission Data Contract
 * 
 * This is a shared contract between the Quote slice and Business Central Integration slice.
 * It provides a generic format for quote submission that avoids tight coupling
 * between the slices.
 * 
 * The Business Central Integration slice will transform this generic format
 * into the specific Business Central API format.
 */

/**
 * A single line item in quote submission data
 */
export interface QuoteSubmissionLine {
  /** Line number (1-based) */
  lineNumber: number;

  /** Product/item number */
  itemNumber: string;

  /** Human-readable description */
  description: string;

  /** Quantity */
  quantity: number;

  /** Unit price */
  unitPrice: number;

  /** Line total amount (unitPrice × quantity) */
  lineAmount: number;

  /** Currency code (ISO format, e.g., 'EUR', 'USD') */
  currencyCode: string;
}

/**
 * Summary totals for quote submission
 */
export interface QuoteSubmissionTotals {
  /** Subtotal before tax */
  subtotal: number;

  /** Tax amount */
  tax: number;

  /** Total amount */
  total: number;
}

/**
 * Generic quote submission data format
 * 
 * This format is independent of Business Central's specific API structure.
 * The Business Central Integration slice will transform this to the BC format.
 */
export interface QuoteSubmissionData {
  /** Business Central customer number */
  customerNumber: string;

  /** Currency code for the entire quote */
  currencyCode: string;

  /** Line items */
  lines: QuoteSubmissionLine[];

  /** Summary totals (for reference, BC will recalculate) */
  totals: QuoteSubmissionTotals;
}
