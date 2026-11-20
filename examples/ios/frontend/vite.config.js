import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Use the local repo runtime sources instead of the published package
      '@bails/runtime': path.resolve(__dirname, '../../../internal/runtime/desktop/@bails/runtime/src/index.ts'),
    },
  },
  server: {
    port: Number(process.env.BAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
});
