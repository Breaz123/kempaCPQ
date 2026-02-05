# CPQ MVP Architecture Document

## 1. MVP Scope Definition

### IN Scope (MVP)

**Configuration**
- Product catalog browsing
- Product selection
- Basic product configuration (attributes, options)
- Configuration validation (required fields, compatibility rules)
- Configuration persistence (session-based)

**Pricing**
- Real-time price calculation via Business Central API
- Price display for configured products
- Price breakdown (base price + options)
- Currency handling (single currency for MVP)

**Quote**
- Quote creation from configuration
- Quote line items
- Quote summary (totals, line count)
- Quote persistence (session-based)
- Quote export/view (read-only format)

**Business Central Integration**
- Product catalog sync (read-only)
- Price lookup/calculation
- Quote submission (create sales quote in BC)
- Error handling for BC API failures

### OUT Scope (Post-MVP)

- User authentication/authorization
- Multi-currency support
- Quote history/persistence across sessions
- Advanced pricing rules (discounts, promotions)
- Quote approval workflows
- PDF generation
- Email functionality
- Product images/media
- Advanced configuration rules (conditional logic, dependencies)
- Quote editing after creation
- Quote comparison
- Customer management
- Inventory availability
- Shipping calculations

---

## 2. Vertical Slice Architecture

### Architecture Principles

- **Feature-first organization**: Code organized by business capability, not technical layer
- **Self-contained slices**: Each slice owns its data models, business logic, and interfaces
- **Minimal coupling**: Slices communicate through well-defined public interfaces
- **No premature abstraction**: Shared code only when duplication is proven harmful
- **Single responsibility**: Each slice has one clear purpose

### Slice Communication Pattern

```
┌─────────────┐
│   Quote     │
│   Slice     │
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐     ┌─────────────┐
│  Pricing    │────▶│ Business    │
│   Slice     │     │  Central    │
└──────┬──────┘     │ Integration │
       │ uses       └─────────────┘
       ▼
┌─────────────┐
│Configuration│
│   Slice     │
└─────────────┘
```

---

## 3. Slice Definitions

### Slice 1: Configuration

**Purpose**
Manage product catalog and product configuration state.

**Responsibilities**
- Load product catalog from Business Central
- Present products for selection
- Handle product attribute configuration
- Validate configuration completeness
- Store configuration state (session-based)
- Provide configuration data to other slices

**Key Models**
- `Product` (id, code, name, description, attributes)
- `ProductAttribute` (id, name, type, required, options)
- `Configuration` (productId, attributeValues, isValid)
- `ConfigurationState` (sessionId, configurations)

**Public Interfaces**
- `getProducts(): Product[]`
- `getProductById(id: string): Product | null`
- `createConfiguration(productId: string): Configuration`
- `updateConfiguration(configId: string, attributeId: string, value: any): Configuration`
- `validateConfiguration(configId: string): boolean`
- `getConfiguration(configId: string): Configuration | null`

**Dependencies**
- Business Central Integration (for product catalog)

---

### Slice 2: Pricing

**Purpose**
Calculate and retrieve prices for configured products.

**Responsibilities**
- Request price calculation from Business Central
- Handle price responses
- Format price display
- Calculate line item totals

**Key Models**
- `PriceRequest` (productId, configuration, quantity)
- `PriceResponse` (basePrice, optionPrices, totalPrice, currency)
- `PriceBreakdown` (basePrice, options, subtotal, total)

**Public Interfaces**
- `calculatePrice(productId: string, configuration: Configuration, quantity: number): Promise<PriceResponse>`
- `getPriceBreakdown(priceResponse: PriceResponse): PriceBreakdown`
- `formatPrice(amount: number, currency: string): string`

**Dependencies**
- Configuration Slice (for configuration data)
- Business Central Integration (for price API)

---

### Slice 3: Quote

**Purpose**
Create and manage quotes from configurations.

**Responsibilities**
- Create quote from configurations
- Manage quote line items
- Calculate quote totals
- Store quote state (session-based)
- Prepare quote for Business Central submission
- Display quote summary

**Key Models**
- `Quote` (id, lineItems, totals, createdAt, status)
- `QuoteLineItem` (productId, configuration, quantity, unitPrice, lineTotal)
- `QuoteTotals` (subtotal, tax, total, currency)

