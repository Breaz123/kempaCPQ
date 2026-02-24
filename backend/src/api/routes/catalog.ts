/**
 * Catalog Routes
 * 
 * CRUD operations for catalog items
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../../config/database.js';
import { uploadImage, getStorageType } from '../../services/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
// Save to customer-app public folder (relative to backend)
const uploadDir = path.join(__dirname, '../../../src/customer-app/public/images/poederlak');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Upload directory created: ${uploadDir}`);
} else {
  console.log(`📁 Upload directory exists: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `catalog-${timestamp}-${sanitizedFilename}`;
    cb(null, filename);
  },
});

// Configure multer based on storage type
// For cloudinary, we still need to save temporarily to disk before uploading
const multerStorage = getStorageType() === 'cloudinary' 
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        // Temporary directory for cloudinary uploads
        const tempDir = path.join(__dirname, '../../../tmp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `temp-${timestamp}-${sanitizedFilename}`;
        cb(null, filename);
      },
    })
  : storage;

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      console.log(`📤 File upload attempt: ${file.originalname} (${file.mimetype})`);
      console.log(`   Storage type: ${getStorageType()}`);
      cb(null, true);
    } else {
      console.error(`❌ Invalid file type: ${file.originalname} (${file.mimetype})`);
      cb(new Error('Alleen afbeeldingen zijn toegestaan (jpeg, jpg, png, webp, gif)'));
    }
  },
});

// Simple auth middleware (in production, use proper JWT verification)
const authenticate = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Niet geautoriseerd',
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [email] = decoded.split(':');
    
    if (email === 'info@kempa.be') {
      return next();
    }
  } catch (error) {
    // Invalid token
  }

  return res.status(401).json({
    success: false,
    error: 'Niet geautoriseerd',
  });
};

// Get all catalog items (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await prisma.catalogItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen catalogus items',
    });
  }
});

// Get all catalog items (admin - includes inactive)
router.get('/admin', authenticate, async (req: Request, res: Response) => {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching catalog items:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen catalogus items',
    });
  }
});

// Create catalog item
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, order, isActive } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Titel en imageUrl zijn verplicht',
      });
    }

    const item = await prisma.catalogItem.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij aanmaken catalogus item',
    });
  }
});

// Update catalog item
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, order, isActive } = req.body;

    const item = await prisma.catalogItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error updating catalog item:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken catalogus item',
    });
  }
});

// Delete catalog item
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.catalogItem.delete({
      where: { id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij verwijderen catalogus item',
    });
  }
});

// Upload image endpoint
router.post('/upload', authenticate, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      console.error('❌ Upload failed: No file received');
      return res.status(400).json({
        success: false,
        error: 'Geen bestand geüpload',
      });
    }

    // Upload to storage (local or cloudinary)
    const result = await uploadImage(req.file.path, req.file.originalname);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    
    // Clean up temp file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to cleanup temp file:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Fout bij uploaden afbeelding',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

export default router;
