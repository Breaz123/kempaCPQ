/**
 * Storage Service
 * 
 * Handles file uploads to either local filesystem or cloud storage (Cloudinary)
 * Configure via environment variables
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage type: 'local' or 'cloudinary'
let STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

// Cloudinary configuration
if (STORAGE_TYPE === 'cloudinary') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary credentials missing! Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    console.warn('⚠️ Falling back to local storage');
    STORAGE_TYPE = 'local';
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    console.log('☁️ Cloudinary configured successfully');
  }
} else {
  console.log('💾 Using local file storage');
}

// Local storage directory
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../src/customer-app/public/images/poederlak');

// Ensure local upload directory exists
if (STORAGE_TYPE === 'local') {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
    console.log(`📁 Local upload directory created: ${LOCAL_UPLOAD_DIR}`);
  }
}

export interface UploadResult {
  imageUrl: string;
  filename: string;
  size: number;
}

/**
 * Upload image to storage (local or cloud)
 */
export async function uploadImage(filePath: string, originalFilename: string): Promise<UploadResult> {
  if (STORAGE_TYPE === 'cloudinary') {
    return await uploadToCloudinary(filePath, originalFilename);
  } else {
    return await uploadToLocal(filePath, originalFilename);
  }
}

/**
 * Upload to Cloudinary
 */
async function uploadToCloudinary(filePath: string, originalFilename: string): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `catalog-${timestamp}-${sanitizedFilename}`;
    const publicId = `kempa-catalog/${filename.replace(/\.[^/.]+$/, '')}`; // Remove extension for public_id

    console.log(`☁️ Uploading to Cloudinary: ${publicId}`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'kempa-catalog',
      public_id: publicId,
      resource_type: 'image',
      overwrite: false,
    });

    // Get file size
    const stats = fs.statSync(filePath);
    
    // Clean up local file after upload
    fs.unlinkSync(filePath);

    console.log(`✅ Cloudinary upload successful: ${result.secure_url}`);

    return {
      imageUrl: result.secure_url,
      filename: result.public_id,
      size: stats.size,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload to local filesystem
 */
async function uploadToLocal(filePath: string, originalFilename: string): Promise<UploadResult> {
  const timestamp = Date.now();
  const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `catalog-${timestamp}-${sanitizedFilename}`;
  const destinationPath = path.join(LOCAL_UPLOAD_DIR, filename);

  // File is already saved by multer, just get stats
  const stats = fs.statSync(filePath);

  // If file is not in the right location, move it
  if (filePath !== destinationPath) {
    fs.renameSync(filePath, destinationPath);
  }

  const imageUrl = `/images/poederlak/${filename}`;

  console.log(`💾 Local upload successful: ${filename}`);
  console.log(`   Path: ${destinationPath}`);
  console.log(`   URL: ${imageUrl}`);

  return {
    imageUrl,
    filename,
    size: stats.size,
  };
}

/**
 * Delete image from storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (STORAGE_TYPE === 'cloudinary') {
    await deleteFromCloudinary(imageUrl);
  } else {
    await deleteFromLocal(imageUrl);
  }
}

/**
 * Delete from Cloudinary
 */
async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `kempa-catalog/${filename.replace(/\.[^/.]+$/, '')}`;

    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    // Don't throw - deletion is not critical
  }
}

/**
 * Delete from local filesystem
 */
async function deleteFromLocal(imageUrl: string): Promise<void> {
  try {
    const filename = imageUrl.split('/').pop();
    if (filename) {
      const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted local file: ${filename}`);
      }
    }
  } catch (error) {
    console.error('❌ Local delete error:', error);
    // Don't throw - deletion is not critical
  }
}

/**
 * Get storage type
 */
export function getStorageType(): string {
  return STORAGE_TYPE;
}
