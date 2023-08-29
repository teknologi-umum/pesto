import {test} from "node:test";
import assert from "node:assert";
import { readdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve, basename, extname } from "node:path";
import console from "node:console";
import {PestoClient} from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({
    baseURL: process.env.PESTO_URL,
    token: "DOGFOOD"
});

const snapshot = new Map();
const snapshotFiles = await readdir("snapshots");
for (const fileName of snapshotFiles) {
    const content = readFileSync(resolve("snapshots", fileName), { encoding: "utf-8" });
    snapshot.set(fileName, content);
}

const snippetsFiles = await readdir("snippets", { recursive: false });
for await (const directoryName of snippetsFiles) {
    const files = await readdir(resolve("snippets", directoryName));

    if (directoryName === "Go") {
        console.log("Skipping Go tests");
        continue;
    }

    for await (const fileName of files) {
        const file = basename(fileName, extname(fileName));
        test(`${directoryName} - ${file}`, async () => {
            const content = readFileSync(resolve("snippets", directoryName, fileName), { encoding: "utf-8" });

            const codeOutput = await pestoClient.execute({
                language: directoryName,
                version: "latest",
                code: content
            });

            const expectedOutput = snapshot.get(file);

            assert.strictEqual(codeOutput.language.toLowerCase(), directoryName.toLowerCase());
            assert.strictEqual(codeOutput.compile.output, "");
            assert.strictEqual(codeOutput.compile.stderr, "");
            assert.strictEqual(codeOutput.compile.stdout, "");
            assert.strictEqual(codeOutput.compile.exitCode, 0);
            assert.strictEqual(codeOutput.runtime.output?.trim(), expectedOutput?.trim());
            assert.strictEqual(codeOutput.runtime.stdout?.trim(), expectedOutput?.trim());
            assert.strictEqual(codeOutput.runtime.stderr, "");
            assert.strictEqual(codeOutput.runtime.exitCode, 0);
        });
    }
}
