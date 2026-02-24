/**
 * MDF Powder Coating Configuration Model
 * 
 * Represents a configuration for MDF powder coating with dimensions,
 * quantity, and which sides need coating.
 */

import type { DrillPosition } from './DrillPosition';

/**
 * Single dimension set for one group of boards.
 *
 * This allows één configuratie te bevatten uit meerdere
 * afmetingen/aantallen (bijv. 5× 200×200 en 4× 100×200).
 */
export interface DimensionSet {
  /** Unique identifier for this dimension set (stable for UI lists) */
  id: string;

  /** Length of the MDF piece in millimeters */
  lengthMm: number;

  /** Width of the MDF piece in millimeters */
  widthMm: number;

  /** Height (thickness) of the MDF piece in millimeters */
  heightMm: number;

  /** Number of pieces with these dimensions */
  quantity: number;
}

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
 * Available surface structures for MDF powder coating
 *
 * These correspond to the Kempa structuren:
 * - Line
 * - Stone
 * - Leather
 * - Linen
 */
export enum MdfStructure {
  Line = 'line',
  Stone = 'stone',
  Leather = 'leather',
  Linen = 'linen',
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

  /** Optional: Surface structure (Line, Stone, Leather, Linen) */
  structure?: MdfStructure;
  
  /** Optional: Drill positions for holes (handles, hinges, etc.) */
  drillPositions?: DrillPosition[];

  /**
   * Optional: multiple dimension sets when a single request contains
   * verschillende afmetingen/aantallen.
   *
   * - If present, `quantity` SHOULD gelijk zijn aan de som van alle
   *   `dimensionSets[i].quantity`.
   * - `lengthMm`, `widthMm` en `heightMm` blijven de "primaire" set
   *   (meestal de eerste rij in de UI) voor compatibiliteit met
   *   bestaande code en Business Central-attributen.
   */
  dimensionSets?: DimensionSet[];
  
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
