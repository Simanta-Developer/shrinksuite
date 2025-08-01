import {
  Input,
  Output,
  Conversion,
  Mp4OutputFormat,
  BufferTarget,
  BlobSource,
  ALL_FORMATS,
} from 'mediabunny';

import { 
  AUDIO_BITRATE_BPS, 
  MIN_VIDEO_BITRATE_BPS, 
  OUTPUT_FILE_TYPE, 
  SCALED_WIDTH_PX 
} from '../constants/videoConstants';

/**
 * A helper function that attempts a single compression pass with mediabunny.
 *
 * @param {Input} input - The mediabunny Input object containing the source video.
 * @param {number} bitrateBps - The target video bitrate in bits per second for this attempt.
 * @param {boolean} scale - A flag to determine whether to scale down the video resolution.
 * @returns {Promise<{data: ArrayBuffer, size: number}>} A promise that resolves with the 
 * compressed video data and its size in bytes.
 */

async function tryMediabunnyCompression(
  input: Input,
  bitrateBps: number,
  scale: boolean
): Promise<{ data: ArrayBuffer; size: number }> {
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  let conversion: Conversion | undefined;

  try {
    conversion = await Conversion.init({
      input,
      output,
      video: {
        bitrate: bitrateBps,
        ...(scale ? { width: SCALED_WIDTH_PX } : {}),
      },
      audio: {
        bitrate: AUDIO_BITRATE_BPS,
      },
    });

    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer) {
      throw new Error('Compression failed: output buffer is null.');
    }
    return { data: buffer, size: buffer.byteLength };
  } finally {
    if (conversion) {
      await conversion.cancel();
    }
  }
}

/**
 * Compresses a video file by performing a binary search on the bitrate to find
 * the optimal value that results in a file under the target size.
 *
 * @param file The video file to compress.
 * @param targetSizeBytes The desired maximum file size in bytes.
 * @returns A new compressed File object, or null if no suitable compression is found.
 */
export async function compressVideo(
  file: File,
  targetSizeBytes: number
): Promise<File | null> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });

  const durationInSec = await input.computeDuration();

  if (durationInSec <= 0) {
    throw new Error('Could not determine video duration.');
  }

  // Calculate the theoretical maximum bitrate to hit the target size
  const maxBitrateBps = Math.floor((targetSizeBytes * 8) / durationInSec);
  let bestResult: ArrayBuffer | null = null;
  let bestBitrate = 0;

  // Run the search twice: first without scaling, then with scaling as a fallback
  for (const scale of [false, true]) {
    let low = MIN_VIDEO_BITRATE_BPS;
    let high = maxBitrateBps;
    let currentBestForScale: ArrayBuffer | null = null;
    let currentBestBitrateForScale = 0;

    while (low <= high) {
      const midBitrate = Math.floor((low + high) / 2);
      if (midBitrate === 0) break; // Avoid infinite loops with zero bitrate

      try {
        const { data, size } = await tryMediabunnyCompression(input, midBitrate, scale);

        if (size <= targetSizeBytes) {
          // This bitrate is valid. Store it and try for a higher one.
          currentBestForScale = data;
          currentBestBitrateForScale = midBitrate;
          low = midBitrate + 1;
        } else {
          high = midBitrate - 1;
        }
      } catch {
        // TODO: Handle catch block across the components(image, video, pdf) gracefully.
        // TODO: Handle and resolve browser console warning regarding garbage collection.
        high = midBitrate - 1;
      }
    }

    // After the loop, if we found a better result in this pass (e.g., scaled version), update the overall best
    if (currentBestForScale && currentBestBitrateForScale > bestBitrate) {
      bestResult = currentBestForScale;
      bestBitrate = currentBestBitrateForScale;
    }
  }

  if (bestResult) {
    return new File([bestResult], `compressed_${file.name}`, { type: OUTPUT_FILE_TYPE });
  }

  return null;
}