/**
 * Quote Line Item Model
 * 
 * Represents a single line item in a quote, combining configuration
 * and pricing information with a clear, human-readable description.
 */

import { MdfConfiguration, MdfStructure } from '../../configuration/models/MdfConfiguration';

/**
 * A single line item in a quote
 */
export interface QuoteLineItem {
  /** Unique identifier for this line item */
  id: string;

  /** Product identifier (e.g., product code) */
  productId: string;

  /** Product name */
  productName: string;

  /** The configuration used for this line item */
  configuration: MdfConfiguration;

  /** Quantity of items */
  quantity: number;

  /** Unit price (price per unit) */
  unitPrice: number;

  /** Total price for this line (unitPrice × quantity) */
  lineTotal: number;

  /** Human-readable description of this line item */
  description: string;

  /** Currency code (e.g., 'EUR', 'USD') */
  currency: string;

  /** Timestamp when this line item was added */
  addedAt: Date;
}

/**
 * Creates a new quote line item
 * 
 * @param id - Unique identifier for the line item
 * @param productId - Product identifier
 * @param productName - Product name
 * @param configuration - MDF configuration
 * @param quantity - Quantity
 * @param unitPrice - Unit price
 * @param currency - Currency code
 * @returns New quote line item with calculated lineTotal and description
 */
export function createQuoteLineItem(
  id: string,
  productId: string,
  productName: string,
  configuration: MdfConfiguration,
  quantity: number,
  unitPrice: number,
  currency: string
): QuoteLineItem {
  const lineTotal = calculateLineTotal(unitPrice, quantity);
  const description = generateLineDescription(productName, configuration);

  return {
    id,
    productId,
    productName,
    configuration,
    quantity,
    unitPrice,
    lineTotal,
    description,
    currency,
    addedAt: new Date(),
  };
}

/**
 * Calculates the line total (unitPrice × quantity)
 * 
 * Uses deterministic rounding to 2 decimal places for currency precision.
 * 
 * @param unitPrice - Price per unit
 * @param quantity - Quantity
 * @returns Line total rounded to 2 decimal places
 */
export function calculateLineTotal(unitPrice: number, quantity: number): number {
  const total = unitPrice * quantity;
  return roundToCurrencyPrecision(total);
}

/**
 * Generates a human-readable description for a quote line item
 * 
 * Format: "Product Name - [Dimensions] - [Coating Sides] - Qty: [quantity]"
 * Example: "MDF Powder Coating - 1000×500×18mm - Top, Bottom, Front - Qty: 5"
 * 
 * @param productName - Name of the product
 * @param configuration - MDF configuration
 * @returns Human-readable description
 */
export function generateLineDescription(
  productName: string,
  configuration: MdfConfiguration
): string {
  const dimensions = `${configuration.lengthMm}×${configuration.widthMm}×${configuration.heightMm}mm`;
  const sides = formatCoatingSides(configuration.coatingSides);

  let structurePart = '';
  if (configuration.structure) {
    const structureLabel = formatStructure(configuration.structure);
    structurePart = ` - Structuur: ${structureLabel}`;
  }

  return `${productName} - ${dimensions} - ${sides}${structurePart} - Qty: ${configuration.quantity}`;
}

/**
 * Formats coating sides array into a readable string
 * 
 * @param sides - Array of coating sides
 * @returns Formatted string (e.g., "Top, Bottom, Front")
 */
function formatCoatingSides(sides: string[]): string {
  if (sides.length === 0) {
    return 'No sides';
  }
  return sides.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
}

/**
 * Formats structure enum into a readable label
 */
function formatStructure(structure: MdfStructure): string {
  const map: Record<MdfStructure, string> = {
    [MdfStructure.Line]: 'Line',
    [MdfStructure.Stone]: 'Stone',
    [MdfStructure.Leather]: 'Leather',
    [MdfStructure.Linen]: 'Linen',
  };

  return map[structure] ?? String(structure);
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
