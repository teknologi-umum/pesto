import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [solid()],
	adapter: node({ mode: "standalone" }),
});
