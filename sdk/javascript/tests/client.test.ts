import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { PestoClient } from "../src";
import { EmptyTokenError, MissingParameterError, RuntimeNotFoundError } from "../src/errors";
import { mockHandlers } from "./mock-handlers";

const server = setupServer(...mockHandlers);

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
    const client = new PestoClient({ token: "AABBCC", baseURL: new URL("https://mock-pesto.com") });

    beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    it("should be able to ping using the sdk", async () => {
        const abortController = new AbortController();
        setTimeout(() => abortController.abort(), 1000 * 60 /* 1 minute */);
        const ping = await client.ping(abortController.signal);
        expect(ping.message).toStrictEqual("OK");
    });

    it("should be able to list runtimes using the sdk", async () => {
        const runtimes = await client.listRuntimes();
        expect(runtimes.runtime.length).toBe(3);
    });

    it("should throw missing parameters", () => {
        const customClient = new PestoClient({ token: "AABBCC", baseURL: new URL("https://missing-parameters.mock-pesto.com") });

        expect(customClient.execute({ code: "print('asdf')", language: "", version: "" }))
            .rejects
            .toThrowError(new MissingParameterError("Missing parameters"));
    });

    it("should throw runtime not found", () => {
        const customClient = new PestoClient({ token: "AABBCC", baseURL: new URL("https://runtime-not-found.mock-pesto.com") });

        expect(customClient.execute({ code: "print('asdf')", language: "Rust", version: "1.64.0" }))
            .rejects
            .toThrowError(new RuntimeNotFoundError());
    });
});
