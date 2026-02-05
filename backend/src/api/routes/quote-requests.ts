/**
 * Quote Requests API Routes
 * 
 * REST API endpoints voor offerte aanvragen.
 */

import { Router, Request, Response } from 'express';
import {
  createQuoteRequest,
  getQuoteRequestById,
  getQuoteRequestByNumber,
  getAllQuoteRequests,
  updateQuoteRequestStatus,
} from '../../services/QuoteRequestService.js';
import { QuoteRequestStatus } from '../../types/QuoteRequestStatus.js';
import { createQuoteRequestSchema, CreateQuoteRequestInput } from '../../validators/quoteRequestValidator.js';

const router = Router();

/**
 * POST /api/quote-requests
 * Maakt een nieuwe offerte aanvraag aan
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Validatie met Zod schema
    const validationResult = createQuoteRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const input: CreateQuoteRequestInput = validationResult.data;
    const quoteRequest = await createQuoteRequest(input);

    res.status(201).json({
      success: true,
      data: quoteRequest,
    });
  } catch (error) {
    console.error('Error creating quote request:', error);
    res.status(500).json({
      error: 'Failed to create quote request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/quote-requests/:id
 * Haalt een specifieke offerte aanvraag op
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quoteRequest = await getQuoteRequestById(id);

    if (!quoteRequest) {
      return res.status(404).json({
        error: 'Quote request not found',
      });
    }

    res.json({
      success: true,
      data: quoteRequest,
    });
  } catch (error) {
    console.error('Error fetching quote request:', error);
    res.status(500).json({
      error: 'Failed to fetch quote request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/quote-requests/number/:requestNumber
 * Haalt een offerte aanvraag op bij request number
 */
router.get('/number/:requestNumber', async (req: Request, res: Response) => {
  try {
    const { requestNumber } = req.params;
    const quoteRequest = await getQuoteRequestByNumber(requestNumber);

    if (!quoteRequest) {
      return res.status(404).json({
        error: 'Quote request not found',
      });
    }

    res.json({
      success: true,
      data: quoteRequest,
    });
  } catch (error) {
    console.error('Error fetching quote request:', error);
    res.status(500).json({
      error: 'Failed to fetch quote request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/quote-requests
 * Haalt alle offerte aanvragen op (met optionele filters)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, customerEmail, limit, offset } = req.query;

    const quoteRequests = await getAllQuoteRequests({
      status: status as QuoteRequestStatus | undefined,
      customerEmail: customerEmail as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: quoteRequests,
      count: quoteRequests.length,
    });
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    res.status(500).json({
      error: 'Failed to fetch quote requests',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/quote-requests/:id/status
 * Update de status van een offerte aanvraag
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, bcQuoteNumber } = req.body;

    if (!status || !Object.values(QuoteRequestStatus).includes(status)) {
      return res.status(400).json({
        error: 'Valid status is required',
      });
    }

    const quoteRequest = await updateQuoteRequestStatus(id, status as QuoteRequestStatus, {
      rejectionReason,
      bcQuoteNumber,
    });

    res.json({
      success: true,
      data: quoteRequest,
    });
  } catch (error) {
    console.error('Error updating quote request status:', error);
    res.status(500).json({
      error: 'Failed to update quote request status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
