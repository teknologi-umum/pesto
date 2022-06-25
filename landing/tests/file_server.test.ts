import { HttpStatus, superdeno } from "../deps.ts";
import { config } from "./config.ts";
import { App } from "../app/app.ts";

Deno.test("file server", async (t) => {
  await t.step(
    "can access public font using the correct Content-Type",
    async () => {
      const app = new App(config);
      await superdeno(app.server)
        .get("/fonts/ibm-plex-mono-all-400-normal.woff")
        .expect(HttpStatus.OK)
        .expect("Content-Type", "font/woff");
    },
  );

  await t.step(
    "can access public css using the correct Content-Type",
    async () => {
      const app = new App(config);
      await superdeno(app.server)
        .get("/styles/style.css")
        .expect(HttpStatus.OK)
        .expect("Content-Type", "text/css");
    },
  );

  await t.step(
    "can access meta files with the correct Content-Type",
    async () => {
      const app = new App(config);
      await superdeno(app.server)
        .get("/meta/favicon.ico")
        .expect(HttpStatus.OK)
        .expect("Content-Type", "image/x-icon");
    },
  );
});
