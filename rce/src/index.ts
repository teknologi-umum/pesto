import * as console from "node:console";
import { RceServiceImpl } from "@/RceService";
import { acquireRuntime } from "@/runtime/acquire";
import { SystemUsers } from "@/user/user";
import * as Sentry from "@sentry/node";
import polka from "polka";
import { z } from "zod";
import { ClientError, ServerError } from "./Error";
import { CodeRequest, CodeRequest_File } from "./stub/rce";

const PORT = process.env?.PORT || "50051";

Sentry.init({
	dsn: process.env.SENTRY_DSN ?? "",
	autoSessionTracking: true,
	environment: process.env.NODE_ENV ?? "development",
	sampleRate: Number.parseFloat(process.env.SENTRY_SAMPLE_RATE ?? "1.0"),
	tracesSampler(samplingContext): number {
		if (samplingContext.name === "GET /healthz") {
			return 0;
		}

		return Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.4");
	},
	debug: process.env.SENTRY_DEBUG === "true",
	defaultIntegrations: false,
	integrations: [
		Sentry.consoleIntegration(),
		Sentry.contextLinesIntegration(),
		Sentry.nodeContextIntegration(),
		Sentry.dedupeIntegration(),
		Sentry.functionToStringIntegration(),
		Sentry.inboundFiltersIntegration(),
		Sentry.linkedErrorsIntegration(),
		Sentry.onUncaughtExceptionIntegration(),
		Sentry.onUnhandledRejectionIntegration(),
	],
});

const rsplit = function (source: string, sep, maxsplit) {
	const split = source.split(sep);
	return maxsplit
		? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
		: split;
};

