import { compressImage } from './compressImage';
import { compressVideo } from './compressVideo';
import { compressPdf } from './compressPdf';

/**
 * Detects file type and routes to appropriate compression function.
 * Skips compression if target size >= original file size.
 * @param file - The file to compress
 * @param targetSizeBytes - Desired max size in bytes
 * @param durationInSec - (Optional) Video duration in seconds, used for bitrate fallback
 * @returns Compressed file or warning if compression fails or increases size
 */
export async function compressFileByTypes(
  file: File,
  targetSizeBytes: number
): Promise<File | void> {
  if (!targetSizeBytes || isNaN(targetSizeBytes)) {
    throw new Error('❌ Invalid targetSizeBytes — must be a number in bytes');
  }

  if (file.size <= targetSizeBytes) {
    throw new Error('ℹ️ File is already smaller than target size. Skipping compression.');
  }

  const mimeType = file.type;

  try {
    if (mimeType.startsWith('image/')) {
      const compressed = await compressImage(file, targetSizeBytes);
      if(!compressed){
        return;
      }
      return file;
    }

    if (mimeType.startsWith('video/')) {
      const compressed = await compressVideo(file, targetSizeBytes);
      if(!compressed){
        return;
      }
      return file;
    }

    if (mimeType === 'application/pdf') {
      const compressed = await compressPdf(file, targetSizeBytes);
      if(!compressed){
        return;
      }
      return file;
    }
  } catch (err) {
    console.error(`❌ Compression failed for ${mimeType}:`, err);
  }

  throw new Error(`❌ Unsupported or uncompressible file type: ${mimeType}`);
}

