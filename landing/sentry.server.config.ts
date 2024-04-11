import * as Sentry from "@sentry/astro";

Sentry.init({
	dsn: process.env.SENTRY_DSN ?? "",
	integrations: [new Sentry.Integrations.Http({ tracing: true })],
	attachStacktrace: true,
	sampleRate: 1.0,
	tracesSampleRate: 0.2,
	debug: import.meta.env.DEV,
});
