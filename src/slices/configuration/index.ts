/**
 * Configuration Slice - Public Exports
 * 
 * This module exports the public interface of the Configuration slice.
 * Other slices should only import from this file.
 */

// Models
export type { MdfConfiguration, DimensionSet } from './models/MdfConfiguration';
export { CoatingSide, MdfStructure, createMdfConfiguration } from './models/MdfConfiguration';

export type { ValidationError, ValidationResult } from './models/ValidationError';
export { createValidResult, createInvalidResult, createFieldError } from './models/ValidationError';

// Services
export {
  validateMdfConfiguration,
} from './services/ValidationService';

export { calculateSurfaceArea } from './services/SurfaceCalculationService';
export type { SurfaceAreaResult, SideAreaBreakdown } from './services/SurfaceCalculationService';
