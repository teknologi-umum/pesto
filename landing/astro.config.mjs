import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [solid()],
  vite: {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "entries/entry.[hash].js",
          chunkFileNames: "chunks/chunk.[hash].js",
          assetFileNames: "assets/asset.[hash][extname]"
        }
      }
    }
  },
  adapter: node({ mode: "standalone" })
});