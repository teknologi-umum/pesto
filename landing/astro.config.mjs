import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
	integrations: [solid()],
	vite: {
		build: {
			rollupOptions: {
				output: {
					entryFileNames: "entries/entry.[hash].js",
					chunkFileNames: "chunks/chunk.[hash].js",
					assetFileNames: "assets/asset.[hash][extname]",
				},
			},
		},
	},
});
