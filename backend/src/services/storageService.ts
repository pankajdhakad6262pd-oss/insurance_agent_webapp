import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export class StorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), 'uploads', 'quotes');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    if (config.cloudinary.isConfigured) {
      cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
      });
      console.log('[StorageService] Cloudinary configured successfully.');
    } else {
      console.log('[StorageService] Cloudinary not configured. Using local file storage fallback at /uploads/quotes/');
    }
  }

  /**
   * Uploads a PDF buffer to Cloudinary if configured, or saves it locally.
   * Returns a publicly accessible URL for the document.
   */
  async uploadPdfBuffer(buffer: Buffer, filename: string): Promise<string> {
    if (config.cloudinary.isConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'insurance_quotes',
            public_id: filename.replace(/\.[^/.]+$/, ''),
            format: 'pdf',
          },
          (error, result) => {
            if (error) {
              console.error('[StorageService] Cloudinary upload error:', error);
              // Fallback to local save if Cloudinary upload fails
              const localUrl = this.saveLocal(buffer, filename);
              resolve(localUrl);
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Cloudinary upload returned no result'));
            }
          }
        );

        uploadStream.end(buffer);
      });
    }

    return this.saveLocal(buffer, filename);
  }

  private saveLocal(buffer: Buffer, filename: string): string {
    const filePath = path.join(this.uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    // Serve via Express static route
    const baseUrl = `http://localhost:${config.port}`;
    return `${baseUrl}/uploads/quotes/${filename}`;
  }
}

export const storageService = new StorageService();

