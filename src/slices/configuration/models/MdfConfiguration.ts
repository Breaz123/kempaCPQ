/**
 * MDF Powder Coating Configuration Model
 * 
 * Represents a configuration for MDF powder coating with dimensions,
 * quantity, and which sides need coating.
 */

/**
 * Represents which sides of an MDF piece need powder coating
 */
export enum CoatingSide {
  Top = 'top',
  Bottom = 'bottom',
  Front = 'front',
  Back = 'back',
  Left = 'left',
  Right = 'right',
}

/**
 * Configuration for MDF powder coating
 * 
 * Dimensions are in millimeters (mm) for user input precision.
 * Surface area calculations convert to square meters (m²).
 */
export interface MdfConfiguration {
  /** Unique identifier for this configuration */
  id: string;
  
  /** Length of the MDF piece in millimeters */
  lengthMm: number;
  
  /** Width of the MDF piece in millimeters */
  widthMm: number;
  
  /** Height (thickness) of the MDF piece in millimeters */
  heightMm: number;
  
  /** Number of pieces to coat */
  quantity: number;
  
  /** Sides that need powder coating */
  coatingSides: CoatingSide[];
  
  /** Timestamp when configuration was created */
  createdAt: Date;
  
  /** Timestamp when configuration was last updated */
  updatedAt: Date;
}

/**
 * Creates a new MDF configuration with default values
 */
export function createMdfConfiguration(
  id: string,
  lengthMm: number,
  widthMm: number,
  heightMm: number,
  quantity: number,
  coatingSides: CoatingSide[]
): MdfConfiguration {
  const now = new Date();
  return {
    id,
    lengthMm,
    widthMm,
    heightMm,
    quantity,
    coatingSides,
    createdAt: now,
    updatedAt: now,
  };
}