(async () => {
	const registeredRuntimes = await acquireRuntime();
	const users = new SystemUsers(64101 + 0, 64101 + 49, 64101);

	const executeSchema = z.object({
		language: z.string().min(1),
		version: z.string().default("latest"),
		code: z.string().optional(),
		files: z
			.array(
				z.object({
					name: z.string().min(1),
					code: z.string().min(1),
					entrypoint: z.boolean().default(false),
				}),
			)
			.optional(),
		compileTimeout: z.number().max(30_000).optional(),
		runTimeout: z.number().max(30_000).optional(),
		memoryLimit: z
			.number()
			.max(1024 * 1024 * 1024)
			.optional(),
	});

	const rceServiceImpl = new RceServiceImpl(registeredRuntimes, users);

	const server = polka({
		onError: (err, _req, res, _next) => {
			Sentry.captureException(err);

			res
				.writeHead(500, { "Content-Type": "application/json" })
				.end(JSON.stringify({ error: err }));
		},
		onNoMatch: (_req, res) => {
			res
				.writeHead(404, { "Content-Type": "application/json" })
				.end(JSON.stringify({ message: "Not found" }));
		},
	});

	server.use((req, res, next) => {
		return Sentry.withIsolationScope((scope) => {
			const ipAddress =
				req.headers["x-forwarded-for"]?.at(0) ?? req.socket.remoteAddress;
			scope.setUser({ ip_address: ipAddress });
			return Sentry.continueTrace(
				{
					sentryTrace: req.headers["sentry-trace"]?.at(0),
					baggage: req.headers["baggage"]?.at(0),
				},
				() => {
					const requestUrl: string[] | undefined =
						req.headers.host !== undefined
							? rsplit(req.headers.host, ":", 1)
							: undefined;
					return Sentry.startSpan(
						{
							name: `${req.method.toUpperCase()} ${req.path}`,
							op: "http.server",
							attributes: {
								"http.request.method": req.method,
								"server.address": requestUrl?.[0],
								"server.port": requestUrl?.[1],
							},
						},
						(span) => {
							next();

							span.setAttributes({
								"http.response.status_code": res.statusCode,
							});
						},
					);
				},
			);
		});
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
		} catch (_error) {
			switch (req.headers["accept"]) {
				case "application/x-www-form-urlencoded": {
					res
						.writeHead(400, {
							"Content-Type": "application/x-www-form-urlencoded",
						})
						.end(
							new URLSearchParams({
								msg: "Invalid body content with the Content-Type header specification",
							}).toString(),
						);
					break;
				}

				case "application/json":
				default:
					res.writeHead(400, { "Content-Type": "application/json" }).end(
						JSON.stringify({
							msg: "Invalid body content with the Content-Type header specification",
						}),
					);
			}
		}
	});

	server.get("/api/ping", (req, res) => {
		const response = rceServiceImpl.ping();

		switch (req.headers["accept"]) {
			case "application/x-www-form-urlencoded": {
				res
					.writeHead(200, {
						"Content-Type": "application/x-www-form-urlencoded",
					})
					.end(new URLSearchParams(response).toString());
				break;
			}
			case "application/json":
			default:
				res
					.writeHead(200, { "Content-Type": "application/json" })
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

				res
					.writeHead(200, {
						"Content-Type": "application/x-www-form-urlencoded",
					})
					.end(searchParams.toString());
				break;
			}
			case "application/json":
			default:
				res
					.writeHead(200, { "Content-Type": "application/json" })
					.end(JSON.stringify(response));
		}
	});

	server.post("/api/execute", async (req, res) => {
		const parsedBody = executeSchema.safeParse(req.body);

		if (!parsedBody.success) {
			switch (req.headers.accept) {
				case "application/x-www-form-urlencoded": {
					res
						.writeHead(400, {
							"Content-Type": "application/x-www-form-urlencoded",
						})
						.end(
							new URLSearchParams({
								message:
									"Missing parameters: " +
									parsedBody.error.errors.map((o) => o.message).join(", "),
							}).toString(),
						);
					break;
				}
				case "application/json":
				default:
					res.writeHead(400, { "Content-Type": "application/json" }).end(
						JSON.stringify({
							message:
								"Missing parameters: " +
								parsedBody.error.errors.map((o) => o.message).join(", "),
						}),
					);
			}

			return;
		}

		if (
			parsedBody.data.code === undefined &&
			parsedBody.data.files === undefined
		) {
			throw new ClientError("Both code and files must not be empty", 400);
		}

		if (
			parsedBody.data.code !== undefined &&
			parsedBody.data.code === "" &&
			parsedBody.data.files !== undefined &&
			parsedBody.data.files.length === 0
		) {
			throw new ClientError("Both code and files must not be empty", 400);
		}

		const codeRequestFiles: CodeRequest_File[] = [];
		if (parsedBody.data.files !== undefined) {
			for (const file of parsedBody.data.files) {
				if (file.name === "") {
					throw new ClientError("File name cannot be empty", 400);
				}

				codeRequestFiles.push({
					fileName: file.name,
					code: file.code,
					entrypoint: file.entrypoint,
				});
			}
		} else if (parsedBody.data.code !== undefined) {
			codeRequestFiles.push({
				fileName: "",
				code: parsedBody.data.code,
				entrypoint: true,
			});
		} else {
			throw new ServerError("Wrong validation on our side for files and code");
		}

		const codeRequest: CodeRequest = {
			language: parsedBody.data.language,
			version: parsedBody.data.version,
			files: codeRequestFiles,
			compileTimeout: parsedBody.data.compileTimeout,
			runTimeout: parsedBody.data.runTimeout,
			memoryLimit: parsedBody.data.memoryLimit,
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

					res
						.writeHead(200, {
							"Content-Type": "application/x-www-form-urlencoded",
						})
						.end(searchParams.toString());
					break;
				}
				case "application/json":
				default:
					res
						.writeHead(200, { "Content-Type": "application/json" })
						.end(JSON.stringify(response));
			}
		} catch (err: unknown) {
			if (err instanceof ClientError) {
				switch (req.headers["content-type"]) {
					case "application/x-www-form-urlencoded": {
						res
							.writeHead(err.code, {
								"Content-Type": "application/x-www-form-urlencoded",
							})
							.end(new URLSearchParams({ message: err.message }).toString());
						break;
					}
					case "application/json":
					default:
						res
							.writeHead(err.code, { "Content-Type": "application/json" })
							.end(JSON.stringify({ message: err.message }));
				}
				return;
			}

			if (err instanceof ServerError) {
				Sentry.setExtras({
					language: codeRequest.language,
					version: codeRequest.version,
					compile_timeout: codeRequest.compileTimeout,
					run_timeout: codeRequest.runTimeout,
					memory_limit: codeRequest.memoryLimit,
				});

				Sentry.captureException(err);

				switch (req.headers["accept"]) {
					case "application/x-www-form-urlencoded": {
						res
							.writeHead(500, {
								"Content-Type": "application/x-www-form-urlencoded",
							})
							.end(
								new URLSearchParams({
									message: "Something's wrong on our end",
								}).toString(),
							);
						break;
					}
					case "application/json":
					default:
						res
							.writeHead(500, { "Content-Type": "application/json" })
							.end(JSON.stringify({ message: "Something's wrong on our end" }));
				}
			}

			throw err;
		}
	});

	server.get("/healthz", (_req, res) => {
		res
			.writeHead(200, { "Content-Type": "application/json" })
			.end(JSON.stringify({ status: "ok" }));
	});

	server.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});

	process.on("SIGINT", () => {
		console.log("Server shutting down..");
		server.server.close((err) => {
			console.log(`Error closing server: ${err}`);
		});
	});
})();
