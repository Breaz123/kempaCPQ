/**
 * QuoteRequest Domain Model
 * 
 * Domain model voor offerte aanvragen van klanten.
 * Dit model is onafhankelijk van Prisma en kan gebruikt worden
 * voor business logic.
 */

import { QuoteRequestStatus } from '../types/QuoteRequestStatus';

// Types die overeenkomen met frontend slices
// Deze worden als JSON opgeslagen in de database

export interface MdfConfiguration {
  id: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  coatingSides: string[];
  structure?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BusinessCentralProduct {
  id: string;
  number: string;
  description: string;
  displayName?: string;
  unitPrice: number;
  currencyCode: string;
  unitOfMeasure?: string;
  type?: string;
  [key: string]: unknown;
}

export interface BusinessCentralPriceResponse {
  unitPrice: number;
  totalPrice: number;
  currencyCode: string;
  itemNumber: string;
  quantity: number;
  unitOfMeasure?: string;
  details?: Record<string, unknown>;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface QuoteRequestData {
  customerInfo: CustomerInfo;
  configuration: MdfConfiguration;
  product: BusinessCentralProduct;
  priceResponse: BusinessCentralPriceResponse;
}

export interface QuoteRequest {
  id: string;
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  configuration: MdfConfiguration;
  productData: BusinessCentralProduct;
  priceData: BusinessCentralPriceResponse;
  status: QuoteRequestStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  bcQuoteNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuoteRequestInput {
  customerInfo: CustomerInfo;
  configuration: MdfConfiguration;
  product: BusinessCentralProduct;
  priceResponse: BusinessCentralPriceResponse;
}
