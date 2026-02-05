/**
 * Business Central Quote Request Model
 * 
 * Represents a request to create a sales quote in Business Central.
 * This is the internal BC format (not the generic QuoteSubmissionData).
 */

/**
 * Sales quote line item for Business Central API
 */
export interface BusinessCentralQuoteLine {
  /** Item ID (UUID, optional - can use itemNumber instead) */
  itemId?: string;
  
  /** Item number (product code) */
  itemNumber: string;
  
  /** Line description */
  description: string;
  
  /** Quantity */
  quantity: number;
  
  /** Unit price */
  unitPrice: number;
  
  /** Line amount (unitPrice × quantity) */
  lineAmount: number;
  
  /** Unit of measure (optional) */
  unitOfMeasure?: string;
  
  /** Currency code */
  currencyCode: string;
  
  /** Line number (1-based) */
  lineNumber?: number;
}

/**
 * Request to create a sales quote in Business Central
 */
export interface BusinessCentralQuoteRequest {
  /** Customer number */
  customerNumber: string;
  
  /** Currency code */
  currencyCode: string;
  
  /** Sales quote lines */
  salesQuoteLines: BusinessCentralQuoteLine[];
  
  /** External document number (optional) */
  externalDocumentNumber?: string;
  
  /** Requested delivery date (optional) */
  requestedDeliveryDate?: string;
  
  /** Additional fields (optional) */
  [key: string]: unknown;
}
