import console from "console";
import * as Sentry from "@sentry/node";
import { RceServiceImpl } from "@/RceService";
import { acquireRuntime } from "@/runtime/acquire";
import { SystemUsers } from "@/user/user";
import polka from "polka";
import { CodeRequest } from "./stub/rce";

const PORT = process.env?.PORT || "50051";

const registeredRuntimes = await acquireRuntime();
const users = new SystemUsers(64101 + 0, 64101 + 49, 64101);

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? "",
});

const rceServiceImpl = new RceServiceImpl(registeredRuntimes, users);

const server = polka({
  // TODO: implement correct error handler and no match handler
  onError: (err, req, res, next) => { },
  onNoMatch: (req, res, next) => { },
});

server.use(async (req, res, next) => {
  try {
    let body = "";

    for await (const chunk of req) {
      body += chunk;
    }

    switch (req.headers["content-type"]) {
      case "application/x-www-form-urlencoded": {
        const url = new URLSearchParams(body);
        req.body = Object.fromEntries(url.entries());
        break;
      }
      case "application/json":
      default:
        req.body = JSON.parse(body);
    }
    next();
  } catch (error) {
    switch (req.headers["content-type"]) {
      case "application/x-www-form-urlencoded": {
        res.writeHead(400, { "Content-Type": "application/x-www-form-urlencoded" }).end(
          new URLSearchParams({
            msg: "Invalid body content with the Content-Type header specification"
          }).toString()
        );
        break;
      }
      case "application/json":
      default:
        res.writeHead(400, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            msg: "Invalid body content with the Content-Type header specification"
          })
        );
    }
  }
})

server.get("/api/ping", (req, res) => {
  const response = rceServiceImpl.ping();

  switch (req.headers["content-type"]) {
    case "application/x-www-form-urlencoded": {
      res.writeHead(200, { "Content-Type": "application/x-www-form-urlencoded" })
        .end(new URLSearchParams(response).toString())
      break;
    }
    case "application/json":
    default:
      res.writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(response))
  }
});

server.get("/api/list-runtiems", (req, res) => {
  const response = rceServiceImpl.listRuntimes();

  switch (req.headers["content-type"]) {
    case "application/x-www-form-urlencoded": {
      res.writeHead(200, { "Content-Type": "application/x-www-form-urlencoded" })
        .end(new URLSearchParams(response).toString())
      break;
    }
    case "application/json":
    default:
      res.writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(response))
  }
});

server.post("/api/execute", async (req, res) => {
  const missingParameters: string[] = [];
  if (req.body?.language === undefined || req.body?.language === null || typeof req.body.language !== "string" || req.body.language === "") {
    missingParameters.push("language");
  }

  if (req.body?.version === undefined || req.body?.version === null || typeof req.body?.version !== "string" || req.body.version === "") {
    missingParameters.push("version");
  }

  if (req.body?.code === undefined || req.body?.code === null || typeof req.body?.code !== "string" || req.body.code === "") {
    missingParameters.push("code");
  }

  if (req.body?.compileTimeout !== undefined && req.body?.compileTimeout !== null && (typeof req.body.compileTimeout !== "number" || req.body.compileTimeout > 30_000)) {
    missingParameters.push("compileTimeout");
  }

  if (req.body?.runTimeout !== undefined && req.body?.runTimeout !== null && (typeof req.body.runTimeout !== "number" || req.body.runTimeout > 30_000)) {
    missingParameters.push("runTimeout");
  }

  if (req.body?.memoryLimit !== undefined && req.body?.memoryLimit !== null && (typeof req.body.memoryLimit !== "number" || req.body.memoryLimit > 1024 * 1024 * 512)) {
    missingParameters.push("memoryLimit");
  }

  const codeRequest: CodeRequest = {
    language: req.body.language,
    version: req.body.version,
    code: req.body.code,
    compileTimeout: req.body?.compileTimeout ?? 5_000,
    runTimeout: req.body?.runTimeout ?? 5_000,
    memoryLimit: req.body?.memoryLimit ?? 1024 * 1024 * 128
  }

  const response = await rceServiceImpl.execute(codeRequest);

  switch (req.headers["content-type"]) {
    case "application/x-www-form-urlencoded": {
      res.writeHead(200, { "Content-Type": "application/x-www-form-urlencoded" })
        .end(new URLSearchParams(response).toString())
      break;
    }
    case "application/json":
    default:
      res.writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(response))
  }
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
});

process.on("SIGINT", () => {
  console.log("Server shutting down..");
  server.server.close(err => {
    console.log(`Error closing server: ${err}`)
  })
});
