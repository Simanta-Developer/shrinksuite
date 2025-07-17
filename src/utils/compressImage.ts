import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to be as close as possible to the target size using binary search over quality.
 * 
 * @param file - The input image file
 * @param targetSizeBytes - Desired maximum file size in bytes
 * @returns A new File object (compressed), or original file if compression not possible
 */
export async function compressImage(file: File, targetSizeBytes: number): Promise<File> {

  const maxIterations = 8;
  const tolerance = 5 * 1024; // 5 KB buffer
  let low = 0.3;
  let high = 1.0;
  let iteration = 0;

  let bestFile: File | null = null;
  let bestSize = 0;
  let bestQuality = 0;
  let bestDiff = Infinity;

  while (iteration < maxIterations && high - low > 0.01) {
    const midQuality = (low + high) / 2;

    const options = {
      maxSizeMB: targetSizeBytes / 1024 / 1024, // still needed for fallback
      initialQuality: midQuality,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };

    try {
      const compressed = await imageCompression(file, options);
      const size = compressed.size;
      const diff = Math.abs(targetSizeBytes - size);

      console.log(
        `Attempt ${iteration + 1}: quality=${midQuality.toFixed(2)}, size=${(size / 1024).toFixed(2)} KB`
      );

      if (size <= targetSizeBytes + tolerance && diff < bestDiff) {
        bestFile = compressed;
        bestSize = size;
        bestQuality = midQuality;
        bestDiff = diff;
      }

      if (size > targetSizeBytes) {
        high = midQuality;
      } else {
        low = midQuality;
      }

    } catch (err) {
      console.error('❌ Compression error:', err);
      break;
    }

    iteration++;
  }

  console.log(`Original size: ${(file.size / 1024).toFixed(2)} KB`);
  if (bestFile) {
    console.log(`✅ Final size: ${(bestSize / 1024).toFixed(2)} KB at quality=${bestQuality.toFixed(2)}`);
    return bestFile;
  } else {
    console.log(`❌ No valid compression under ${(targetSizeBytes / 1024).toFixed(2)} KB — returning original file`);
    return file;
  }
}










