/**
 * Quote Slice - Public Exports
 * 
 * This module exports the public interface of the Quote slice.
 * Other slices should only import from this file.
 */

// Models
export type { Quote } from './models/Quote';
export { QuoteStatus, createQuote } from './models/Quote';

export type { QuoteLineItem } from './models/QuoteLineItem';
export { createQuoteLineItem, calculateLineTotal, generateLineDescription } from './models/QuoteLineItem';

export type { QuoteTotals } from './models/QuoteTotals';
export { calculateQuoteTotals } from './models/QuoteTotals';

// Services
export {
  addLineItemToQuote,
  removeLineItemFromQuote,
  updateLineItemQuantity,
} from './services/QuoteBuilderService';
export type { PriceResponse } from './services/QuoteBuilderService';

export {
  mapQuoteToBusinessCentral,
} from './services/BusinessCentralQuoteMapper';

export {
  exportQuoteToArdisXml,
} from './services/ArdisXmlExportService';

export type {
  CustomerInfo,
  ArdisHeaderInfo,
} from './services/ArdisXmlExportService';