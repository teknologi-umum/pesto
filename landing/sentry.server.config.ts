import * as Sentry from "@sentry/astro";

Sentry.init({
	dsn: process.env.SENTRY_DSN ?? "",
	integrations: [new Sentry.Integrations.Http({ tracing: true })],
	sampleRate: Number.parseFloat(process.env.SENTRY_SAMPLE_RATE ?? "1.0"),
	tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.5"),
	debug: import.meta.env.DEV,
});
