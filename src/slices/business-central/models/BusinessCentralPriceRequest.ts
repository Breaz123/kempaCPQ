/**
 * Business Central Price Request Model
 * 
 * Represents a request to calculate price for a configured product.
 */

/**
 * Request to calculate price from Business Central
 */
export interface BusinessCentralPriceRequest {
  /** Item number (product code) */
  itemNumber: string;
  
  /** Variant code (optional) */
  variantCode?: string;
  
  /** Quantity */
  quantity: number;
  
  /** Unit of measure (optional) */
  unitOfMeasure?: string;
  
  /** Customer number (optional, for customer-specific pricing) */
  customerNumber?: string;
  
  /** Additional attributes/configuration (optional) */
  attributes?: Record<string, unknown>;
}
