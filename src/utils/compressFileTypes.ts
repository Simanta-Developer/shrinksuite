import { compressImage } from './compressImage';
import { compressVideo } from './compressVideo';
import { compressPdf } from './compressPdf';

/**
 * Returns compressed file only if smaller or equal to the original file.
 * Otherwise, returns original.
 */
function returnSmallerOrOriginal(original: File, compressed: File): File {
  if (compressed.size <= original.size) {
    return compressed;
  }
  console.warn(`⚠️ Compression increased size (${compressed.size} > ${original.size}). Returning original.`);
  return original;
}

/**
 * Detects file type and routes to appropriate compression function.
 * Skips compression if target size >= original file size.
 * @param file - The file to compress
 * @param targetSizeBytes - Desired max size in bytes
 * @param durationInSec - (Optional) Video duration in seconds, used for bitrate fallback
 * @returns Compressed file or original if compression fails or increases size
 */
export async function compressFileByTypes(
  file: File,
  targetSizeBytes: number,
  durationInSec?: number
): Promise<File> {
  if (!targetSizeBytes || isNaN(targetSizeBytes)) {
    throw new Error('❌ compressFileByTypes: Invalid targetSizeBytes — must be a number in bytes');
  }

  if (file.size <= targetSizeBytes) {
    throw new Error('ℹ️ File is already smaller than target size. Skipping compression.');
  }

  const mimeType = file.type;

  try {
    if (mimeType.startsWith('image/')) {
      const compressed = await compressImage(file, targetSizeBytes);
      return returnSmallerOrOriginal(file, compressed);
    }

    if (mimeType.startsWith('video/')) {
      const compressed = await compressVideo(file, targetSizeBytes, durationInSec);
      return returnSmallerOrOriginal(file, compressed);
    }

    if (mimeType === 'application/pdf') {
      const compressed = await compressPdf(file, targetSizeBytes);
      return returnSmallerOrOriginal(file, compressed);
    }
  } catch (err) {
    console.error(`❌ Compression failed for ${mimeType}:`, err);
  }

  throw new Error(`❌ Unsupported or uncompressible file type: ${mimeType}`);
}




