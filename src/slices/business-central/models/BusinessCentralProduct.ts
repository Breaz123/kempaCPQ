/**
 * Business Central Product Model
 * 
 * Represents a product/item from Business Central API.
 * This is the raw format returned by BC API.
 */

/**
 * Business Central product/item
 */
export interface BusinessCentralProduct {
  /** Item ID (UUID) */
  id: string;
  
  /** Item number (product code) */
  number: string;
  
  /** Item description */
  description: string;
  
  /** Display name */
  displayName?: string;
  
  /** Unit price */
  unitPrice: number;
  
  /** Currency code */
  currencyCode: string;
  
  /** Unit of measure */
  unitOfMeasure?: string;
  
  /** Item category code */
  itemCategoryCode?: string;
  
  /** Item category description */
  itemCategoryDescription?: string;
  
  /** Blocked status */
  blocked?: boolean;
  
  /** Type (Inventory, Service, Non-Inventory) */
  type?: string;
  
  /** Additional attributes/metadata */
  [key: string]: unknown;
}
