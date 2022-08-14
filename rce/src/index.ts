import console from "console";
import * as Sentry from "@sentry/node";
import polka from "polka";
import { RceServiceImpl } from "@/RceService";
import { acquireRuntime } from "@/runtime/acquire";
import { SystemUsers } from "@/user/user";
import { CodeRequest } from "./stub/rce";
import { ClientError, ServerError } from "./Error";

const PORT = process.env?.PORT || "50051";
(async () => {
  const registeredRuntimes = await acquireRuntime();
  const users = new SystemUsers(64101 + 0, 64101 + 49, 64101);

  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? ""
  });

  const rceServiceImpl = new RceServiceImpl(registeredRuntimes, users);

  const server = polka({
    onError: (err, req, res) => {
      Sentry.withScope((scope) => {
        scope.setExtra("method", req.method);
        scope.setExtra("endpoint", req.url);
        scope.setExtra("body", req.body);
        Sentry.captureException(err);
      });

      res.writeHead(500, { "Content-Type": "application/json" })
        .end(JSON.stringify({ error: err }));
    },
    onNoMatch: (_req, res) => {
      res.writeHead(404, { "Content-Type": "application/json" })
        .end(JSON.stringify({ message: "Not found" }));
    }
  });

  server.use(async (req, res, next) => {
    try {
      if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        next();
        return;
      }

      let body = "";

      for await (const chunk of req) {
        body += chunk;
      }

      const paramBody = {};

      switch (req.headers["content-type"]) {
        case "application/x-www-form-urlencoded":
          for (const [key, value] of new URLSearchParams(body)) {
            paramBody[key] = value;
          }

          req.body = paramBody;
          break;
        case "application/json":
        default:
          req.body = JSON.parse(body);
      }
      next();
    } catch (error) {
      switch (req.headers["accept"]) {
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
  });

  server.get("/api/ping", (req, res) => {
    const response = rceServiceImpl.ping();

    switch (req.headers["accept"]) {
      case "application/x-www-form-urlencoded": {
        res.writeHead(200, { "Content-Type": "application/x-www-form-urlencoded" })
          .end(new URLSearchParams(response).toString());
        break;
      }
      case "application/json":
      default:
        res.writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(response));
    }
  });

  server.get("/api/list-runtimes", (req, res) => {
    const response = rceServiceImpl.listRuntimes();

    switch (req.headers["accept"]) {
      case "application/x-www-form-urlencoded": {
        const searchParams = new URLSearchParams();
        for (const runtime of response.runtime) {
          const childSearchParams = new URLSearchParams();
          for (const [key, value] of Object.entries(runtime)) {
            if (typeof value === "string") {
              childSearchParams.append(key, value);
              continue;
            }

            if (typeof value === "boolean") {
              childSearchParams.append(key, value.toString());
              continue;
            }

            if (typeof value === "object" && Array.isArray(value)) {
              for (const item of value) {
                childSearchParams.append(key, item);
                continue;
              }
            }
          }

          searchParams.append("runtimes", childSearchParams.toString());
        }

        res.writeHead(200, { "Content-Type": "application/x-www-form-urlencoded" })
          .end(searchParams.toString());
        break;
      }
      case "application/json":
      default:
        res.writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(response));
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

    if (missingParameters.length > 0) {
      switch (req.headers.accept) {
        case "application/x-www-form-urlencoded": {
          res.writeHead(400, { "Content-Type": "application/x-www-form-urlencoded" }).end(
            new URLSearchParams({
              message: `Missing parameters: ${missingParameters.join(", ")}`
            }).toString()
          );
          break;
        }
        case "application/json":
        default:
          res.writeHead(400, { "Content-Type": "application/json" }).end(
            JSON.stringify({
              message: `Missing parameters: ${missingParameters.join(", ")}`
            })
          );
      }

      return;
    }

    const codeRequest: CodeRequest = {
      language: req.body.language,
      version: req.body.version,
      code: req.body.code,
      compileTimeout: req.body?.compileTimeout ?? 5_000,
      runTimeout: req.body?.runTimeout ?? 5_000,
      memoryLimit: req.body?.memoryLimit ?? 1024 * 1024 * 128
    };

    try {
      const response = await rceServiceImpl.execute(codeRequest);

      switch (req.headers["accept"]) {
        case "application/x-www-form-urlencoded": {
          const searchParams = new URLSearchParams();

          searchParams.append("language", response.language);
          searchParams.append("version", response.version);

          if (response?.compile !== undefined) {
            const childSearchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(response.compile)) {
              if (typeof value === "string") {
                childSearchParams.append(key, value);
                continue;
              }

              if (typeof value === "number") {
                childSearchParams.append(key, value.toString());
              }
            }

            searchParams.append("compile", childSearchParams.toString());
          }

          if (response?.runtime !== undefined) {
            const childSearchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(response.runtime)) {
              if (typeof value === "string") {
                childSearchParams.append(key, value);
                continue;
              }

              if (typeof value === "number") {
                childSearchParams.append(key, value.toString());
              }
            }

            searchParams.append("compile", childSearchParams.toString());
          }

          res.writeHead(200, { "Content-Type": "application/x-www-form-urlencoded" })
            .end(searchParams.toString());
          break;
        }
        case "application/json":
        default:
          res.writeHead(200, { "Content-Type": "application/json" })
            .end(JSON.stringify(response));
      }
    } catch (err: unknown) {
      if (err instanceof ClientError) {
        switch (req.headers["content-type"]) {
          case "application/x-www-form-urlencoded": {
            res.writeHead(err.code, { "Content-Type": "application/x-www-form-urlencoded" })
              .end(new URLSearchParams({ message: err.message }).toString());
            break;
          }
          case "application/json":
          default:
            res.writeHead(err.code, { "Content-Type": "application/json" })
              .end(JSON.stringify({ message: err.message }));
        }
        return;
      }

      if (err instanceof ServerError) {
        Sentry.withScope((scope) => {
          scope.setExtra("language", codeRequest.language);
          scope.setExtra("version", codeRequest.version);
          scope.setExtra("code", codeRequest.code);
          scope.setExtra("compile_timeout", codeRequest.compileTimeout);
          scope.setExtra("run_timeout", codeRequest.runTimeout);
          scope.setExtra("memory_limit", codeRequest.memoryLimit);

          Sentry.captureException(err);
        });

        switch (req.headers["accept"]) {
          case "application/x-www-form-urlencoded": {
            res.writeHead(500, { "Content-Type": "application/x-www-form-urlencoded" })
              .end(new URLSearchParams({ message: "Something's wrong on our end" }).toString());
            break;
          }
          case "application/json":
          default:
            res.writeHead(500, { "Content-Type": "application/json" })
              .end(JSON.stringify({ message: "Something's wrong on our end" }));
        }
      }

      throw err;
    }
  });

  server.get("/healthz", (_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify({ status: "ok" }));
  });

  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  process.on("SIGINT", () => {
    console.log("Server shutting down..");
    server.server.close(err => {
      console.log(`Error closing server: ${err}`);
    });
  });
})();
