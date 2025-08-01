import createGhostscript from '@zfanta/ghostscript-wasm';
import {
  PDF_INPUT_FILENAME,
  PDF_OUTPUT_FILENAME_PREFIX,
  PDF_COMPATIBILITY_LEVEL,
  GHOSTSCRIPT_QUIET_FLAGS,
  PDF_DEVICE,
  PDF_QUALITY_LEVELS,
} from '../constants/pdfConstants'; 
import type { PdfQuality } from '../constants/pdfConstants';

/**
 * Get the WASM file URL/path depending on environment:
 * - In Chrome extension: absolute URL via chrome.runtime.getURL()
 * - In Vite dev server: served from '/gs.wasm' from public folder
 * Throws if environment is unrecognized.
 */
function getWasmPath(): string {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL('gs.wasm');
  }
  if (import.meta.env && import.meta.env.DEV) {
    return '/gs.wasm';
  }
  throw new Error('WASM file path not configured for this environment');
}

/**
 * Construct the Ghostscript CLI arguments array to compress a PDF.
 *
 * @param inputFileName Input filename inside WASM FS.
 * @param outputFileName Output filename inside WASM FS.
 * @param quality PDF quality setting.
 * @returns Array of arguments for Ghostscript CLI.
 */
function buildGhostscriptArgs(
  inputFileName: string,
  outputFileName: string,
  quality: PdfQuality
): string[] {
  return [
    PDF_DEVICE,
    `-dPDFSETTINGS=/${quality}`,
    `-dCompatibilityLevel=${PDF_COMPATIBILITY_LEVEL}`,
    ...GHOSTSCRIPT_QUIET_FLAGS,
    `-sOutputFile=${outputFileName}`,
    inputFileName,
  ];
}

/**
 * Compress a PDF file using Ghostscript WASM to be less than or equal to the target size.
 * Uses a binary search over predefined quality levels to find the best balance.
 *
 * @param file The original PDF File to compress.
 * @param targetSizeBytes Desired maximum output size in bytes.
 * @returns A Promise resolving to a new compressed File or original file if compression failed.
 */
export async function compressPdf(file: File, targetSizeBytes: number): Promise<File | null> {
  const wasmUrl = getWasmPath();

  // Warm-up WASM in the browser cache to prevent async race conditions during instantiation
  await fetch(wasmUrl);

  // Create Ghostscript instance with a locateFile override to ensure wasm loads from correct path
  const gs = await createGhostscript({
    locateFile: (fileName: string) => {
      if (fileName.endsWith('.wasm')) {
        return wasmUrl;
      }
      // Default behavior for non-wasm files
      return fileName;
    },
  });

  // Write the input PDF file buffer into Ghostscript's virtual filesystem
  const inputBuffer = new Uint8Array(await file.arrayBuffer());
  gs.FS.writeFile(PDF_INPUT_FILENAME, inputBuffer);

  // Binary search over quality levels to find best compression <= target size
  let low = 0;
  let high = PDF_QUALITY_LEVELS.length - 1;

  let bestCompressedData: Uint8Array | null = null;
  let bestQualityLevel: PdfQuality | null = null;
  let bestCompressedSize = Infinity;

  try {
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const quality = PDF_QUALITY_LEVELS[mid];
      const outputFileName = `${PDF_OUTPUT_FILENAME_PREFIX}${quality}.pdf`;

      try {
        const args = buildGhostscriptArgs(PDF_INPUT_FILENAME, outputFileName, quality);

        // Run Ghostscript compression
        gs.callMain(args);

        // Read the compressed output from the WASM filesystem
        const compressedData = gs.FS.readFile(outputFileName);
        const compressedSize = compressedData.byteLength;

        // Check if compressed size is within target (+ tolerance)
        if (compressedSize <= targetSizeBytes) {
          // Update best result if smaller size found
          if (compressedSize < bestCompressedSize) {
            bestCompressedData = compressedData;
            bestQualityLevel = quality;
            bestCompressedSize = compressedSize;
          }
          // Try higher quality (higher index)
          low = mid + 1;
        } else {
          // Compressed file too large, try lower quality
          high = mid - 1;
        }

        // Clean up output file from WASM FS to avoid clutter
        gs.FS.unlink(outputFileName);
      } catch { 
        throw new Error('Something went wrong at PDF compression...');
      }
    }
  } finally {
    try {
      // Always attempt to clean up input file from FS
      gs.FS.unlink(PDF_INPUT_FILENAME);
    } catch {
      // Ignore errors during cleanup
    }
  }

  if (bestCompressedData && bestQualityLevel) {
    return new File([bestCompressedData], `compressed_${file.name}`, {
      type: 'application/pdf',
    });
  }

  return null;
}








