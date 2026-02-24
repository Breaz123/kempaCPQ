/**
 * CPQ API Hook
 * 
 * Provides API integration for CPQ functionality.
 * Connects UI to backend slices.
 */

import { useState, useCallback } from 'react';
import { BusinessCentralProduct, BusinessCentralPriceRequest, BusinessCentralPriceResponse, createBusinessCentralServicesFromEnv } from '../../slices/business-central';
import { MdfConfiguration } from '../../slices/configuration';
import { calculatePoederlakPrice } from '../../slices/configuration/services/PoederlakPricingService';
import { Quote, QuoteStatus, createQuote, addLineItemToQuote, PriceResponse } from '../../slices/quote';
import { mapQuoteToBusinessCentral } from '../../slices/quote/services/BusinessCentralQuoteMapper';

// Mock mode flag - set to true to skip Business Central
const USE_MOCK_MODE = true;

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
  {
    id: 'mock-2',
    number: 'MDF-002',
    description: 'MDF Powder Coating - Premium',
    displayName: 'MDF Powder Coating Premium',
    unitPrice: 35.75,
    currencyCode: 'EUR',
    unitOfMeasure: 'PCS',
    type: 'Service',
  },
];

// Check if Business Central is configured
function isBusinessCentralConfigured(): boolean {
  if (USE_MOCK_MODE) return false;
  
  const baseUrl = import.meta.env.VITE_BC_API_BASE_URL || import.meta.env.BC_API_BASE_URL;
  const companyId = import.meta.env.VITE_BC_COMPANY_ID || import.meta.env.BC_COMPANY_ID;
  const accessToken = import.meta.env.VITE_BC_ACCESS_TOKEN || import.meta.env.BC_ACCESS_TOKEN;
  const apiKey = import.meta.env.VITE_BC_API_KEY || import.meta.env.BC_API_KEY;
  
  return !!(baseUrl && companyId && (accessToken || apiKey));
}

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

export function useCpqApi() {
  console.log('[useCpqApi] Hook initializing...');
  
  const [products, setProducts] = useState<BusinessCentralProduct[]>([]);
  const [priceResponse, setPriceResponse] = useState<BusinessCentralPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockMode] = useState(() => !isBusinessCentralConfigured());

  // Initialize services
  const getServices = useCallback(() => {
    if (useMockMode) {
      throw new Error('Mock mode - Business Central not configured');
    }
    
    try {
      console.log('[useCpqApi] Creating Business Central services...');
      if (typeof createBusinessCentralServicesFromEnv !== 'function') {
        throw new Error('createBusinessCentralServicesFromEnv is not available. Check imports.');
      }
      const services = createBusinessCentralServicesFromEnv();
      console.log('[useCpqApi] Services created successfully');
      return services;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Business Central services';
      console.error('[useCpqApi] Error creating services:', err);
      throw new Error(errorMessage);
    }
  }, [useMockMode]);
  
  console.log('[useCpqApi] Hook initialized, mock mode:', useMockMode);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockMode) {
        // Use mock products
        console.log('[useCpqApi] Loading mock products...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setProducts(MOCK_PRODUCTS);
        console.log('[useCpqApi] Mock products loaded');
      } else {
        const services = getServices();
        const productsList = await services.products.getProducts();
        setProducts(productsList);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', err);
      // Don't throw - allow UI to render with error message
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
        // Use mock price calculation
        console.log('[useCpqApi] Calculating mock price...');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        const mockResponse = calculateMockPrice(itemNumber, configuration);
        setPriceResponse(mockResponse);
        console.log('[useCpqApi] Mock price calculated:', mockResponse);
      } else {
        const services = getServices();
        
        const priceRequest: BusinessCentralPriceRequest = {
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

  const submitQuote = useCallback(async (
    product: BusinessCentralProduct,
    configuration: MdfConfiguration,
    priceResponse: BusinessCentralPriceResponse,
    customerNumber: string
  ): Promise<Quote> => {
    setLoading(true);
    setError(null);
    try {
      // Create quote
      const quote = createQuote(`quote-${Date.now()}`, priceResponse.currencyCode);

      // Transform price response to PriceResponse format expected by quote builder
      const priceResponseForQuote: PriceResponse = {
        basePrice: priceResponse.unitPrice,
        optionPrices: [],
        totalPrice: priceResponse.unitPrice,
        currency: priceResponse.currencyCode,
      };

      // Add line item to quote
      const quoteWithLineItem = addLineItemToQuote(
        quote,
        product.number,
        product.description,
        configuration,
        priceResponseForQuote
      );

      if (useMockMode) {
        // Mock quote submission - just simulate delay and return quote
        console.log('[useCpqApi] Submitting mock quote...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const submittedQuote: Quote = {
          ...quoteWithLineItem,
          status: QuoteStatus.Submitted,
          updatedAt: new Date(),
        };
        
        console.log('[useCpqApi] Mock quote submitted:', submittedQuote);
        return submittedQuote;
      } else {
        // Real Business Central submission
        const services = getServices();
        const submissionData = mapQuoteToBusinessCentral(quoteWithLineItem, customerNumber);
        await services.quotes.submitQuote(submissionData);

        // Update quote status
        const submittedQuote: Quote = {
          ...quoteWithLineItem,
          status: QuoteStatus.Submitted,
          updatedAt: new Date(),
        };

        return submittedQuote;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quote';
      setError(errorMessage);
      console.error('Error submitting quote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getServices, useMockMode]);

  return {
    products,
    priceResponse,
    loading,
    error,
    loadProducts,
    calculatePrice,
    submitQuote,
  };
}
