import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { PestoClient } from "../src";
import { EmptyTokenError } from "../src/errors";
import { mockHandlers } from "./mock-handlers";

describe("Client creation", () => {
    it("should be able to create a proper client", () => {
        expect(() => new PestoClient({ token: "AABBCC" })).not.toThrow();
        expect(() => PestoClient.fromToken("AABBCC")).not.toThrow();
    });

    it("should throw EmptyTokenError", () => {
        expect(() => new PestoClient({ token: "" })).toThrowError(new EmptyTokenError());
    });
});

describe("Happy path", () => {
    const client = new PestoClient({ token: "AABBCC" });

    const server = setupServer(...mockHandlers);

    it(
        "should be able to ping using the sdk",
        async () => {
            const abortController = new AbortController();
            setTimeout(() => abortController.abort(), 1000 * 60 /* 1 minute */);
            const ping = await client.ping(abortController.signal);
            expect(ping.message).toStrictEqual("OK");
        },
        { timeout: 1000 * 60 }
    );

    it("should be able to list runtimes using the sdk", async () => {
        const runtimes = await client.listRuntimes();
        expect(runtimes.runtime.length).toBe(3);
    });

    it("should be able to execute python code", async () => {
        const codeResponse = await client.execute({
            code: "print('asdf')",
            language: "Python",
            version: "3.10.2"
        });
        expect(codeResponse.language).toBe("Python");
        expect(codeResponse.version).toBe("3.10.2");
    });

    beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());
});
