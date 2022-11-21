import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { PestoClient } from "../src";
import { EmptyTokenError } from "../src/errors";

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

    const server = setupServer(
        rest.get("https://pesto.teknologiumum.com/api/ping", (req, res, ctx) => {
            return res(ctx.status(200), ctx.body(JSON.stringify({ message: "OK" })));
        }),
        rest.get("https://pesto.teknologiumum.com/api/list-runtimes", (req, res, ctx) => {
            return res(ctx.status(200), ctx.body(JSON.stringify({ message: "OK" })));
        })
    );

    beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());
});
