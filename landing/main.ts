import { App } from "~/app/app.ts";

const app = new App({
  port: 3000,
  publicPath: `${Deno.cwd()}/public`,
  eta: {
    cache: true,
    tags: ["{{", "}}"],
    views: `${Deno.cwd()}/views`,
  },
});

await app.run();
