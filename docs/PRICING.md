# Pricing Documentatie

## Overzicht

Dit document beschrijft hoe de prijsberekening werkt in de CPQ applicatie.

## Prijsstructuur

### Basisprijs

De basisprijs voor MDF powder coating is: **€135 per m² coating oppervlakte**

Dit is de standaardprijs zonder extra's of kortingen.

## Berekening

### Stap 1: Oppervlakte per stuk berekenen

De oppervlakte van één MDF stuk wordt berekend op basis van lengte en breedte:

```
oppervlakte_per_stuk (m²) = (lengte_mm × breedte_mm) / 1.000.000
```

**Voorbeeld:**
- Lengte: 1000mm
- Breedte: 500mm
- Oppervlakte per stuk: (1000 × 500) / 1.000.000 = **0,5 m²**

### Stap 2: Coating oppervlakte berekenen

De totale coating oppervlakte hangt af van hoeveel zijden gecoat moeten worden:

```
coating_oppervlakte (m²) = oppervlakte_per_stuk × aantal_coating_zijden
```

**Beschikbare coating zijden:**
- Top
- Bottom
- Front
- Back
- Left
- Right

**Voorbeeld:**
- Oppervlakte per stuk: 0,5 m²
- Geselecteerde coating zijden: Top, Bottom, Front (3 zijden)
- Coating oppervlakte: 0,5 × 3 = **1,5 m²**

### Stap 3: Unitprijs berekenen

De unitprijs is de prijs voor één stuk:

```
unitprijs (EUR) = coating_oppervlakte × €135
```

**Voorbeeld:**
- Coating oppervlakte: 1,5 m²
- Unitprijs: 1,5 × €135 = **€202,50**

### Stap 4: Totaalprijs berekenen

De totaalprijs is de unitprijs vermenigvuldigd met het aantal stuks:

```
totaalprijs (EUR) = unitprijs × aantal_stuks
```

**Voorbeeld:**
- Unitprijs: €202,50
- Aantal: 5 stuks
- Totaalprijs: €202,50 × 5 = **€1.012,50**

## Volledig Rekenvoorbeeld

**Configuratie:**
- Lengte: 2000mm
- Breedte: 1000mm
- Hoogte/Dikte: 18mm
- Coating zijden: Top, Bottom, Front, Back (4 zijden)
- Aantal: 10 stuks

**Berekening:**

1. Oppervlakte per stuk:
   - (2000 × 1000) / 1.000.000 = **2,0 m²**

2. Coating oppervlakte:
   - 2,0 × 4 = **8,0 m²**

3. Unitprijs:
   - 8,0 × €135 = **€1.080,00**

4. Totaalprijs:
   - €1.080,00 × 10 = **€10.800,00**

## Belangrijke Opmerkingen

### Hoogte/Dikte
De hoogte/dikte van het MDF wordt momenteel **niet** meegenomen in de prijsberekening. Alleen de oppervlakte (lengte × breedte) en het aantal coating zijden bepalen de prijs.

### Afronding
Prijzen worden afgerond op 2 decimalen (centen nauwkeurig).

### Valuta
Alle prijzen zijn in **EUR (Euro)**.

## Implementatie

De prijsberekening is geïmplementeerd in:

**Bestand:** `src/app/hooks/useCpqApi.ts`

**Functie:** `calculateMockPrice()`

```typescript
function calculateMockPrice(
  itemNumber: string,
  configuration: MdfConfiguration
): BusinessCentralPriceResponse {
  const PRICE_PER_M2 = 135; // EUR per m²
  
  const areaPerPiece = (configuration.lengthMm * configuration.widthMm) / 1000000;
  const coatingArea = areaPerPiece * configuration.coatingSides.length;
  const unitPrice = coatingArea * PRICE_PER_M2;
  const totalPrice = unitPrice * configuration.quantity;
  
  return {
    unitPrice: Math.round(unitPrice * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    currencyCode: 'EUR',
    itemNumber,
    quantity: configuration.quantity,
    unitOfMeasure: 'PCS',
  };
}
```

## Toekomstige Uitbreidingen

Mogelijke uitbreidingen voor de prijsberekening:

1. **Hoogte/Dikte factor**: Extra kosten voor dikker materiaal
2. **Kortingen**: Volume kortingen bij grote hoeveelheden
3. **Extra's**: 
   - Speciale kleuren
   - Snelle levering
   - Extra afwerking
4. **Minimum prijs**: Minimumprijs per order
5. **Setup kosten**: Vaste kosten per order

## Business Central Integratie

Wanneer Business Central integratie wordt geactiveerd, zal de prijsberekening worden uitgevoerd door Business Central API in plaats van de mock berekening. Dezelfde configuratiegegevens (lengte, breedte, coating zijden, aantal) worden dan naar Business Central gestuurd voor de daadwerkelijke prijsberekening volgens jullie prijsregels.
