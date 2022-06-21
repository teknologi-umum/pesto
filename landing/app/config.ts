import { eta } from "../mod.ts";

export const ASSETS_PATH = `${Deno.cwd()}/public`;

export const etaConfig: Partial<typeof eta.config> = {
  cache: true,
  tags: ["{{", "}}"],
  views: `${Deno.cwd()}/views`,
};
