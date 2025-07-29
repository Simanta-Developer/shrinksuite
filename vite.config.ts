import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],

  assetsInclude: ['**/*.wasm'],

  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // Set process.env.NODE_ENV for React production optimizations only in production mode
  define: isProduction
    ? { 'process.env.NODE_ENV': '"production"' }
    : {},

  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    outDir: 'dist',

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
      },

      output: {
        // Only chunk public React exports, avoid internal cjs dev paths
        manualChunks: {
          react: ['react'],
          reactDomClient: ['react-dom/client'],
          wasmTools: ['@ffmpeg/ffmpeg', '@zfanta/ghostscript-wasm'],
        },

        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});