**Public Interfaces**
- `createQuote(): Quote`
- `addLineItem(quoteId: string, productId: string, configuration: Configuration, quantity: number, price: PriceResponse): Quote`
- `removeLineItem(quoteId: string, lineItemId: string): Quote`
- `updateLineItemQuantity(quoteId: string, lineItemId: string, quantity: number): Quote`
- `calculateTotals(quoteId: string): QuoteTotals`
- `getQuote(quoteId: string): Quote | null`
- `prepareForSubmission(quoteId: string): QuoteSubmissionData` (generic format, BC Integration transforms it)

**Dependencies**
- Configuration Slice (for configuration data)
- Pricing Slice (for price data)

---

### Slice 4: Business Central Integration

**Purpose**
Handle all communication with Business Central API.

**Responsibilities**
- Product catalog retrieval
- Price calculation requests
- Quote submission
- API error handling
- Request/response transformation
- API authentication (if required)

**Key Models**
- `BusinessCentralProduct` (no, description, unitPrice, attributes)
- `BusinessCentralPriceRequest` (itemNo, variantCode, quantity, attributes)
- `BusinessCentralPriceResponse` (unitPrice, totalPrice, currency)
- `BusinessCentralQuoteRequest` (customerNo, lines)
- `BusinessCentralQuoteResponse` (quoteNo, status)
- `ApiError` (code, message, details)

**Public Interfaces**
- `getProducts(): Promise<BusinessCentralProduct[]>`
- `getProductByCode(code: string): Promise<BusinessCentralProduct | null>`
- `calculatePrice(request: BusinessCentralPriceRequest): Promise<BusinessCentralPriceResponse>`
- `submitQuote(submissionData: QuoteSubmissionData): Promise<BusinessCentralQuoteResponse>` (accepts generic format, transforms internally)
- `handleApiError(error: unknown): ApiError`

**Dependencies**
- External: Business Central API endpoints

---

## 4. Folder Structure

```
CPQ-Kempa/
├── src/
│   ├── slices/
│   │   ├── configuration/
│   │   │   ├── models/
│   │   │   │   ├── Product.ts
│   │   │   │   ├── ProductAttribute.ts
│   │   │   │   ├── Configuration.ts
│   │   │   │   └── ConfigurationState.ts
│   │   │   ├── services/
│   │   │   │   ├── ConfigurationService.ts
│   │   │   │   └── ValidationService.ts
│   │   │   └── index.ts (public exports)
│   │   │
│   │   ├── pricing/
│   │   │   ├── models/
│   │   │   │   ├── PriceRequest.ts
│   │   │   │   ├── PriceResponse.ts
│   │   │   │   └── PriceBreakdown.ts
│   │   │   ├── services/
│   │   │   │   ├── PricingService.ts
│   │   │   │   └── PriceFormatter.ts
│   │   │   └── index.ts (public exports)
│   │   │
│   │   ├── quote/
│   │   │   ├── models/
│   │   │   │   ├── Quote.ts
│   │   │   │   ├── QuoteLineItem.ts
│   │   │   │   └── QuoteTotals.ts
│   │   │   ├── services/
│   │   │   │   ├── QuoteService.ts
│   │   │   │   └── QuoteCalculator.ts
│   │   │   └── index.ts (public exports)
│   │   │
│   │   └── business-central/
│   │       ├── models/
│   │       │   ├── BusinessCentralProduct.ts
│   │       │   ├── BusinessCentralPriceRequest.ts
│   │       │   ├── BusinessCentralPriceResponse.ts
│   │       │   ├── BusinessCentralQuoteRequest.ts
│   │       │   ├── BusinessCentralQuoteResponse.ts
│   │       │   └── ApiError.ts
│   │       ├── services/
│   │       │   ├── BusinessCentralApiClient.ts
│   │       │   ├── ProductApiService.ts
│   │       │   ├── PriceApiService.ts
│   │       │   └── QuoteApiService.ts
│   │       ├── mappers/
│   │       │   ├── ProductMapper.ts
│   │       │   ├── PriceMapper.ts
│   │       │   └── QuoteMapper.ts
│   │       └── index.ts (public exports)
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── common.ts (only truly shared types)
│   │   │   └── QuoteSubmissionData.ts (contract between Quote and BC Integration slices)
│   │   └── utils/
│   │       └── session.ts (session management if needed)
│   │
│   └── app/
│       └── (UI layer - to be defined when implementing)
│
├── tests/
│   └── (mirror src structure)
│
├── docs/
│   └── ARCHITECTURE.md (this file)
│
└── (config files: package.json, tsconfig.json, etc.)
```

