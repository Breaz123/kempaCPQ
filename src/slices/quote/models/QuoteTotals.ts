/**
 * Quote Totals Model
 * 
 * Represents the summary totals for a quote.
 * All calculations are deterministic and use consistent rounding.
 */

/**
 * Summary totals for a quote
 */
export interface QuoteTotals {
  /** Subtotal (sum of all line totals before tax) */
  subtotal: number;

  /** Tax amount (calculated from subtotal) */
  tax: number;

  /** Total amount (subtotal + tax) */
  total: number;

  /** Currency code (e.g., 'EUR', 'USD') */
  currency: string;

  /** Number of line items */
  lineItemCount: number;
}

/**
 * Calculates quote totals from line item totals
 * 
 * Calculation order:
 * 1. Sum all line totals → subtotal
 * 2. Calculate tax from subtotal → tax
 * 3. Add subtotal + tax → total
 * 
 * All amounts are rounded to 2 decimal places for currency precision.
 * 
 * @param lineTotals - Array of line item totals
 * @param currency - Currency code
 * @param taxRate - Tax rate as decimal (e.g., 0.21 for 21%)
 * @returns Quote totals
 */
export function calculateQuoteTotals(
  lineTotals: number[],
  currency: string,
  taxRate: number = 0
): QuoteTotals {
  // Sum all line totals
  const subtotal = roundToCurrencyPrecision(
    lineTotals.reduce((sum, total) => sum + total, 0)
  );

  // Calculate tax
  const tax = roundToCurrencyPrecision(subtotal * taxRate);

  // Calculate total
  const total = roundToCurrencyPrecision(subtotal + tax);

  return {
    subtotal,
    tax,
    total,
    currency,
    lineItemCount: lineTotals.length,
  };
}

/**
 * Rounds a number to currency precision (2 decimal places)
 * 
 * Uses standard rounding (round half up) for deterministic results.
 * 
 * @param value - Value to round
 * @returns Rounded value with 2 decimal places
 */
function roundToCurrencyPrecision(value: number): number {
  return Math.round(value * 100) / 100;
}
