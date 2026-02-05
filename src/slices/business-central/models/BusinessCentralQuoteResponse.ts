/**
 * Business Central Quote Response Model
 * 
 * Represents the response from creating a sales quote.
 */

/**
 * Response from Business Central quote creation
 */
export interface BusinessCentralQuoteResponse {
  /** Quote ID (UUID) */
  id: string;
  
  /** Quote number (human-readable) */
  number: string;
  
  /** Status */
  status: string;
  
  /** Customer number */
  customerNumber: string;
  
  /** Currency code */
  currencyCode: string;
  
  /** Creation date/time */
  createdDateTime?: string;
  
  /** Last modified date/time */
  lastModifiedDateTime?: string;
  
  /** Document date */
  documentDate?: string;
  
  /** Additional fields (optional) */
  [key: string]: unknown;
}
