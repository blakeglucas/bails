import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@bails/runtime": fileURLToPath(new URL("../../../internal/runtime/desktop/@bails/runtime/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.BAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
});
