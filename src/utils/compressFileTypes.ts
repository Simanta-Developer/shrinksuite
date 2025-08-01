import { compressImage } from './compressImage';
import { compressVideo } from './compressVideo';
import { compressPdf } from './compressPdf';

/**
 * Detects file type and routes to appropriate compression function.
 * Returns the compressed file, or null if compression is not possible at the target size.
 * @param file - The file to compress
 * @param targetSizeBytes - Desired max size in bytes
 * @returns A compressed File, null if target is too small, or throws an error.
 */
export async function compressFileByTypes(
  file: File,
  targetSizeBytes: number
): Promise<File | null> {
  if (!targetSizeBytes || isNaN(targetSizeBytes)) {
    throw new Error('❌ Invalid targetSizeBytes — must be a number in bytes');
  }

  if (file.size <= targetSizeBytes) {
    throw new Error('ℹ️ File is already smaller than target size. Skipping compression.');
  }

  const mimeType = file.type;

  try {
    if (mimeType.startsWith('image/')) {
      return await compressImage(file, targetSizeBytes);
    }

    if (mimeType.startsWith('video/')) {
      return await compressVideo(file, targetSizeBytes);
    }

    if (mimeType === 'application/pdf') {
      return await compressPdf(file, targetSizeBytes);
    }
  } catch {
    throw new Error(`Unsupported or uncompressible file type: ${mimeType}`);
  }

  throw new Error(`Unsupported or uncompressible file type: ${mimeType}`);
}

