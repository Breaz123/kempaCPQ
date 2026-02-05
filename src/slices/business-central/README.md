# Business Central Integration Slice

This slice handles all communication with Business Central API. It provides typed interfaces for:
- Product catalog retrieval
- Price calculation
- Sales quote creation
- Error handling

## Architecture

This slice follows the Vertical Slice Architecture pattern and is self-contained:
- **Models**: Business Central-specific data structures
- **Services**: API client and service classes for each domain (products, pricing, quotes)
- **Public Interface**: Exported via `index.ts` - other slices should only import from here

## Environment Variables

The following environment variables are required for Business Central API integration:

### Required

- **`BC_API_BASE_URL`**: Base URL for Business Central API
  - Example: `https://api.businesscentral.dynamics.com`
  - Example (sandbox): `https://api.businesscentral.dynamics.com/v2.0`

- **`BC_COMPANY_ID`**: Business Central company ID (GUID)
  - Example: `12345678-1234-1234-1234-123456789012`
  - Found in Business Central API URL: `/companies({companyId})/`

- **`BC_ACCESS_TOKEN`** or **`BC_API_KEY`**: Authentication token
  - Either `BC_ACCESS_TOKEN` (OAuth Bearer token) or `BC_API_KEY` (API key) must be provided
  - For OAuth: Token obtained from Azure AD authentication flow
  - For API Key: Static API key if supported by your BC instance

### Optional

- **`BC_API_VERSION`**: API version (default: `v2.0`)
  - Example: `v2.0`

- **`BC_API_TIMEOUT`**: Request timeout in milliseconds (default: `30000`)
  - Example: `30000` (30 seconds)

## Usage

### Basic Setup

```typescript
import { createBusinessCentralServicesFromEnv } from './slices/business-central';

// Create services from environment variables
const { apiClient, products, pricing, quotes } = createBusinessCentralServicesFromEnv();
```

### Manual Setup

```typescript
import {
  BusinessCentralApiClient,
  ProductApiService,
  PriceApiService,
  QuoteApiService,
} from './slices/business-central';

// Create API client
const apiClient = new BusinessCentralApiClient({
  baseUrl: 'https://api.businesscentral.dynamics.com',
  companyId: 'your-company-id',
  accessToken: 'your-access-token',
});

// Create services
const products = new ProductApiService(apiClient);
const pricing = new PriceApiService(apiClient);
const quotes = new QuoteApiService(apiClient);
```

### Fetching Products

```typescript
// Get all products
const allProducts = await products.getProducts();

// Get product by number
const product = await products.getProductByNumber('ITEM001');

// Get product by ID
const productById = await products.getProductById('uuid-here');
```

### Calculating Prices

```typescript
// Calculate price for a configured product
const priceResponse = await pricing.calculatePrice({
  itemNumber: 'ITEM001',
  quantity: 5,
  customerNumber: 'CUST001', // Optional
  variantCode: 'VAR001', // Optional
});

console.log(`Unit Price: ${priceResponse.unitPrice}`);
console.log(`Total Price: ${priceResponse.totalPrice}`);
console.log(`Currency: ${priceResponse.currencyCode}`);

// Get unit price only
const unitPrice = await pricing.getUnitPrice('ITEM001', 'CUST001');
```

### Creating Sales Quotes

```typescript
import { QuoteSubmissionData } from '../shared/types/QuoteSubmissionData';

// Prepare quote submission data (from Quote slice)
const submissionData: QuoteSubmissionData = {
  customerNumber: 'CUST001',
  currencyCode: 'EUR',
  lines: [
    {
      lineNumber: 1,
      itemNumber: 'ITEM001',
      description: 'Product Description',
      quantity: 5,
      unitPrice: 100.00,
      lineAmount: 500.00,
      currencyCode: 'EUR',
    },
  ],
  totals: {
    subtotal: 500.00,
    tax: 0,
    total: 500.00,
  },
};

// Submit quote to Business Central
const quoteResponse = await quotes.submitQuote(submissionData);

console.log(`Quote Number: ${quoteResponse.number}`);
console.log(`Quote Status: ${quoteResponse.status}`);
```

### Error Handling

```typescript
import { ApiError, ApiErrorCode, createApiError } from './slices/business-central';

try {
  const products = await productsService.getProducts();
} catch (error) {
  const apiError = createApiError(error);
  
  switch (apiError.code) {
    case ApiErrorCode.AuthenticationFailed:
      console.error('Authentication failed. Check your access token.');
      break;
    case ApiErrorCode.NotFound:
      console.error('Resource not found.');
      break;
    case ApiErrorCode.NetworkError:
      console.error('Network error. Check your connection.');
      break;
    default:
      console.error('An error occurred:', apiError.message);
  }
}
```

## API Client Features

### Authentication

The API client supports two authentication methods:
1. **Bearer Token** (OAuth): Use `accessToken` in config or `BC_ACCESS_TOKEN` env var
2. **API Key**: Use `apiKey` in config or `BC_API_KEY` env var

### Retry Logic

The API client automatically retries failed requests for retryable errors:
- Network errors
- Timeouts
- Server errors (5xx)
- Rate limit errors (429)

Default: 3 retries with exponential backoff (2^attempt * 100ms)

### Timeout Handling

Requests timeout after 30 seconds by default (configurable via `timeout` or `BC_API_TIMEOUT`).

## Testing

The API client and services are designed to be easily mockable for testing:

```typescript
// Mock the API client
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
} as unknown as BusinessCentralApiClient;

// Create services with mock client
const products = new ProductApiService(mockApiClient);
const pricing = new PriceApiService(mockApiClient);
const quotes = new QuoteApiService(mockApiClient);
```

## Business Central API Endpoints

This slice uses the following Business Central API endpoints:

- **Products**: `GET /api/v2.0/companies({companyId})/items`
- **Price Calculation**: `GET /api/v2.0/companies({companyId})/items` (with filter)
- **Sales Quotes**: `POST /api/v2.0/companies({companyId})/salesQuotes`

## Error Codes

The slice provides structured error codes:

- `AUTHENTICATION_FAILED`: Authentication failed (401)
- `AUTHORIZATION_FAILED`: Authorization failed (403)
- `NOT_FOUND`: Resource not found (404)
- `BAD_REQUEST`: Bad request (400)
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded (429)
- `SERVER_ERROR`: Server error (500+)
- `NETWORK_ERROR`: Network/connection error
- `TIMEOUT`: Request timeout
- `UNKNOWN`: Unknown error

## Notes

- All Business Central-specific logic is isolated in this slice
- Other slices should use the generic `QuoteSubmissionData` format, not BC-specific types
- The slice handles transformation between generic and BC-specific formats internally
- Prices are rounded to 2 decimal places for currency precision
- The API client uses the native `fetch` API (works in both Node.js and browser)
