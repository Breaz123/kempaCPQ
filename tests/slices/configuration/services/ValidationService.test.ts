/**
 * Unit tests for Validation Service
 */

import { describe, it, expect } from '@jest/globals';
import { validateMdfConfiguration } from '../../../../src/slices/configuration/services/ValidationService';
import {
  createMdfConfiguration,
  CoatingSide,
} from '../../../../src/slices/configuration/models/MdfConfiguration';

describe('ValidationService', () => {
  describe('validateMdfConfiguration', () => {
    it('should validate a correct configuration', () => {
      const config = createMdfConfiguration(
        'test-1',
        1000,
        500,
        20,
        1,
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid length', () => {
      const config = createMdfConfiguration(
        'test-2',
        -100, // Invalid: negative
        500,
        20,
        1,
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'lengthMm')).toBe(true);
    });

    it('should reject length that is too small', () => {
      const config = createMdfConfiguration(
        'test-3',
        0.5, // Too small: less than 1mm
        500,
        20,
        1,
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === 'lengthMm' && e.code === 'LENGTH_TOO_SMALL'
        )
      ).toBe(true);
    });

    it('should reject length that is too large', () => {
      const config = createMdfConfiguration(
        'test-4',
        15000, // Too large: more than 10000mm
        500,
        20,
        1,
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === 'lengthMm' && e.code === 'LENGTH_TOO_LARGE'
        )
      ).toBe(true);
    });

    it('should reject invalid width', () => {
      const config = createMdfConfiguration(
        'test-5',
        1000,
        NaN, // Invalid: NaN
        20,
        1,
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'widthMm')).toBe(true);
    });

    it('should reject invalid height', () => {
      const config = createMdfConfiguration(
        'test-6',
        1000,
        500,
        Infinity, // Invalid: Infinity
        1,
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'heightMm')).toBe(true);
    });

    it('should reject invalid quantity (not an integer)', () => {
      const config = createMdfConfiguration(
        'test-7',
        1000,
        500,
        20,
        1.5, // Invalid: not an integer
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'quantity')).toBe(true);
    });

    it('should reject quantity that is too small', () => {
      const config = createMdfConfiguration(
        'test-8',
        1000,
        500,
        20,
        0, // Too small: less than 1
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === 'quantity' && e.code === 'QUANTITY_TOO_SMALL'
        )
      ).toBe(true);
    });

    it('should reject quantity that is too large', () => {
      const config = createMdfConfiguration(
        'test-9',
        1000,
        500,
        20,
        2000000, // Too large: more than 1,000,000
        [CoatingSide.Top]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === 'quantity' && e.code === 'QUANTITY_TOO_LARGE'
        )
      ).toBe(true);
    });

    it('should reject empty coating sides', () => {
      const config = createMdfConfiguration(
        'test-10',
        1000,
        500,
        20,
        1,
        [] // Invalid: no sides selected
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === 'coatingSides' && e.code === 'NO_SIDES_SELECTED'
        )
      ).toBe(true);
    });

    it('should reject duplicate coating sides', () => {
      const config = createMdfConfiguration(
        'test-11',
        1000,
        500,
        20,
        1,
        [CoatingSide.Top, CoatingSide.Top] // Invalid: duplicate
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.field === 'coatingSides' && e.code === 'DUPLICATE_SIDES'
        )
      ).toBe(true);
    });

    it('should validate all dimensions and quantity together', () => {
      const config = createMdfConfiguration(
        'test-12',
        1000,
        500,
        20,
        5,
        [CoatingSide.Top, CoatingSide.Bottom, CoatingSide.Front]
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const config = createMdfConfiguration(
        'test-13',
        -100, // Invalid length
        0, // Invalid width
        20,
        0, // Invalid quantity
        [] // Invalid sides
      );

      const result = validateMdfConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
