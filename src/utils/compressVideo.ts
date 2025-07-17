import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: false });

async function tryCompression(crf: number, scale = false): Promise<{ data: Uint8Array; size: number }> {
  const output = 'output.mp4';
  const args = [
    '-i', 'input.mp4',
    '-vcodec', 'libx264',
    ...(scale ? ['-vf', 'scale=640:-1'] : []),
    '-crf', crf.toString(),
    '-preset', 'ultrafast',
    output
  ];

  await ffmpeg.run(...args);
  const data = ffmpeg.FS('readFile', output);
  ffmpeg.FS('unlink', output);
  return { data, size: data.length };
}

async function tryBitrateCompression(bitrateKbps: number, scale = false): Promise<{ data: Uint8Array; size: number }> {
  const output = 'output_bitrate.mp4';
  const args = [
    '-i', 'input.mp4',
    ...(scale ? ['-vf', 'scale=640:-1'] : []),
    '-b:v', `${bitrateKbps}k`,
    '-preset', 'ultrafast',
    output
  ];

  await ffmpeg.run(...args);
  const data = ffmpeg.FS('readFile', output);
  ffmpeg.FS('unlink', output);
  return { data, size: data.length };
}

export async function compressVideo(file: File, targetSizeBytes: number, durationInSec?: number): Promise<File> {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  const inputName = 'input.mp4';
  await ffmpeg.FS('writeFile', inputName, await fetchFile(file));

  for (const scale of [false, true]) {
    let lo = 23, hi = 40;
    let best: Uint8Array | null = null;
    let bestCrf = hi;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const { data, size } = await tryCompression(mid, scale);
      const sizeKB = size / 1024;
      console.log(`📦 CRF ${mid}${scale ? ' + scale' : ''}: ${sizeKB.toFixed(2)} KB`);

      if (size <= targetSizeBytes) {
        best = data;
        bestCrf = mid;
        hi = mid - 1; // 👈 Try lower CRF (better quality, bigger file)
      } else {
        lo = mid + 1;
      }
    }

    if (best) {
      console.log(`🎥 ✅ Final size: ${(best.length / 1024).toFixed(2)} KB at CRF ${bestCrf}${scale ? ' + scale' : ''}`);
      return new File([best], `compressed_${file.name}`, { type: 'video/mp4' });
    }
  }

  if (durationInSec && durationInSec > 0) {
    const maxBitrate = Math.floor((targetSizeBytes * 8) / 1024 / durationInSec); // kbps
    let lo = 10, hi = maxBitrate;
    let best: Uint8Array | null = null;
    let bestBitrate = lo;

    for (const scale of [false, true]) {
      lo = 10; hi = maxBitrate; // reset for each scaling option

      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const { data, size } = await tryBitrateCompression(mid, scale);
        const sizeKB = size / 1024;
        console.log(`🎯 Bitrate ${mid} kbps${scale ? ' + scale' : ''} => ${sizeKB.toFixed(2)} KB`);

        if (size <= targetSizeBytes) {
          best = data;
          bestBitrate = mid;
          lo = mid + 1; // try higher bitrate for better quality
        } else {
          hi = mid - 1; // too big → reduce bitrate
        }
      }

      if (best) {
        console.log(`✅ Final size via bitrate: ${(best.length / 1024).toFixed(2)} KB at ${bestBitrate} kbps${scale ? ' + scale' : ''}`);
        return new File([best], `compressed_${file.name}`, { type: 'video/mp4' });
      }
    }
  }


  console.warn('⚠️ Could not compress below target size — returning original file');
  return file;
}






