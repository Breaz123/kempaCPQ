/**
 * Customer CPQ API Hook
 * 
 * Provides API integration for customer-facing CPQ functionality.
 * Communicates with backend API instead of Business Central directly.
 */

import { useState, useCallback } from 'react';
import { BusinessCentralProduct, BusinessCentralPriceResponse, createBusinessCentralServicesFromEnv } from '../../slices/business-central';
import { MdfConfiguration } from '../../slices/configuration';
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

// Mock price calculation (same as sales version)
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
      const response = await fetch(`${API_BASE_URL}/api/quote-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: QuoteRequestResponse = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quote request';
      setError(errorMessage);
      console.error('Error submitting quote request:', err);
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
