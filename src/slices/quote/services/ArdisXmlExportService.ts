/**
 * Ardis XML Export Service
 * 
 * Converts Quote domain model to Ardis XML format for order submission.
 * 
 * XML Format Specification:
 * - Root: <ExportXML>
 * - Header section with order metadata
 * - Multiple <Onderdeel> sections for each line item
 */

import { Quote } from '../models/Quote';
import { QuoteLineItem } from '../models/QuoteLineItem';
import { CoatingSide } from '../../configuration/models/MdfConfiguration';

/**
 * Customer information for XML export
 */
export interface CustomerInfo {
  naam: string;
  nummer: string;
  referentie?: string;
}

/**
 * Header information for XML export
 */
export interface ArdisHeaderInfo {
  filenaam: string;
  user: string;
  datum: string; // Format: DD/MM/YYYY
  klantNaam: string;
  klantNummer: string;
  klantReferentie?: string;
  hoofdModel: string;
  hoofdGrondstof: string;
  hoofdAfwerking: string;
  hoofdKleur: string;
  hoofdOpm?: string;
  toeslag?: number;
  toeslag2?: number;
}

/**
 * Converts a Quote to Ardis XML format
 * 
 * @param quote - The quote to export
 * @param headerInfo - Header information for the XML
 * @param customerInfo - Customer information
 * @returns XML string in Ardis format
 */
export function exportQuoteToArdisXml(
  quote: Quote,
  headerInfo: ArdisHeaderInfo,
  customerInfo: CustomerInfo
): string {
  if (quote.lineItems.length === 0) {
    throw new Error('Cannot export quote with no line items');
  }

  const lines: string[] = [];
  
  // XML Declaration
  lines.push('<?xml version="1.0" encoding="Windows-1252" ?>');
  lines.push('<ExportXML>');
  
  // Header Section
  lines.push('<Header>');
  lines.push(`<Filenaam>${escapeXml(headerInfo.filenaam)}</Filenaam>`);
  lines.push(`<User>${escapeXml(headerInfo.user)}</User>`);
  lines.push(`<Datum>${escapeXml(headerInfo.datum)}</Datum>`);
  lines.push(`<KlantNaam>${escapeXml(headerInfo.klantNaam)}</KlantNaam>`);
  lines.push(`<KlantNummer>${escapeXml(headerInfo.klantNummer)}</KlantNummer>`);
  lines.push(`<KlantReferentie>${escapeXml(headerInfo.klantReferentie || '')}</KlantReferentie>`);
  lines.push(`<HoofdModel>${escapeXml(headerInfo.hoofdModel)}</HoofdModel>`);
  lines.push(`<HoofdGrondstof>${escapeXml(headerInfo.hoofdGrondstof)}</HoofdGrondstof>`);
  lines.push(`<HoofdAfwerking>${escapeXml(headerInfo.hoofdAfwerking)}</HoofdAfwerking>`);
  lines.push(`<HoofdKleur>${escapeXml(headerInfo.hoofdKleur)}</HoofdKleur>`);
  lines.push(`<HoofdOpm>${escapeXml(headerInfo.hoofdOpm || '')}</HoofdOpm>`);
  lines.push(`<Toeslag>${headerInfo.toeslag || 0}</Toeslag>`);
  lines.push(`<Toeslag2>${headerInfo.toeslag2 || 0}</Toeslag2>`);
  lines.push('</Header>');
  lines.push('          ');
  
  // Onderdeel Sections
  quote.lineItems.forEach((lineItem, index) => {
    lines.push('<Onderdeel>');
    lines.push(`<KlantNaam>${escapeXml(customerInfo.naam)}</KlantNaam>`);
    lines.push(`<KlantNummer>${escapeXml(customerInfo.nummer)}</KlantNummer>`);
    lines.push(`<KlantReferentie>${escapeXml(customerInfo.referentie || '')}</KlantReferentie>`);
    lines.push(`<HoofdModel>${escapeXml(headerInfo.hoofdModel)}</HoofdModel>`);
    lines.push(`<HoofdAfwerking>${escapeXml(headerInfo.hoofdAfwerking)}</HoofdAfwerking>`);
    lines.push(`<HoofdKleur>${escapeXml(headerInfo.hoofdKleur)}</HoofdKleur>`);
    lines.push(`<NR>${String(index + 1).padStart(3, '0')}</NR>`);
    lines.push(`<Model>${escapeXml(lineItem.productId)}</Model>`);
    lines.push(`<PartQty>${lineItem.quantity}</PartQty>`);
    lines.push(`<LD>${generateLDString(lineItem)}</LD>`);
    lines.push(`<OPM>${escapeXml('')}</OPM>`);
    
    // Price breakdown - split unitPrice into PrijsOnbewerkt and PrijsAfwerk
    // For now, we'll estimate: 40% unprocessed, 60% finishing (adjust based on actual business logic)
    const prijsOnbewerkt = roundTo2Decimals(lineItem.unitPrice * 0.4);
    const prijsAfwerk = roundTo2Decimals(lineItem.unitPrice * 0.6);
    const prijsBrutoEenheid = lineItem.unitPrice;
    
    lines.push(`<PrijsOnbewerkt>${prijsOnbewerkt.toFixed(2)}</PrijsOnbewerkt>`);
    lines.push(`<PrijsAfwerk>${prijsAfwerk.toFixed(2)}</PrijsAfwerk>`);
    lines.push(`<PrijsBrutoEenheid>${prijsBrutoEenheid.toFixed(2)}</PrijsBrutoEenheid>`);
    lines.push(`<Korting>0</Korting>`);
    lines.push(`<PrijsNettoTotaal>${lineItem.lineTotal.toFixed(2)}</PrijsNettoTotaal>`);
    lines.push('</Onderdeel>');
    lines.push('');
  });
  
  lines.push('</ExportXML>');
  
  return lines.join('\n');
}

