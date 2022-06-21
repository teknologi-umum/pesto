import { HttpStatus, superdeno } from "../deps.ts";
import { App } from "../app/app.ts";
import { config } from "./config.ts";

Deno.test("can access homepage", async () => {
  const app = new App(config);
  await superdeno(app.server)
    .get("/")
    .expect(HttpStatus.OK)
    .expect("Content-Type", "text/html");
});