**Notes on Structure:**
- Each slice is self-contained in its own folder
- Models define the slice's domain entities
- Services contain business logic and orchestration
- Public interfaces exported via `index.ts`
- Shared folder only for truly cross-cutting concerns
- No shared business logic between slices

---

## 5. Data Flow

### Flow 1: Configuration → Pricing → Quote → Business Central

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User selects product                                         │
│    Configuration.createConfiguration(productId)                 │
└────────────────────┬────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. User configures product attributes                           │
│    Configuration.updateConfiguration(configId, attrId, value)   │
│    Configuration.validateConfiguration(configId)                │
└────────────────────┬────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. System requests price                                        │
│    Pricing.calculatePrice(productId, configuration, quantity)  │
│         │                                                        │
│         └─▶ BusinessCentral.calculatePrice(BCPriceRequest)      │
│             (transforms to BC format, calls API)                │
│         │                                                        │
│         ◀─ BusinessCentralPriceResponse                          │
│    (transforms BC response to PriceResponse)                   │
└────────────────────┬────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. User adds item to quote                                      │
│    Quote.addLineItem(quoteId, productId, config, qty, price)   │
│    Quote.calculateTotals(quoteId)                               │
└────────────────────┬────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. User submits quote                                           │
│    Quote.prepareForSubmission(quoteId)                          │
│         │                                                        │
│         └─▶ QuoteSubmissionData (generic format)                 │
│         │                                                        │
│         └─▶ BusinessCentral.submitQuote(BCQuoteRequest)          │
│             (transforms QuoteSubmissionData to BC format,        │
│              calls API)                                          │
│         │                                                        │
│         ◀─ BusinessCentralQuoteResponse                          │
│    (returns quote number and status)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Initial Product Catalog Load

