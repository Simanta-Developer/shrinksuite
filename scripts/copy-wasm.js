import { copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const source = resolve(__dirname, '../node_modules/@zfanta/ghostscript-wasm/dist/gs.wasm');
const targetDir = resolve(__dirname, '../public');
const target = resolve(targetDir, 'gs.wasm');

async function copyWasm() {
  try {
    if (!existsSync(source)) {
      console.error('❌ gs.wasm not found at:', source);
      process.exit(1);
    }

    // Ensure public directory exists
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    await copyFile(source, target);
    console.log('✅ gs.wasm successfully copied to public/');
  } catch (err) {
    console.error('⚠️ Failed to copy gs.wasm:', err);
    process.exit(1);
  }
}

copyWasm();
