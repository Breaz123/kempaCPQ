/**
 * Express API Server
 * 
 * Main server entry point voor CPQ Kempa Backend API.
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import quoteRequestsRouter from './routes/quote-requests.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import catalogRouter from './routes/catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Parse allowed origins from environment
const parseAllowedOrigins = (): string | string[] => {
  if (process.env.CORS_ORIGIN) {
    // If CORS_ORIGIN is set, use it (can be comma-separated)
    const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(o => o.length > 0);
    
    // If multiple origins, return array
    if (origins.length > 1) {
      return origins;
    }
    
    // Single origin
    if (origins.length === 1) {
      return origins[0];
    }
  }
  
  // In development, allow both sales app (5173) and customer app (5174)
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:5173', 'http://localhost:5174'];
  }
  
  // Production fallback
  return CORS_ORIGIN;
};

// Get allowed origins once
const allowedOrigins = parseAllowedOrigins();

// CORS origin validation function - supports Vercel preview URLs
const corsOriginCallback = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // If no origin (e.g., same-origin request), allow it
  if (!origin) {
    return callback(null, true);
  }
  
  // If allowedOrigins is a string, check exact match
  if (typeof allowedOrigins === 'string') {
    // Also allow Vercel preview URLs if main Vercel domain is configured
    if (origin.includes('.vercel.app') && allowedOrigins.includes('vercel.app')) {
      return callback(null, true);
    }
    return callback(null, origin === allowedOrigins);
  }
  
  // If allowedOrigins is an array, check if origin is in array
  if (Array.isArray(allowedOrigins)) {
    // Also check for Vercel preview URLs if main domain is in the list
    const isVercelPreview = origin.includes('.vercel.app');
    const hasVercelDomain = allowedOrigins.some(o => typeof o === 'string' && o.includes('vercel.app'));
    
    if (isVercelPreview && hasVercelDomain) {
      // Allow any Vercel preview deployment if main Vercel domain is allowed
      return callback(null, true);
    }
    
    return callback(null, allowedOrigins.includes(origin));
  }
  
  // Fallback: deny
  callback(null, false);
};

// Determine CORS origin configuration
// Use callback function in production for dynamic Vercel preview URL support
// Use static origins in development for better performance
const corsOriginConfig = process.env.NODE_ENV === 'production' && process.env.CORS_ORIGIN
  ? corsOriginCallback
  : allowedOrigins;

// Middleware
app.use(cors({
  origin: corsOriginConfig,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from customer-app public folder
// This ensures images are always accessible, even if Vite doesn't serve them correctly
const publicPath = path.join(__dirname, '../../src/customer-app/public');
app.use('/images', express.static(path.join(publicPath, 'images')));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/quote-requests', quoteRequestsRouter);
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'CPQ Kempa Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      quoteRequests: '/api/quote-requests',
      auth: '/api/auth',
      catalog: '/api/catalog',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Quote requests: http://localhost:${PORT}/api/quote-requests`);
});
