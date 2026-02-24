/**
 * Poederlak Pricing Service
 *
 * Bevat de kernformule voor MDF-poederlakprijzen, los van Business Central.
 * Wordt gebruikt in zowel de interne CPQ-app als de customer-app.
 *
 * Formule (Kempa uitgangspunt):
 * - Basisprijs: €135 / m²
 * - Oppervlakte per stuk: lengte × breedte (alleen frontvlak), omgerekend naar m²
 * - Minimumoppervlakte per stuk: 0,15 m²
 * - Dikte 30mm of 38mm: +35% op m²-prijs
 */

import type { DimensionSet, MdfConfiguration } from '../models/MdfConfiguration';

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

/** Standaard prijs per m² voor poederlak */
export const DEFAULT_POEDERLAK_PRICE_PER_M2 = 135;

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
    /** Optionele override voor basis m²-prijs (standaard: 135 €/m²) */
    basePricePerM2?: number;
  }
): PoederlakPriceCalculation {
  const basePricePerM2 = options?.basePricePerM2 ?? DEFAULT_POEDERLAK_PRICE_PER_M2;

  const dimensionSets: DimensionSet[] | undefined = config.dimensionSets;

  // Wanneer meerdere afmetingen zijn opgegeven, berekenen we de prijs
  // per dimension set en sommeren we alles. Dit maakt het mogelijk om
  // in één configuratie bv. 5× 200×200 en 4× 100×200 te combineren.
  if (dimensionSets && dimensionSets.length > 0) {
    let totalPrice = 0;
    let totalChargedAreaM2 = 0;
    let totalQuantity = 0;

    let rawAreaSum = 0;
    let chargedAreaSum = 0;
    let thicknessFactorWeightedSum = 0;

    for (const set of dimensionSets) {
      // mm → m
      const lengthM = set.lengthMm / 1000;
      const widthM = set.widthMm / 1000;

      const rawAreaPerPieceM2Set = lengthM * widthM;
      const chargedAreaPerPieceM2Set = Math.max(
        rawAreaPerPieceM2Set,
        MIN_AREA_PER_PIECE_M2
      );

      const isThickBoardSet = set.heightMm >= 30;
      const thicknessFactorSet = isThickBoardSet
        ? THICKNESS_SURCHARGE_FACTOR
        : 1;

      const effectivePricePerM2Set = basePricePerM2 * thicknessFactorSet;
      const unitPriceSet = chargedAreaPerPieceM2Set * effectivePricePerM2Set;

      const setTotalChargedAreaM2 =
        chargedAreaPerPieceM2Set * set.quantity;
      const setTotalPrice = unitPriceSet * set.quantity;

      totalChargedAreaM2 += setTotalChargedAreaM2;
      totalPrice += setTotalPrice;
      totalQuantity += set.quantity;

      rawAreaSum += rawAreaPerPieceM2Set * set.quantity;
      chargedAreaSum += chargedAreaPerPieceM2Set * set.quantity;
      thicknessFactorWeightedSum += thicknessFactorSet * set.quantity;
    }

    const safeQuantity = totalQuantity > 0 ? totalQuantity : 1;

    const rawAreaPerPieceM2 = rawAreaSum / safeQuantity;
    const chargedAreaPerPieceM2 = chargedAreaSum / safeQuantity;
    const thicknessFactor =
      thicknessFactorWeightedSum / safeQuantity || 1;

    const effectivePricePerM2 = basePricePerM2 * thicknessFactor;
    const unitPrice = totalPrice / safeQuantity;

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

  // Oud gedrag: één set afmetingen op config-niveau
  // mm → m
  const lengthM = config.lengthMm / 1000;
  const widthM = config.widthMm / 1000;

  // Frontoppervlakte per stuk
  const rawAreaPerPieceM2 = lengthM * widthM;

  // Minimum 0,15 m² per stuk
  const chargedAreaPerPieceM2 = Math.max(
    rawAreaPerPieceM2,
    MIN_AREA_PER_PIECE_M2
  );

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

