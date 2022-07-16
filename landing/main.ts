/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

const port = parseInt(Deno.env.get("PORT") || "") || 8000;

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
await start(manifest, { port });
