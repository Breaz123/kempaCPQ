/**
 * Health Check Route
 * 
 * Health check endpoint voor monitoring en deployment checks.
 */

import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../../config/database';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  const dbConnected = await checkDatabaseConnection();

  const health = {
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? 'connected' : 'disconnected',
    },
  };

  const statusCode = dbConnected ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
