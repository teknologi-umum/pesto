import { describe, it, expect } from "vitest";
import { PestoClient } from "../src";
import { EmptyTokenError } from "../src/errors";

describe("Client creation", () => {
    it("should be able to create a proper client", () => {
        expect(() => new PestoClient({ token: "AABBCC" })).not.toThrow();
        expect(() => PestoClient.fromToken("AABBCC")).not.toThrow();
    });

    it("should throw EmptyTokenError", () => {
        expect(() => new PestoClient({ token: "" }))
            .toThrowError( new EmptyTokenError());
    });
});
