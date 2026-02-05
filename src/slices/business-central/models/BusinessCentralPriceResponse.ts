/**
 * Business Central Price Response Model
 * 
 * Represents the response from a price calculation request.
 */

/**
 * Response from Business Central price calculation
 */
export interface BusinessCentralPriceResponse {
  /** Unit price */
  unitPrice: number;
  
  /** Total price (unitPrice × quantity) */
  totalPrice: number;
  
  /** Currency code */
  currencyCode: string;
  
  /** Item number */
  itemNumber: string;
  
  /** Quantity used for calculation */
  quantity: number;
  
  /** Unit of measure */
  unitOfMeasure?: string;
  
  /** Additional pricing details (optional) */
  details?: Record<string, unknown>;
}
