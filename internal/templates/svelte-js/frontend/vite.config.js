import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import bails from "@bails/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: Number(process.env.BAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
  plugins: [svelte(), bails("./bindings")],
});
