/**
 * QuoteRequestStatus Enum
 * 
 * Status van een offerte aanvraag in het workflow proces.
 */

export enum QuoteRequestStatus {
  PENDING = 'PENDING',      // Wachtend op review
  REVIEWING = 'REVIEWING',  // In behandeling door sales
  APPROVED = 'APPROVED',    // Goedgekeurd, quote gemaakt in BC
  REJECTED = 'REJECTED',    // Afgewezen
  EXPIRED = 'EXPIRED',      // Verlopen (optioneel)
}
