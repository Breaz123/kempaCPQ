/**
 * Database Seed Script
 * 
 * Optionele seed data voor development/testing.
 */

import { PrismaClient, QuoteRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Optioneel: voeg test data toe
  // const testRequest = await prisma.quoteRequest.create({
  //   data: {
  //     requestNumber: 'QR-2024-000',
  //     customerName: 'Test Customer',
  //     customerEmail: 'test@example.com',
  //     country: 'NL',
  //     configuration: {
  //       id: 'test-1',
  //       lengthMm: 1000,
  //       widthMm: 500,
  //       heightMm: 18,
  //       quantity: 5,
  //       coatingSides: ['top', 'bottom'],
  //     },
  //     productData: {
  //       id: 'prod-1',
  //       number: 'MDF-001',
  //       description: 'Test Product',
  //       unitPrice: 25.50,
  //       currencyCode: 'EUR',
  //     },
  //     priceData: {
  //       unitPrice: 135.00,
  //       totalPrice: 675.00,
  //       currencyCode: 'EUR',
  //       itemNumber: 'MDF-001',
  //       quantity: 5,
  //     },
  //     status: QuoteRequestStatus.PENDING,
  //   },
  // });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
