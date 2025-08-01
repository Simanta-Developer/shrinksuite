import imageCompression from 'browser-image-compression';
import { MIN_QUALITY, MAX_QUALITY, FILE_TYPE, QUALITY_PRECISION } from '../constants/imageConstants';

/**
 * Compresses an image file to be as close as possible to the target size 
 * using a binary search over quality.
 *
 * @param file - The input image file
 * @param targetSizeBytes - Desired maximum file size in bytes
 * @returns A new compressed File object, or null if no suitable compression is found.
 */
export async function compressImage(file: File, targetSizeBytes: number): Promise<File | null> {
  let low = MIN_QUALITY;
  let high = MAX_QUALITY;

  let bestFile: File | null = null;
  let bestDiff = Infinity;

  while (high - low > QUALITY_PRECISION) {
    const midQuality = (low + high) / 2;

    const options = {
      maxSizeMB: targetSizeBytes / 1024 / 1024,
      initialQuality: midQuality,
      useWebWorker: true,
      fileType: FILE_TYPE,
    };

    try {
      const compressed = await imageCompression(file, options);
      const size = compressed.size;
      const diff = Math.abs(targetSizeBytes - size);

      // If the compression is valid (under target) and better than our last best attempt, store it.
      if (size <= targetSizeBytes && diff < bestDiff) {
        bestFile = compressed;
        bestDiff = diff;
      }

      if (size > targetSizeBytes) {
        high = midQuality; // Result is too big, aim for lower quality
      } else {
        low = midQuality;  // Result is good, aim for even higher quality
      }
    } catch {
      throw new Error('Something went wrong at PDF compression...');
    }
  }

  if (bestFile) {
    return bestFile;
  }

  return null;
}