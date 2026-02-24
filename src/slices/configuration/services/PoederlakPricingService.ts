/**
 * Poederlak Pricing Service
 *
 * Bevat de kernformule voor MDF-poederlakprijzen, los van Business Central.
 * Wordt gebruikt in zowel de interne CPQ-app als de customer-app.
 *
 * Formule (Kempa uitgangspunt):
 * - Basisprijs: €166 / m² (catalogusprijs)
 * - Oppervlakte per stuk: lengte × breedte (alleen frontvlak), omgerekend naar m²
 * - Minimumoppervlakte per stuk: 0,15 m²
 * - Dikte 30mm of 38mm: +35% op m²-prijs
 */

import type { MdfConfiguration } from '../models/MdfConfiguration';

/**
 * Resultaat van een poederlakprijsberekening
 */
export interface PoederlakPriceCalculation {
  /** Prijs per stuk (voor afronding) */
  unitPrice: number;
  /** Totaalprijs (voor afronding) */
  totalPrice: number;

  /** Basis m²-prijs (voor eventuele dikte-opslag) */
  basePricePerM2: number;
  /** Effectieve m²-prijs na dikte-opslag */
  effectivePricePerM2: number;

  /** Ruwe oppervlakte per stuk (zonder minimum), in m² */
  rawAreaPerPieceM2: number;
  /** Aangerekende oppervlakte per stuk (met minimum 0,15 m²), in m² */
  chargedAreaPerPieceM2: number;
  /** Totale aangerekende oppervlakte (per stuk × aantal), in m² */
  totalChargedAreaM2: number;

  /** Diktefactor (1,0 of 1,35) */
  thicknessFactor: number;
}

/** Standaard catalogusprijs per m² voor poederlak */
export const DEFAULT_POEDERLAK_PRICE_PER_M2 = 166;

/** Minimumoppervlakte per stuk in m² (0,15 m²) */
export const MIN_AREA_PER_PIECE_M2 = 0.15;

/** Diktefactor voor 30mm of 38mm (+35%) */
export const THICKNESS_SURCHARGE_FACTOR = 1.35;

/**
 * Berekent poederlakprijs voor een MDF-configuratie.
 *
 * - Gebruikt enkel het frontvlak (lengte × breedte) als basis voor m²,
 *   in lijn met de catalogus.
 * - Past minimumoppervlakte en dikte-opslag toe.
 */
export function calculatePoederlakPrice(
  config: MdfConfiguration,
  options?: {
    /** Optionele override voor basis m²-prijs (standaard: 166 €/m²) */
    basePricePerM2?: number;
  }
): PoederlakPriceCalculation {
  const basePricePerM2 = options?.basePricePerM2 ?? DEFAULT_POEDERLAK_PRICE_PER_M2;

  // mm → m
  const lengthM = config.lengthMm / 1000;
  const widthM = config.widthMm / 1000;

  // Frontoppervlakte per stuk
  const rawAreaPerPieceM2 = lengthM * widthM;

  // Minimum 0,15 m² per stuk
  const chargedAreaPerPieceM2 = Math.max(rawAreaPerPieceM2, MIN_AREA_PER_PIECE_M2);

  // Diktefactor: 30 of 38 mm => +35%
  const isThickBoard = config.heightMm >= 30;
  const thicknessFactor = isThickBoard ? THICKNESS_SURCHARGE_FACTOR : 1;

  const effectivePricePerM2 = basePricePerM2 * thicknessFactor;

  const unitPrice = chargedAreaPerPieceM2 * effectivePricePerM2;
  const totalChargedAreaM2 = chargedAreaPerPieceM2 * config.quantity;
  const totalPrice = unitPrice * config.quantity;

  return {
    unitPrice,
    totalPrice,
    basePricePerM2,
    effectivePricePerM2,
    rawAreaPerPieceM2,
    chargedAreaPerPieceM2,
    totalChargedAreaM2,
    thicknessFactor,
  };
}

