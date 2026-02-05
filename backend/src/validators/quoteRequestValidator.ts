/**
 * Quote Request Validators
 * 
 * Input validatie voor quote request endpoints.
 * Gebruikt Zod voor schema validatie.
 */

import { z } from 'zod';

// Customer Info Schema
export const customerInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('NL'),
});

// MDF Configuration Schema
export const mdfConfigurationSchema = z.object({
  id: z.string(),
  lengthMm: z.number().positive('Length must be positive'),
  widthMm: z.number().positive('Width must be positive'),
  heightMm: z.number().positive('Height must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  coatingSides: z.array(z.string()).min(1, 'At least one coating side is required'),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

// Business Central Product Schema
export const businessCentralProductSchema = z.object({
  id: z.string(),
  number: z.string().min(1),
  description: z.string().min(1),
  displayName: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  currencyCode: z.string().length(3),
  unitOfMeasure: z.string().optional(),
  type: z.string().optional(),
}).passthrough(); // Allow additional properties

// Business Central Price Response Schema
export const businessCentralPriceResponseSchema = z.object({
  unitPrice: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  currencyCode: z.string().length(3),
  itemNumber: z.string().min(1),
  quantity: z.number().positive(),
  unitOfMeasure: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

// Create Quote Request Input Schema
export const createQuoteRequestSchema = z.object({
  customerInfo: customerInfoSchema,
  configuration: mdfConfigurationSchema,
  product: businessCentralProductSchema,
  priceResponse: businessCentralPriceResponseSchema,
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
