/**
 * Authentication Routes
 * 
 * Simple authentication for admin panel
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Hardcoded credentials (in production, use proper auth with JWT/hashing)
const ADMIN_EMAIL = 'info@kempa.be';
const ADMIN_PASSWORD = 'Kempa123!';

interface LoginRequest {
  email: string;
  password: string;
}

router.post('/login', (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email en wachtwoord zijn verplicht' 
    });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Simple session token (in production, use JWT)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    return res.json({
      success: true,
      token,
      user: {
        email: ADMIN_EMAIL,
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Ongeldige inloggegevens',
  });
});

router.post('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Geen token opgegeven',
    });
  }

  // Simple verification (in production, verify JWT)
  const token = authHeader.substring(7);
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email] = decoded.split(':');
    
    if (email === ADMIN_EMAIL) {
      return res.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
        },
      });
    }
  } catch (error) {
    // Invalid token
  }

  return res.status(401).json({
    success: false,
    error: 'Ongeldige token',
  });
});

export default router;
