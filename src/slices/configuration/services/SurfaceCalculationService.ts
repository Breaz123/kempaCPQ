/**
 * Surface Calculation Service for MDF Configuration
 * 
 * Provides deterministic surface area calculations for MDF powder coating.
 * All calculations return results in square meters (m²).
 */

import { MdfConfiguration, CoatingSide } from '../models/MdfConfiguration';

/**
 * Result of surface area calculation
 */
export interface SurfaceAreaResult {
  /** Total surface area in square meters (m²) */
  totalSurfaceAreaM2: number;
  
  /** Surface area per piece in square meters (m²) */
  surfaceAreaPerPieceM2: number;
  
  /** Breakdown by side */
  breakdown: SideAreaBreakdown[];
}

/**
 * Surface area breakdown for a specific side
 */
export interface SideAreaBreakdown {
  /** The side */
  side: CoatingSide;
  
  /** Area of this side in square meters (m²) */
  areaM2: number;
  
  /** Total area for this side (area × quantity) in square meters (m²) */
  totalAreaM2: number;
}

/**
 * Calculates the total surface area for powder coating based on configuration
 * 
 * This is a deterministic function that calculates the surface area of
 * each selected side, multiplies by quantity, and returns the total in m².
 * 
 * @param config - The MDF configuration
 * @returns Surface area calculation result
 * @throws Error if configuration is invalid (should validate before calling)
 */
export function calculateSurfaceArea(
  config: MdfConfiguration
): SurfaceAreaResult {
  // Convert dimensions from mm to meters
  const lengthM = config.lengthMm / 1000;
  const widthM = config.widthMm / 1000;
  const heightM = config.heightMm / 1000;

  const breakdown: SideAreaBreakdown[] = [];

  // Calculate area for each selected side
  for (const side of config.coatingSides) {
    const areaM2 = calculateSideArea(side, lengthM, widthM, heightM);
    const totalAreaM2 = areaM2 * config.quantity;

    breakdown.push({
      side,
      areaM2,
      totalAreaM2,
    });
  }

  // Calculate totals
  const surfaceAreaPerPieceM2 = breakdown.reduce(
    (sum, item) => sum + item.areaM2,
    0
  );
  const totalSurfaceAreaM2 = breakdown.reduce(
    (sum, item) => sum + item.totalAreaM2,
    0
  );

  return {
    totalSurfaceAreaM2,
    surfaceAreaPerPieceM2,
    breakdown,
  };
}

/**
 * Calculates the area of a specific side in square meters
 * 
 * @param side - The side to calculate
 * @param lengthM - Length in meters
 * @param widthM - Width in meters
 * @param heightM - Height in meters
 * @returns Area in square meters
 */
function calculateSideArea(
  side: CoatingSide,
  lengthM: number,
  widthM: number,
  heightM: number
): number {
  switch (side) {
    case CoatingSide.Top:
    case CoatingSide.Bottom:
      // Top and bottom: length × width
      return lengthM * widthM;

    case CoatingSide.Front:
    case CoatingSide.Back:
      // Front and back: length × height
      return lengthM * heightM;

    case CoatingSide.Left:
    case CoatingSide.Right:
      // Left and right: width × height
      return widthM * heightM;

    default:
      // This should never happen with proper typing, but TypeScript requires it
      throw new Error(`Unknown coating side: ${side}`);
  }
}
