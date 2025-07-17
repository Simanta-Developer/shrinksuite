// compressPdf.ts
import createGhostscript from '@zfanta/ghostscript-wasm';
// This import ensures Vite copies the .wasm file to `dist` and returns its URL
import wasmUrl from '@zfanta/ghostscript-wasm/dist/gs.wasm?url';

const qualityLevels = ['screen', 'ebook', 'printer', 'prepress'];

function getArgs(input: string, output: string, quality: string): string[] {
  return [
    '-sDEVICE=pdfwrite',
    `-dPDFSETTINGS=/${quality}`,
    '-dCompatibilityLevel=1.4',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    `-sOutputFile=${output}`,
    input,
  ];
}

export async function compressPdf(file: File, targetSizeBytes: number): Promise<File> {
  // Optional: Warm up the .wasm by preloading (Vite ensures it's in the dist)
  await fetch(wasmUrl);

  const gs = await createGhostscript(); // No config here

  const inputName = 'input.pdf';
  const buffer = new Uint8Array(await file.arrayBuffer());
  gs.FS.writeFile(inputName, buffer);

  let lo = 0,
    hi = qualityLevels.length - 1;
  let bestOutput: Uint8Array | null = null;
  let bestQuality = '';
  let bestSize = Infinity;

  try {
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const quality = qualityLevels[mid];
      const outputName = `output_${quality}.pdf`;

      try {
        const args = getArgs(inputName, outputName, quality);
        gs.callMain(args);

        const output = gs.FS.readFile(outputName);
        const size = output.byteLength;
        console.log(`📄 [${quality}] → ${(size / 1024).toFixed(2)} KB`);

        if (size <= targetSizeBytes) {
          bestOutput = output;
          bestQuality = quality;
          bestSize = size;
          lo = mid + 1;
        } else {
          hi = mid - 1; // Try lower quality
        }

        gs.FS.unlink(outputName);
      } catch (err) {
        console.warn(`⚠️ Compression failed at "${quality}":`, err);
        lo = mid + 1;
      }
    }
  } finally {
    try {
      gs.FS.unlink(inputName);
    } catch {
      // Ignore error if input file does not exist
    }
  }

  if (bestOutput) {
    console.log(`✅ Best match: ${bestQuality} → ${(bestSize / 1024).toFixed(2)} KB`);
    return new File([bestOutput], `compressed_${file.name}`, {
      type: 'application/pdf',
    });
  } else {
    console.warn('⚠️ No acceptable compression found. Returning original file.');
    return file;
  }
}








