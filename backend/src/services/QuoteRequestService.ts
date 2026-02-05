/**
 * QuoteRequest Service
 * 
 * Business logic voor offerte aanvragen.
 * Handelt alle operaties af op QuoteRequest entiteiten.
 */

import { prisma } from '../config/database';
import { QuoteRequest } from '../models/QuoteRequest';
import { QuoteRequestStatus } from '../types/QuoteRequestStatus';
import { Prisma } from '@prisma/client';
import { CreateQuoteRequestInput } from '../validators/quoteRequestValidator';

/**
 * Genereert een uniek request nummer
 * Format: QR-YYYY-NNN (bijv. QR-2024-001)
 */
async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `QR-${year}-`;
  
  // Zoek het hoogste nummer van dit jaar
  const lastRequest = await prisma.quoteRequest.findFirst({
    where: {
      requestNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      requestNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.requestNumber.split('-')[2] || '0');
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Maakt een nieuwe offerte aanvraag aan
 */
export async function createQuoteRequest(
  input: CreateQuoteRequestInput
): Promise<QuoteRequest> {
  const requestNumber = await generateRequestNumber();

  const quoteRequest = await prisma.quoteRequest.create({
    data: {
      requestNumber,
      customerName: input.customerInfo.name,
      customerEmail: input.customerInfo.email,
      customerPhone: input.customerInfo.phone,
      companyName: input.customerInfo.companyName,
      address: input.customerInfo.address,
      city: input.customerInfo.city,
      postalCode: input.customerInfo.postalCode,
      country: input.customerInfo.country || 'NL',
      configuration: JSON.stringify(input.configuration),
      productData: JSON.stringify(input.product),
      priceData: JSON.stringify(input.priceResponse),
      status: QuoteRequestStatus.PENDING,
    },
  });

  return mapPrismaToDomain(quoteRequest);
}

/**
 * Haalt een offerte aanvraag op bij ID
 */
export async function getQuoteRequestById(id: string): Promise<QuoteRequest | null> {
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { id },
  });

  return quoteRequest ? mapPrismaToDomain(quoteRequest) : null;
}

/**
 * Haalt een offerte aanvraag op bij request number
 */
export async function getQuoteRequestByNumber(
  requestNumber: string
): Promise<QuoteRequest | null> {
  const quoteRequest = await prisma.quoteRequest.findUnique({
    where: { requestNumber },
  });

  return quoteRequest ? mapPrismaToDomain(quoteRequest) : null;
}

/**
 * Haalt alle offerte aanvragen op (met optionele filters)
 */
export async function getAllQuoteRequests(options?: {
  status?: QuoteRequestStatus;
  customerEmail?: string;
  limit?: number;
  offset?: number;
}): Promise<QuoteRequest[]> {
  const where: Prisma.QuoteRequestWhereInput = {};
  
  if (options?.status) {
    where.status = options.status;
  }
  
  if (options?.customerEmail) {
    where.customerEmail = options.customerEmail;
  }

  const quoteRequests = await prisma.quoteRequest.findMany({
    where,
    orderBy: {
      submittedAt: 'desc',
    },
    take: options?.limit,
    skip: options?.offset,
  });

  return quoteRequests.map(mapPrismaToDomain);
}

/**
 * Update de status van een offerte aanvraag
 */
export async function updateQuoteRequestStatus(
  id: string,
  status: QuoteRequestStatus,
  options?: {
    rejectionReason?: string;
    bcQuoteNumber?: string;
  }
): Promise<QuoteRequest> {
  const updateData: Prisma.QuoteRequestUpdateInput = {
    status,
    updatedAt: new Date(),
  };

  if (status === QuoteRequestStatus.REVIEWING) {
    updateData.reviewedAt = new Date();
  } else if (status === QuoteRequestStatus.APPROVED) {
    updateData.approvedAt = new Date();
    if (options?.bcQuoteNumber) {
      updateData.bcQuoteNumber = options.bcQuoteNumber;
    }
  } else if (status === QuoteRequestStatus.REJECTED) {
    updateData.rejectedAt = new Date();
    if (options?.rejectionReason) {
      updateData.rejectionReason = options.rejectionReason;
    }
  }

  const quoteRequest = await prisma.quoteRequest.update({
    where: { id },
    data: updateData,
  });

  return mapPrismaToDomain(quoteRequest);
}

/**
 * Map Prisma model naar domain model
 */
function mapPrismaToDomain(prismaModel: any): QuoteRequest {
  return {
    id: prismaModel.id,
    requestNumber: prismaModel.requestNumber,
    customerName: prismaModel.customerName,
    customerEmail: prismaModel.customerEmail,
    customerPhone: prismaModel.customerPhone,
    companyName: prismaModel.companyName,
    address: prismaModel.address,
    city: prismaModel.city,
    postalCode: prismaModel.postalCode,
    country: prismaModel.country,
    configuration: typeof prismaModel.configuration === 'string' 
      ? JSON.parse(prismaModel.configuration) 
      : prismaModel.configuration,
    productData: typeof prismaModel.productData === 'string'
      ? JSON.parse(prismaModel.productData)
      : prismaModel.productData,
    priceData: typeof prismaModel.priceData === 'string'
      ? JSON.parse(prismaModel.priceData)
      : prismaModel.priceData,
    status: prismaModel.status as QuoteRequestStatus,
    submittedAt: prismaModel.submittedAt,
    reviewedAt: prismaModel.reviewedAt,
    approvedAt: prismaModel.approvedAt,
    rejectedAt: prismaModel.rejectedAt,
    rejectionReason: prismaModel.rejectionReason,
    bcQuoteNumber: prismaModel.bcQuoteNumber,
    createdAt: prismaModel.createdAt,
    updatedAt: prismaModel.updatedAt,
  };
}
