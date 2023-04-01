import { run } from "node:test"
import fs from "node:fs"
import path from "node:path"

if (process.env.PESTO_URL == null || process.env.PESTO_URL === "") {
    throw new Error("PESTO_URL environment variable must be set first");
}

const files = fs.readdirSync(".", { withFileTypes: true })
    .filter(file => file.isFile() && file.name.endsWith("test.js"))
    .map(file => path.resolve(file.name));

run({ 
    files: files, 
    timeout: 1000 * 60 * 5 // 5 minutes
})
  .pipe(process.stdout);