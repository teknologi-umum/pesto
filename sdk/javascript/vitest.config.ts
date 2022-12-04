import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "c8"
        },
        testTimeout: 10_000,
        teardownTimeout: 10_000
    }
});
