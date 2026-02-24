/**
 * Customer CPQ API Hook
 * 
 * Provides API integration for customer-facing CPQ functionality.
 * Communicates with backend API instead of Business Central directly.
 */

import { useState, useCallback } from 'react';
import { BusinessCentralProduct, BusinessCentralPriceResponse, createBusinessCentralServicesFromEnv } from '../../slices/business-central';
import { MdfConfiguration } from '../../slices/configuration';
import { calculatePoederlakPrice } from '../../slices/configuration/services/PoederlakPricingService';
import { CustomerInfo } from '../components/CustomerInfoForm';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Mock mode flag - set to true to skip backend API
const USE_MOCK_MODE = false;

// Mock products for testing without Business Central
const MOCK_PRODUCTS: BusinessCentralProduct[] = [
  {
    id: 'mock-1',
    number: 'MDF-001',
    description: 'MDF Powder Coating - Standard',
    displayName: 'MDF Powder Coating',
    unitPrice: 25.50,
    currencyCode: 'EUR',
    unitOfMeasure: 'PCS',
    type: 'Service',
  },
];

// Mock price calculation op basis van interne poederlak-formule
function calculateMockPrice(
  itemNumber: string,
  configuration: MdfConfiguration
): BusinessCentralPriceResponse {
  const result = calculatePoederlakPrice(configuration);

  const roundCurrency = (value: number) => Math.round(value * 100) / 100;

  return {
    unitPrice: roundCurrency(result.unitPrice),
    totalPrice: roundCurrency(result.totalPrice),
    currencyCode: 'EUR',
    itemNumber,
    quantity: configuration.quantity,
    unitOfMeasure: 'PCS',
    details: {
      pricingModel: 'poederlak-local',
      basePricePerM2: result.basePricePerM2,
      effectivePricePerM2: result.effectivePricePerM2,
      rawAreaPerPieceM2: result.rawAreaPerPieceM2,
      chargedAreaPerPieceM2: result.chargedAreaPerPieceM2,
      totalChargedAreaM2: result.totalChargedAreaM2,
      thicknessFactor: result.thicknessFactor,
    },
  };
}

// Check if Business Central is configured (for price calculation)
function isBusinessCentralConfigured(): boolean {
  const baseUrl = import.meta.env.VITE_BC_API_BASE_URL || import.meta.env.BC_API_BASE_URL;
  const companyId = import.meta.env.VITE_BC_COMPANY_ID || import.meta.env.BC_COMPANY_ID;
  const accessToken = import.meta.env.VITE_BC_ACCESS_TOKEN || import.meta.env.BC_ACCESS_TOKEN;
  const apiKey = import.meta.env.VITE_BC_API_KEY || import.meta.env.BC_API_KEY;
  
  return !!(baseUrl && companyId && (accessToken || apiKey));
}

export interface QuoteRequestResponse {
  success: boolean;
  data: {
    id: string;
    requestNumber: string;
    status: string;
    submittedAt: string;
    customerEmail: string;
  };
}

export function useCustomerCpqApi() {
  const [products, setProducts] = useState<BusinessCentralProduct[]>([]);
  const [priceResponse, setPriceResponse] = useState<BusinessCentralPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockMode] = useState(() => !isBusinessCentralConfigured() || USE_MOCK_MODE);

  // Initialize services for price calculation
  const getServices = useCallback(() => {
    if (useMockMode) {
      throw new Error('Mock mode - Business Central not configured');
    }
    
    try {
      return createBusinessCentralServicesFromEnv();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Business Central services';
      throw new Error(errorMessage);
    }
  }, [useMockMode]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockMode) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(MOCK_PRODUCTS);
      } else {
        const services = getServices();
        const productsList = await services.products.getProducts();
        setProducts(productsList);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [getServices, useMockMode]);

  const calculatePrice = useCallback(async (
    itemNumber: string,
    configuration: MdfConfiguration
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (useMockMode) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockResponse = calculateMockPrice(itemNumber, configuration);
        setPriceResponse(mockResponse);
      } else {
        const services = getServices();
        
        const priceRequest = {
          itemNumber,
          quantity: configuration.quantity,
          attributes: {
            lengthMm: configuration.lengthMm,
            widthMm: configuration.widthMm,
            heightMm: configuration.heightMm,
            coatingSides: configuration.coatingSides,
          },
        };

        const response = await services.pricing.calculatePrice(priceRequest);
        setPriceResponse(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate price';
      setError(errorMessage);
      console.error('Error calculating price:', err);
    } finally {
      setLoading(false);
    }
  }, [getServices, useMockMode]);

  const submitQuoteRequest = useCallback(async (
    customerInfo: CustomerInfo,
    product: BusinessCentralProduct,
    configuration: MdfConfiguration,
    priceResponse: BusinessCentralPriceResponse
  ): Promise<QuoteRequestResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare request data
      const requestData = {
        customerInfo,
        configuration: {
          ...configuration,
          createdAt: configuration.createdAt.toISOString(),
          updatedAt: configuration.updatedAt.toISOString(),
        },
        product,
        priceResponse,
      };

      if (USE_MOCK_MODE) {
        // Mock response
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          data: {
            id: `mock-${Date.now()}`,
            requestNumber: `QR-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            customerEmail: customerInfo.email,
          },
        };
      }

      // Call backend API
      const apiUrl = `${API_BASE_URL}/api/quote-requests`;
      console.log('[useCustomerCpqApi] Submitting quote request to:', apiUrl);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: `HTTP error! status: ${response.status}` };
          }
          const errorMsg = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMsg);
        }

        let result: QuoteRequestResponse;
        try {
          result = await response.json();
        } catch (parseError) {
          throw new Error('Ongeldig antwoord van de server. Probeer het opnieuw.');
        }

        // Validate response structure
        if (!result || typeof result !== 'object') {
          throw new Error('Ongeldig antwoordformaat van de server.');
        }

        if (!result.success) {
          throw new Error('De aanvraag kon niet worden verwerkt.');
        }

        if (!result.data) {
          throw new Error('Geen data ontvangen van de server.');
        }

        return result;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('De aanvraag duurde te lang. Controleer uw internetverbinding en probeer het opnieuw.');
        }
        
        throw fetchError;
      }
    } catch (err) {
      let errorMessage = 'Failed to submit quote request';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - server might not be running or CORS issue
        errorMessage = `Kan niet verbinden met de server. Controleer of de backend API draait op ${API_BASE_URL}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error submitting quote request:', err);
      console.error('API URL was:', `${API_BASE_URL}/api/quote-requests`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    priceResponse,
    loading,
    error,
    loadProducts,
    calculatePrice,
    submitQuoteRequest,
  };
}
