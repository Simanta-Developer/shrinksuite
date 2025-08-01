import {
  Input,
  Output,
  Conversion,
  Mp4OutputFormat,
  BufferTarget,
  BlobSource,
  ALL_FORMATS,
} from 'mediabunny';

// Helper function refactored for robust resource cleanup
async function tryMediabunnyCompression(
  input: Input,
  bitrateBps: number,
  scale = false
): Promise<{ data: ArrayBuffer; size: number }> {
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  // Define conversion here so it's accessible in the finally block
  let conversion;

  try {
    conversion = await Conversion.init({
      input,
      output,
      video: {
        bitrate: bitrateBps,
        ...(scale ? { width: 640 } : {}),
      },
      audio: {
        bitrate: 128_000, // 128 kbps
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


export async function compressVideo(
  file: File,
  targetSizeBytes: number
): Promise<File | void> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });

  const durationInSec = await input.computeDuration();
  console.log(`🎥 Video duration: ${durationInSec.toFixed(2)} seconds`);

  if (durationInSec <= 0) {
    console.warn('⚠️ Could not determine video duration.');
    return;
  }

  const maxBitrateBps = Math.floor((targetSizeBytes * 8) / durationInSec);
  let best: ArrayBuffer | null = null;
  let bestBitrate = 0;

  for (const scale of [false, true]) {
    let lo = 10_000;
    let hi = maxBitrateBps;
    let currentBestForScale: ArrayBuffer | null = null;
    let currentBestBitrateForScale = 0;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (mid === 0) break;

      try {
        const { data, size } = await tryMediabunnyCompression(input, mid, scale);
        const sizeKB = size / 1024;
        console.log(`🎯 Bitrate ${Math.round(mid / 1000)} kbps${scale ? ' + scale' : ''} => ${sizeKB.toFixed(2)} KB`);

        if (size <= targetSizeBytes) {
          currentBestForScale = data;
          currentBestBitrateForScale = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      } catch {
        hi = mid - 1;
      }
    }
    
    if (currentBestForScale && currentBestBitrateForScale > bestBitrate) {
        best = currentBestForScale;
        bestBitrate = currentBestBitrateForScale;
    }
  }

  if (best) {
    return new File([best], `compressed_${file.name}`, { type: 'video/mp4' });
  }

  console.warn('⚠️ Could not compress below target size');
  return;
}
