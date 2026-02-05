/**
 * Unit tests for Surface Calculation Service
 */

import { describe, it, expect } from '@jest/globals';
import { calculateSurfaceArea } from '../../../../src/slices/configuration/services/SurfaceCalculationService';
import {
  createMdfConfiguration,
  CoatingSide,
} from '../../../../src/slices/configuration/models/MdfConfiguration';

describe('SurfaceCalculationService', () => {
  describe('calculateSurfaceArea', () => {
    it('should calculate surface area for a single side (top)', () => {
      const config = createMdfConfiguration(
        'test-1',
        1000, // 1000mm = 1m
        500, // 500mm = 0.5m
        20, // 20mm = 0.02m
        1,
        [CoatingSide.Top]
      );

      const result = calculateSurfaceArea(config);

      // Top area: 1m × 0.5m = 0.5 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(0.5, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(0.5, 6);
      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].side).toBe(CoatingSide.Top);
      expect(result.breakdown[0].areaM2).toBeCloseTo(0.5, 6);
      expect(result.breakdown[0].totalAreaM2).toBeCloseTo(0.5, 6);
    });

    it('should calculate surface area for multiple sides', () => {
      const config = createMdfConfiguration(
        'test-2',
        1000, // 1m
        500, // 0.5m
        20, // 0.02m
        1,
        [CoatingSide.Top, CoatingSide.Bottom, CoatingSide.Front]
      );

      const result = calculateSurfaceArea(config);

      // Top: 1m × 0.5m = 0.5 m²
      // Bottom: 1m × 0.5m = 0.5 m²
      // Front: 1m × 0.02m = 0.02 m²
      // Total per piece: 1.02 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(1.02, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(1.02, 6);
      expect(result.breakdown).toHaveLength(3);
    });

    it('should calculate surface area with quantity', () => {
      const config = createMdfConfiguration(
        'test-3',
        1000, // 1m
        500, // 0.5m
        20, // 0.02m
        5, // 5 pieces
        [CoatingSide.Top]
      );

      const result = calculateSurfaceArea(config);

      // Per piece: 0.5 m²
      // Total: 0.5 m² × 5 = 2.5 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(0.5, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(2.5, 6);
      expect(result.breakdown[0].totalAreaM2).toBeCloseTo(2.5, 6);
    });

    it('should calculate surface area for all six sides', () => {
      const config = createMdfConfiguration(
        'test-4',
        1000, // 1m
        500, // 0.5m
        20, // 0.02m
        1,
        [
          CoatingSide.Top,
          CoatingSide.Bottom,
          CoatingSide.Front,
          CoatingSide.Back,
          CoatingSide.Left,
          CoatingSide.Right,
        ]
      );

      const result = calculateSurfaceArea(config);

      // Top: 1m × 0.5m = 0.5 m²
      // Bottom: 1m × 0.5m = 0.5 m²
      // Front: 1m × 0.02m = 0.02 m²
      // Back: 1m × 0.02m = 0.02 m²
      // Left: 0.5m × 0.02m = 0.01 m²
      // Right: 0.5m × 0.02m = 0.01 m²
      // Total: 1.06 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(1.06, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(1.06, 6);
      expect(result.breakdown).toHaveLength(6);
    });

    it('should handle small dimensions correctly', () => {
      const config = createMdfConfiguration(
        'test-5',
        100, // 0.1m
        50, // 0.05m
        10, // 0.01m
        1,
        [CoatingSide.Top]
      );

      const result = calculateSurfaceArea(config);

      // Top: 0.1m × 0.05m = 0.005 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(0.005, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(0.005, 6);
    });

    it('should handle large dimensions correctly', () => {
      const config = createMdfConfiguration(
        'test-6',
        5000, // 5m
        3000, // 3m
        50, // 0.05m
        1,
        [CoatingSide.Top]
      );

      const result = calculateSurfaceArea(config);

      // Top: 5m × 3m = 15 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(15, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(15, 6);
    });

    it('should calculate front and back sides correctly', () => {
      const config = createMdfConfiguration(
        'test-7',
        1000, // 1m
        500, // 0.5m
        20, // 0.02m
        1,
        [CoatingSide.Front, CoatingSide.Back]
      );

      const result = calculateSurfaceArea(config);

      // Front: 1m × 0.02m = 0.02 m²
      // Back: 1m × 0.02m = 0.02 m²
      // Total: 0.04 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(0.04, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(0.04, 6);
    });

    it('should calculate left and right sides correctly', () => {
      const config = createMdfConfiguration(
        'test-8',
        1000, // 1m
        500, // 0.5m
        20, // 0.02m
        1,
        [CoatingSide.Left, CoatingSide.Right]
      );

      const result = calculateSurfaceArea(config);

      // Left: 0.5m × 0.02m = 0.01 m²
      // Right: 0.5m × 0.02m = 0.01 m²
      // Total: 0.02 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(0.02, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(0.02, 6);
    });

    it('should be deterministic - same input produces same output', () => {
      const config = createMdfConfiguration(
        'test-9',
        1000,
        500,
        20,
        3,
        [CoatingSide.Top, CoatingSide.Bottom]
      );

      const result1 = calculateSurfaceArea(config);
      const result2 = calculateSurfaceArea(config);

      expect(result1.totalSurfaceAreaM2).toBe(result2.totalSurfaceAreaM2);
      expect(result1.surfaceAreaPerPieceM2).toBe(result2.surfaceAreaPerPieceM2);
      expect(result1.breakdown).toEqual(result2.breakdown);
    });

    it('should handle large quantities correctly', () => {
      const config = createMdfConfiguration(
        'test-10',
        1000, // 1m
        500, // 0.5m
        20, // 0.02m
        1000, // 1000 pieces
        [CoatingSide.Top]
      );

      const result = calculateSurfaceArea(config);

      // Per piece: 0.5 m²
      // Total: 0.5 m² × 1000 = 500 m²
      expect(result.surfaceAreaPerPieceM2).toBeCloseTo(0.5, 6);
      expect(result.totalSurfaceAreaM2).toBeCloseTo(500, 6);
    });
  });
});
