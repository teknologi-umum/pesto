import { describe, it, expect } from "vitest";
import { PestoClient } from "../src";

describe("Integration test against real API", () => {
	const shouldSkip = process.env.PESTO_TOKEN === undefined || process.env?.PESTO_TOKEN === "";

	const client = PestoClient.fromToken(process.env?.PESTO_TOKEN ?? "AABBCC");

	it.skipIf(shouldSkip)("should be able to create a ping request", async () => {
		const abortController = new AbortController();
		setTimeout(() => abortController.abort(), 1000 * 60 /* 1 minute */);
		const pingResponse = await client.ping(abortController.signal);

		expect(pingResponse.message).toStrictEqual("OK");
	});
});
