import type { AppConfig } from "../app/app.ts";

export const config: AppConfig = {
  port: 4200,
  publicPath: `${Deno.cwd()}/public`,
  eta: {
    cache: true,
    tags: ["{{", "}}"],
    views: `${Deno.cwd()}/views`,
  },
};
