/**
 * Drill Position Model
 * 
 * Represents a drill position for holes (e.g., for handles, hinges, grips).
 */

import { CoatingSide } from './MdfConfiguration';

/**
 * Represents a single drill position
 */
export interface DrillPosition {
  /** Unique identifier for this drill position */
  id: string;
  
  /** Which side of the board the drill is on */
  side: CoatingSide;
  
  /** Position along the first dimension (in cm) */
  position1Cm: number;
  
  /** Position along the second dimension (in cm) */
  position2Cm: number;
  
  /** Optional: diameter of the hole in mm */
  diameterMm?: number;
}

/**
 * Creates a new drill position
 */
export function createDrillPosition(
  id: string,
  side: CoatingSide,
  position1Cm: number,
  position2Cm: number,
  diameterMm?: number
): DrillPosition {
  return {
    id,
    side,
    position1Cm,
    position2Cm,
    diameterMm: diameterMm || 5, // Default 5mm diameter
  };
}
