# Business Central Quote Mapping Documentation

This document explains the mapping choices when transforming Quote domain models to Business Central Sales Quote format.

## Overview

The Quote slice transforms domain models (`Quote`, `QuoteLineItem`) into a generic `QuoteSubmissionData` format, which the Business Central Integration slice then transforms into the specific Business Central API format.

## Mapping Strategy

### 1. Line Item Descriptions

**Domain Model**: `QuoteLineItem.description`  
**Business Central Field**: `salesQuoteLines[].description`

**Format**: `"Product Name - [Dimensions] - [Coating Sides] - Qty: [quantity]"`

**Example**: `"MDF Powder Coating - 1000×500×18mm - Top, Bottom, Front - Qty: 5"`

**Rationale**:
- Provides clear, human-readable context in Business Central
- Includes all relevant configuration details (dimensions, coating sides, quantity)
- Format is consistent and deterministic
- Extensible for future PDF generation (same description can be used)

**Mapping Code**: `BusinessCentralQuoteMapper.mapQuoteToBusinessCentral()`

---

### 2. Product Identification

**Domain Model**: `QuoteLineItem.productId`  
**Business Central Field**: `salesQuoteLines[].itemNumber`

**Rationale**:
- Business Central uses item numbers to identify products
- Direct mapping preserves product identity
- Note: Business Central may require `itemId` (UUID) resolution from `itemNumber` (handled by BC Integration slice)

---

### 3. Pricing

**Domain Model**: 
- `QuoteLineItem.unitPrice` → `salesQuoteLines[].unitPrice`
- `QuoteLineItem.lineTotal` → `salesQuoteLines[].lineAmount`

**Rationale**:
- Business Central requires both unit price and line amount
- Line amount = unitPrice × quantity (already calculated deterministically in Quote domain)
- Prices are rounded to 2 decimal places for currency precision
- Business Central will recalculate totals, but we provide them for reference

**Calculation Order** (deterministic):
1. Sum all line totals → subtotal
2. Calculate tax from subtotal → tax (0% for MVP, BC handles tax)
3. Add subtotal + tax → total

---

### 4. Currency

**Domain Model**: `Quote.totals.currency`  
**Business Central Field**: `salesQuote.currencyCode` and `salesQuoteLines[].currencyCode`

**Rationale**:
- Business Central uses ISO currency codes (e.g., 'EUR', 'USD')
- Single currency per quote (MVP constraint)
- Currency is validated when adding line items (all must match)

---

### 5. Customer Number

**Domain Model**: Not in Quote model  
**Business Central Field**: `salesQuote.customerNumber` (required)

**Rationale**:
- Business Central requires a customer for sales quotes
- Customer selection is out of MVP scope
- Solution: Pass `customerNumber` as parameter to `mapQuoteToBusinessCentral()`
- Future: Customer management will be added in post-MVP

---

### 6. Line Numbers

**Domain Model**: Array index (0-based)  
**Business Central Field**: `salesQuoteLines[].lineNumber` (1-based)

**Rationale**:
- Business Central uses 1-based line numbers
- Simple conversion: `index + 1`
- Ensures proper ordering in Business Central

---

## Data Flow

```
Quote (Domain Model)
    ↓
mapQuoteToBusinessCentral()
    ↓
QuoteSubmissionData (Generic Format)
    ↓
Business Central Integration Slice
    ↓
Business Central API Format
    ↓
POST /api/v2.0/companies({companyId})/salesQuotes
```

## Deterministic Calculations

All calculations are deterministic to ensure reproducible totals:

1. **Line Totals**: `roundToCurrencyPrecision(unitPrice × quantity)`
   - Uses standard rounding (round half up)
   - Precision: 2 decimal places

2. **Quote Totals**: 
   - Subtotal: Sum of all line totals, rounded to 2 decimals
   - Tax: `subtotal × taxRate` (0% for MVP), rounded to 2 decimals
   - Total: `subtotal + tax`, rounded to 2 decimals

3. **Rounding Strategy**: `Math.round(value * 100) / 100`
   - Consistent across all calculations
   - Ensures currency precision

## Extensibility for PDF Generation

The quote structure is designed to be extensible for future PDF generation:

1. **Line Descriptions**: Already human-readable and complete
2. **Totals Structure**: Clear separation of subtotal, tax, total
3. **Configuration Details**: Preserved in `QuoteLineItem.configuration`
4. **Metadata**: Timestamps (`createdAt`, `updatedAt`) for audit trail

Future PDF generation can use:
- `QuoteLineItem.description` for line item text
- `Quote.totals` for summary section
- `QuoteLineItem.configuration` for detailed specifications

## Business Central API Assumptions

Based on Business Central API v2.0 documentation:

1. **Sales Quote Endpoint**: `POST /api/v2.0/companies({companyId})/salesQuotes`
2. **Required Fields**:
   - `customerNumber` (string)
   - `salesQuoteLines` (array)
   - Each line requires: `itemNumber`, `quantity`, `unitPrice`, `lineAmount`
3. **Optional Fields**:
   - `description` (line description)
   - `currencyCode` (defaults to company currency if not specified)

## Error Handling

The mapper validates:
- Quote has at least one line item
- Quote has not already been submitted
- Currency consistency (all line items must use same currency)

Errors are thrown as exceptions for the caller to handle.