```
┌─────────────────────────────────────────────────────────────────┐
│ Application Startup                                              │
│    BusinessCentral.getProducts()                                 │
│         │                                                        │
│         └─▶ Calls BC API: GET /items                            │
│         │                                                        │
│         ◀─ BusinessCentralProduct[]                              │
│    (transforms to Product[])                                    │
│         │                                                        │
│         └─▶ Configuration stores products                       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Transformation Points

1. **BC Product → Product**: Business Central Integration maps BC product structure to Configuration slice's Product model
2. **Configuration → BC Price Request**: Pricing slice transforms Configuration to BC price request format
3. **BC Price Response → Price Response**: Business Central Integration maps BC response to Pricing slice's PriceResponse model
4. **Quote → QuoteSubmissionData**: Quote slice transforms Quote to generic submission format
5. **QuoteSubmissionData → BC Quote Request**: Business Central Integration maps QuoteSubmissionData to BC quote submission format

---

## 6. External Dependencies

### Business Central API Endpoints

**Product Catalog**
- **Endpoint**: `GET /api/v2.0/companies({companyId})/items`
- **Purpose**: Retrieve product catalog
- **Response**: Array of items with product details
- **Frequency**: On application startup, periodic refresh (if needed)
- **Authentication**: OAuth 2.0 / API Key (to be confirmed)

**Price Calculation**
- **Endpoint**: `POST /api/v2.0/companies({companyId})/salesQuotes({quoteId})/salesQuoteLines` (or dedicated pricing endpoint)
- **Alternative**: `GET /api/v2.0/companies({companyId})/items({itemId})/unitPrice` with query parameters
- **Purpose**: Get price for configured product
- **Request**: Item number, variant code, quantity, attributes
- **Response**: Unit price, total price, currency
- **Frequency**: Real-time on configuration changes
- **Authentication**: OAuth 2.0 / API Key (to be confirmed)

**Quote Submission**
- **Endpoint**: `POST /api/v2.0/companies({companyId})/salesQuotes`
- **Purpose**: Create sales quote in Business Central
- **Request**: Customer number, quote lines (items, quantities, prices)
- **Response**: Quote number, status, creation date
- **Frequency**: On user submission
- **Authentication**: OAuth 2.0 / API Key (to be confirmed)

### Configuration Requirements

**Environment Variables**
- `BC_API_BASE_URL`: Business Central API base URL
- `BC_COMPANY_ID`: Business Central company ID
- `BC_API_KEY` or `BC_CLIENT_ID` / `BC_CLIENT_SECRET`: Authentication credentials
- `BC_API_VERSION`: API version (default: v2.0)

**API Constraints**
- Rate limiting (to be determined)
- Request timeout: 30 seconds (configurable)
- Retry policy: 3 attempts with exponential backoff
- Error handling: Map BC error codes to application errors

### Assumptions (To Be Validated)

1. Business Central API version: v2.0 (standard)
2. Authentication method: OAuth 2.0 or API Key
3. Product attributes can be passed as variant codes or custom fields
4. Price calculation is synchronous (no async job polling)
5. Quote submission creates a draft quote (not automatically sent to customer)
6. Single currency per quote (no multi-currency in MVP)

---

## 7. Technical Decisions

### State Management
- **Session-based storage**: Use browser sessionStorage for MVP
- **No persistence**: Quotes/configurations lost on session end (MVP constraint)
- **Future**: Database persistence post-MVP

### Error Handling
- **API errors**: Business Central Integration slice handles and transforms
- **Validation errors**: Each slice validates its own inputs
- **User-facing errors**: Simple, clear error messages

### Testing Strategy
- **Unit tests**: Each slice tested independently
- **Integration tests**: Slice interactions tested
- **API mocking**: Business Central API mocked for tests
- **No E2E tests**: Out of MVP scope

### Technology Stack (To Be Confirmed)
- **Language**: TypeScript (assumed from rules)
- **Runtime**: Node.js / Browser (to be determined)
- **HTTP Client**: Fetch API or axios (to be determined)
- **Build Tool**: To be determined

---

## 8. Slice Interaction Rules

### Allowed Interactions

1. **Quote → Pricing**: Quote slice can call Pricing slice interfaces
2. **Quote → Configuration**: Quote slice can read Configuration data
3. **Pricing → Configuration**: Pricing slice can read Configuration data
4. **Pricing → Business Central**: Pricing slice can call BC Integration
5. **Configuration → Business Central**: Configuration slice can call BC Integration for product catalog
6. **Quote → Business Central**: Quote slice can call BC Integration for submission

### Prohibited Interactions

1. **Configuration → Pricing**: Configuration should not know about pricing
2. **Configuration → Quote**: Configuration should not know about quotes
3. **Business Central → Any Slice**: BC Integration is a pure adapter, no callbacks
4. **Pricing → Quote**: Pricing should not know about quotes

### Shared Contracts

- **QuoteSubmissionData**: Defined in `shared/types` as a contract between Quote slice and Business Central Integration slice. This is not premature abstraction but a necessary interface contract.

### Data Flow Direction

```
Business Central Integration (lowest level)
         ▲
         │
    ┌────┴────┐
    │         │
Pricing   Configuration
    │         │
    └────┬────┘
         │
       Quote (highest level)
```

---

## 9. MVP Constraints & Simplifications

1. **No user management**: Anonymous sessions only
2. **No quote history**: Quotes exist only in current session
3. **Single currency**: No currency conversion
4. **Basic validation**: Required fields and simple compatibility only
5. **No offline mode**: Requires Business Central API connectivity
6. **No caching**: Fresh API calls for each price request (Business Central is source of truth, no local price storage)
7. **No batch operations**: One product/price/quote at a time
8. **No quote editing**: Quotes are immutable after creation

---

## 10. Open Questions

1. **Business Central API version**: Confirm v2.0 or v1.0
2. **Authentication method**: OAuth 2.0 vs API Key
3. **Product attributes**: How are custom attributes represented in BC?
4. **Price calculation**: Is there a dedicated pricing endpoint or use quote lines?
5. **Variant codes**: How are product variants identified?
6. **Customer context**: Is customer number required for pricing or only for quote submission?
7. **Error codes**: What are the standard BC API error codes?
8. **Rate limits**: What are BC API rate limits?

---

## Architecture Ready for Slicing
