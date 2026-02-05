/**
 * Validation Error Model
 * 
 * Represents validation errors with clear field-level information.
 */

export interface ValidationError {
  /** Field that failed validation */
  field: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Optional error code for programmatic handling */
  code?: string;
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}

/**
 * Creates a successful validation result
 */
export function createValidResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Creates a failed validation result with errors
 */
export function createInvalidResult(errors: ValidationError[]): ValidationResult {
  return {
    isValid: false,
    errors,
  };
}

/**
 * Creates a single-field validation error
 */
export function createFieldError(
  field: string,
  message: string,
  code?: string
): ValidationError {
  return {
    field,
    message,
    code,
  };
}