/**
 * Generates the LD (Line Description) string for Ardis format
 * 
 * Format: P101GC "AFM"1170x170x19 "MAT"MDF PL "KB"0-0-0-0 "C"C87-C87-C87-C87 "GVD"GVD=0-GT=-GAF=0-GAAN=0-GDFR=0-ED=1  "GAT"LOC=9-30-GAT1=0-GAT2=0-GAT3=0-GAT4=0 "AFW"50-V"KLR"ONBEKEND "AFW2"200-200     "Staal"0"PC"07
 * 
 * @param lineItem - The quote line item
 * @returns LD string
 */
function generateLDString(lineItem: QuoteLineItem): string {
  const config = lineItem.configuration;
  const model = lineItem.productId;
  
  // AFM: Afmetingen (dimensions) - length x width x height
  const afm = `${config.lengthMm}x${config.widthMm}x${config.heightMm}`;
  
  // MAT: Materiaal (material) - default to MDF PL
  const mat = 'MDF PL';
  
  // KB: Kantbewerking (edge processing) - default 0-0-0-0
  const kb = '0-0-0-0';
  
  // C: Coating sides - map coating sides to color codes
  const c = mapCoatingSidesToColorCodes(config.coatingSides);
  
  // GVD: Various processing parameters
  const gvd = 'GVD=0-GT=-GAF=0-GAAN=0-GDFR=0-ED=1';
  
  // GAT: Hole parameters
  const gat = 'LOC=9-30-GAT1=0-GAT2=0-GAT3=0-GAT4=0';
  
  // AFW: Afwerking (finish) - extract from product or use default
  const afw = '50-V';
  
  // KLR: Kleur (color) - default to ONBEKEND
  const klr = 'ONBEKEND';
  
  // AFW2: Secondary finish
  const afw2 = '200-200';
  
  // Staal: Steel parameter
  const staal = '0';
  
  // PC: Product code variant
  const pc = extractProductCodeVariant(lineItem.productId) || '07';
  
  return `${model}GC "AFM"${afm} "MAT"${mat} "KB"${kb} "C"${c} "GVD"${gvd}  "GAT"${gat} "AFW"${afw}"KLR"${klr} "AFW2"${afw2}     "Staal"${staal}"PC"${pc}`;
}

/**
 * Maps coating sides to color codes (C87-C87-C87-C87 format)
 * 
 * @param coatingSides - Array of coating sides
 * @returns Color code string
 */
function mapCoatingSidesToColorCodes(coatingSides: CoatingSide[]): string {
  // Default to C87 for all sides if no coating specified
  // Adjust based on actual business logic
  if (coatingSides.length === 0) {
    return 'C87-C87-C87-C87';
  }
  
  // Map each side to a color code (simplified - adjust based on requirements)
  // Format: Top-Bottom-Front-Back or similar
  return 'C87-C87-C87-C87';
}

/**
 * Extracts product code variant from product ID
 * 
 * @param productId - Product identifier
 * @returns Product code variant or null
 */
function extractProductCodeVariant(productId: string): string | null {
  // Extract variant code from product ID (e.g., P101(07) -> 07)
  const match = productId.match(/\((\d+)\)/);
  return match ? match[1] : null;
}

/**
 * Escapes XML special characters
 * 
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Rounds a number to 2 decimal places
 * 
 * @param value - Value to round
 * @returns Rounded value
 */
function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}
