# CPQ UI

Minimal CPQ UI for internal sales use.

## Components

- **App.tsx**: Main application component orchestrating the CPQ flow
- **ConfigurationForm**: Form for MDF powder coating configuration
- **PriceBreakdown**: Displays price breakdown for configured product
- **QuoteResult**: Shows generated quote with line items and totals
- **useCpqApi**: Hook providing API integration with backend slices

## Usage

The UI connects to backend slices through the `useCpqApi` hook, which:
- Loads products from Business Central
- Calculates prices for configurations
- Submits quotes to Business Central

## Setup

This UI requires:
- React 18+
- TypeScript
- Backend slices configured with Business Central API credentials

Environment variables needed (for Business Central API):
- `BC_API_BASE_URL`
- `BC_COMPANY_ID`
- `BC_API_KEY` or `BC_CLIENT_ID` / `BC_CLIENT_SECRET`

## Flow

1. User fills configuration form (dimensions, quantity, coating sides)
2. System calculates price via Business Central API
3. Price breakdown is displayed
4. User enters customer number and generates quote
5. Quote is submitted to Business Central and result is displayed
