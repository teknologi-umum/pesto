import * as Sentry from "@sentry/astro";

Sentry.init({
	dsn: process.env.SENTRY_DSN ?? "",
	integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
	sampleRate: Number.parseFloat(process.env.SENTRY_SAMPLE_RATE ?? "1.0"),
	tracesSampleRate: Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.5"),
	tracePropagationTargets: [
		"localhost",
		process.env.SENTRY_TRACE_PROPAGATION_TARGET ?? "https://pesto.teknologiumum.com",
	],
	// Capture Replay for 10% of all sessions,
	// plus for 100% of sessions with an error
	replaysSessionSampleRate: Number.parseFloat(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? "0.02"),
	replaysOnErrorSampleRate: Number.parseFloat(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? "0.5"),
	debug: import.meta.env.DEV,
});
