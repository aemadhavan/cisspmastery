import { put, del } from '@vercel/blob';

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: JPEG, PNG, WebP, GIF`,
    };
  }

  return { valid: true };
}

/**
 * Upload image to Vercel Blob Storage
 * @param file - The file to upload
 * @param flashcardId - The flashcard ID (used for organizing files)
 * @param placement - 'question' or 'answer'
 * @param order - Order number for multiple images
 * @returns Object containing blob URL and key
 */
export async function uploadImageToBlob(
  file: File,
  flashcardId: string,
  placement: 'question' | 'answer',
  order: number
): Promise<{
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}> {
  // Validate the image
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `flashcard-${flashcardId}-${placement}-${order}-${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.cisspm_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      key: blob.pathname, // This is the key used for deletion
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Failed to upload image to storage');
  }
}

/**
 * Delete image from Vercel Blob Storage
 * @param fileUrl - The full URL of the blob to delete
 */
export async function deleteImageFromBlob(fileUrl: string): Promise<void> {
  if (!fileUrl) {
    throw new Error('File URL is required for deletion');
  }

  try {
    await del(fileUrl, {
      token: process.env.cisspm_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    throw new Error('Failed to delete image from storage');
  }
}

/**
 * Delete multiple images from Vercel Blob Storage
 * @param fileUrls - Array of blob URLs to delete
 */
export async function deleteMultipleImagesFromBlob(
  fileUrls: string[]
): Promise<void> {
  if (!fileUrls || fileUrls.length === 0) {
    return;
  }

  try {
    // Delete all images in parallel
    await Promise.all(
      fileUrls.map((url) => deleteImageFromBlob(url))
    );
  } catch (error) {
    console.error('Error deleting multiple images from Vercel Blob:', error);
    throw new Error('Failed to delete images from storage');
  }
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return extensions[mimeType] || 'jpg';
}

/**
 * Find orphaned images that exist in blob storage but not in database
 * @param dbFileUrls - Array of file URLs currently in the database
 * @param blobFileUrls - Array of all file URLs in blob storage
 * @returns Array of orphaned file URLs
 */
export function findOrphanedImages(
  dbFileUrls: string[],
  blobFileUrls: string[]
): string[] {
  return blobFileUrls.filter((blobUrl) => !dbFileUrls.includes(blobUrl));
}
