/**
 * Validation Service for MDF Configuration
 * 
 * Provides validation logic for MDF powder coating configurations.
 */

import { MdfConfiguration, CoatingSide } from '../models/MdfConfiguration';
import {
  ValidationResult,
  ValidationError,
  createValidResult,
  createInvalidResult,
  createFieldError,
} from '../models/ValidationError';

/**
 * Maximum allowed dimension in millimeters (10 meters)
 */
const MAX_DIMENSION_MM = 10_000;

/**
 * Minimum allowed dimension in millimeters (1 mm)
 */
const MIN_DIMENSION_MM = 1;

/**
 * Maximum allowed quantity
 */
const MAX_QUANTITY = 1_000_000;

/**
 * Minimum allowed quantity
 */
const MIN_QUANTITY = 1;

/**
 * Validates an MDF configuration
 * 
 * @param config - The MDF configuration to validate
 * @returns Validation result with errors if any
 */
export function validateMdfConfiguration(
  config: MdfConfiguration
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate length
  if (!isPositiveNumber(config.lengthMm)) {
    errors.push(
      createFieldError(
        'lengthMm',
        'Length must be a positive number',
        'INVALID_LENGTH'
      )
    );
  } else if (config.lengthMm < MIN_DIMENSION_MM) {
    errors.push(
      createFieldError(
        'lengthMm',
        `Length must be at least ${MIN_DIMENSION_MM} mm`,
        'LENGTH_TOO_SMALL'
      )
    );
  } else if (config.lengthMm > MAX_DIMENSION_MM) {
    errors.push(
      createFieldError(
        'lengthMm',
        `Length must not exceed ${MAX_DIMENSION_MM} mm`,
        'LENGTH_TOO_LARGE'
      )
    );
  }

  // Validate width
  if (!isPositiveNumber(config.widthMm)) {
    errors.push(
      createFieldError(
        'widthMm',
        'Width must be a positive number',
        'INVALID_WIDTH'
      )
    );
  } else if (config.widthMm < MIN_DIMENSION_MM) {
    errors.push(
      createFieldError(
        'widthMm',
        `Width must be at least ${MIN_DIMENSION_MM} mm`,
        'WIDTH_TOO_SMALL'
      )
    );
  } else if (config.widthMm > MAX_DIMENSION_MM) {
    errors.push(
      createFieldError(
        'widthMm',
        `Width must not exceed ${MAX_DIMENSION_MM} mm`,
        'WIDTH_TOO_LARGE'
      )
    );
  }

  // Validate height
  if (!isPositiveNumber(config.heightMm)) {
    errors.push(
      createFieldError(
        'heightMm',
        'Height must be a positive number',
        'INVALID_HEIGHT'
      )
    );
  } else if (config.heightMm < MIN_DIMENSION_MM) {
    errors.push(
      createFieldError(
        'heightMm',
        `Height must be at least ${MIN_DIMENSION_MM} mm`,
        'HEIGHT_TOO_SMALL'
      )
    );
  } else if (config.heightMm > MAX_DIMENSION_MM) {
    errors.push(
      createFieldError(
        'heightMm',
        `Height must not exceed ${MAX_DIMENSION_MM} mm`,
        'HEIGHT_TOO_LARGE'
      )
    );
  }

  // Validate quantity
  if (!isPositiveInteger(config.quantity)) {
    errors.push(
      createFieldError(
        'quantity',
        'Quantity must be a positive integer',
        'INVALID_QUANTITY'
      )
    );
  } else if (config.quantity < MIN_QUANTITY) {
    errors.push(
      createFieldError(
        'quantity',
        `Quantity must be at least ${MIN_QUANTITY}`,
        'QUANTITY_TOO_SMALL'
      )
    );
  } else if (config.quantity > MAX_QUANTITY) {
    errors.push(
      createFieldError(
        'quantity',
        `Quantity must not exceed ${MAX_QUANTITY}`,
        'QUANTITY_TOO_LARGE'
      )
    );
  }

  // Validate coating sides
  if (!Array.isArray(config.coatingSides) || config.coatingSides.length === 0) {
    errors.push(
      createFieldError(
        'coatingSides',
        'At least one side must be selected for coating',
        'NO_SIDES_SELECTED'
      )
    );
  } else {
    // Validate each side is a valid CoatingSide enum value
    const validSides = Object.values(CoatingSide);
    const invalidSides = config.coatingSides.filter(
      (side) => !validSides.includes(side)
    );
    
    if (invalidSides.length > 0) {
      errors.push(
        createFieldError(
          'coatingSides',
          `Invalid coating sides: ${invalidSides.join(', ')}`,
          'INVALID_SIDES'
        )
      );
    }

    // Check for duplicate sides
    const uniqueSides = new Set(config.coatingSides);
    if (uniqueSides.size !== config.coatingSides.length) {
      errors.push(
        createFieldError(
          'coatingSides',
          'Duplicate sides are not allowed',
          'DUPLICATE_SIDES'
        )
      );
    }
  }

  return errors.length === 0 ? createValidResult() : createInvalidResult(errors);
}

/**
 * Checks if a value is a positive number
 */
function isPositiveNumber(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    isFinite(value) &&
    value > 0
  );
}

/**
 * Checks if a value is a positive integer
 */
function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    isFinite(value) &&
    Number.isInteger(value) &&
    value > 0
  );
}
