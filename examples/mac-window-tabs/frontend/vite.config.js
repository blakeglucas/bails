import { defineConfig } from "vite";
import bails from "@bails/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [bails("./bindings")],
});
