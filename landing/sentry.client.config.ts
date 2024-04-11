import * as Sentry from "@sentry/astro";

Sentry.init({
	dsn: process.env.SENTRY_DSN ?? "",
	integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
	attachStacktrace: true,
	sampleRate: 1.0,
	tracesSampleRate: 0.2,
	tracePropagationTargets: ["localhost", "https://pesto.teknologiumum.com"],
	// Capture Replay for 10% of all sessions,
	// plus for 100% of sessions with an error
	replaysSessionSampleRate: 0.02,
	replaysOnErrorSampleRate: 0.5,
	debug: import.meta.env.DEV,
});
