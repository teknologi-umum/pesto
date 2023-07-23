import { describe, it, expect } from "vitest";
import { PestoClient } from "../src";
import { MissingParameterError, RuntimeNotFoundError, TokenNotRegisteredError } from "../src/errors";

describe("Integration test against real API", () => {
    const shouldSkip = process.env.PESTO_TOKEN === undefined || process.env?.PESTO_TOKEN === "";

    const client = PestoClient.fromToken(process.env?.PESTO_TOKEN ?? "AABBCC");

    it.skipIf(shouldSkip)("should be able to create a ping request", async () => {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 1000 * 60 /* 1 minute */);
        const pingResponse = await client.ping(abortController.signal);

        expect(pingResponse.message).toStrictEqual("OK");
    }, { timeout: 60_000 });

    it.skipIf(shouldSkip)("should be able to create a list runtimes request", async () => {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 1000 * 60 /* 1 minute */);
        const listRuntimesResponse = await client.listRuntimes(abortController.signal);

        expect(listRuntimesResponse.runtime.length).toBeGreaterThan(0);
    }, { timeout: 60_000 });

    it.skipIf(shouldSkip)("should be able to create a execute request", async () => {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 1000 * 60 /* 1 minute */);
        const executeResponse = await client.execute({
            language: "Python",
            version: "latest",
            files: [
                {
                    name: "code.py",
                    code: "print('Hello world!')",
                    entrypoint: true
                }
            ]
        }, abortController.signal);

        expect(executeResponse.language).toStrictEqual("Python");
        expect(executeResponse.runtime).toBeDefined();
        expect(executeResponse.runtime.exitCode).toStrictEqual(0);
        expect(executeResponse.runtime.output).toStrictEqual("Hello world!\n");
    }, { timeout: 60_000 });

    it.skipIf(shouldSkip)("should throw missing parameters", () => {
        expect(client.execute({ code: "print('asdf')", language: "", version: "" }))
            .rejects
            .toThrowError(new MissingParameterError("Missing parameters: String must contain at least 1 character(s)"));
    });

    it.skipIf(shouldSkip)("should throw runtime not found", () => {
        expect(client.execute({ code: "print('asdf')", language: "SomeUnknownLanguage", version: "100" }))
            .rejects
            .toThrowError(new RuntimeNotFoundError());
    });

    it.skipIf(shouldSkip)("should throw token not registered", () => {
        const notRegisteredClient = PestoClient.fromToken("invalidToken");
        expect(notRegisteredClient.execute({ code: "print('Hello')", language: "Python", version: "latest" }))
            .rejects
            .toThrow(new TokenNotRegisteredError());
    });
});
