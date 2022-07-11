import { HttpStatus, superdeno } from "~/deps.ts";
import { App } from "~/app/app.ts";
import { config } from "./config.ts";

Deno.test("can access notfound fallback page", async () => {
  const app = new App(config);
  await superdeno(app.server)
    .get("/asdasd")
    .expect(HttpStatus.NotFound)
    .expect("Content-Type", "text/html");
});
