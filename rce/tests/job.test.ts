import test from "ava";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Job } from "../src/job/job.js";
import { Runtime } from "../src/runtime/runtime.js";

test("should throw error on invalid job parameters", (t) => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});

  t.throws(
    () => {
      new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, "");
    },
    {
      instanceOf: TypeError,
      message: "Invalid job parameters"
    }
  );
});

test("should give a default value for timeouts and memoryLimit", (t) => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});
  const job = new Job(
    { uid: 1, gid: 1, free: false, username: "code_executor_1" },
    runtime,
    "console.log(\"Hello world~\");"
  );

  t.assert(job.compileTimeout === 10_000, `Default value for compileTimeout must be 5_000, instead got ${job.compileTimeout}`);

  t.assert(job.runTimeout === 10_000, `Default value for runTimeout must be 10_000, instead got ${job.runTimeout}`);

  t.assert(job.memoryLimit === 128 * 1024 * 1024, `Default value for memoryLimit must be 128MB, instead got ${job.memoryLimit}`);
});

test("should not use default value for timeouts and memoryLimit", (t) => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});
  const job = new Job(
    { uid: 1, gid: 1, free: false, username: "code_executor_1" },
    runtime,
    "console.log(\"Hello world~\");",
    10_000,
    25_000,
    256 * 1024 * 1024
  );

  t.assert(job.compileTimeout === 10_000, `Value for compileTimeout must be 10_000, instead got ${job.compileTimeout}`);

  t.assert(job.runTimeout === 25_000, `Value for runTimeout must be 25_000, instead got ${job.runTimeout}`);

  t.assert(job.memoryLimit === 256 * 1024 * 1024, `Value for memoryLimit must be 256MB, instead got ${job.memoryLimit}`);
});

test.serial("should be able to create a file", async (t) => {
  if (process.env?.CI !== "true") {
    t.pass("Skipping test in non-CI environment");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    "console.log(\"Hello world~\");"
  );

  await job.createFile();

  const filePath = path.join("/code", `/${job.user.username}`, `/code.${runtime.extension}`);
  const stat = await fs.stat(filePath);

  if (stat.isFile()) {
    t.pass("File assert created");
    await fs.rm(filePath);
  } else {
    t.fail("File assert not created");
  }
});

test.serial("should be able to run a file - NodeJS", async (t) => {
  if (process.env?.CI !== "true") {
    t.pass("Skipping test in non-CI environment");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    "console.log(\"Hello world~\");",
    10_000,
    10_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const filePath = path.join("/code", `/${job.user.username}`, `/code.${runtime.extension}`);

  const result = await job.run();

  t.assert(result.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${result.exitCode} and message ${result.output}`);

  t.assert(result.output.trim() === "Hello world~", `File output must be "Hello world~", instead of "${result.output}"`);

  t.assert(result.stderr.trim() === "", "File stderr assert must be empty");

  t.assert(result.stdout.trim() === "Hello world~", `File stdout must be "Hello world~", instead of "${result.stdout}"`);

  await fs.rm(filePath, { force: true });
});

test.serial("should be able to compile and run a file - C", async (t) => {
  if (process.env?.CI !== "true") {
    t.pass("Skipping test in non-CI environment");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime(
    "C",
    "9.3.0",
    "c",
    true,
    ["gcc", "-Wall", "-Wextra", "-Werror", "-O2", "-std=c99", "-pedantic", "-o", "code", "{file}"],
    ["./code"],
    ["c"],
    {}
  );
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    `#include <stdio.h>

        int main() {
            printf("Hello World~");
            return 0;
        }`,
    10_000,
    10_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const filePath = path.join("/code", `/${job.user.username}`, `/code.${runtime.extension}`);

  const compileResult = await job.compile();

  t.assert(compileResult.exitCode === 0, `Compile result didn't exit with 0, instead it exited with ${compileResult.exitCode} and message ${compileResult.output}`);

  const runResult = await job.run();

  t.assert(runResult.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${runResult.exitCode} and message ${runResult.output}`);

  t.assert(runResult.output.trim() === "Hello World~", `File output must be "Hello World~", instead of "${runResult.output}"`);

  t.assert(runResult.stderr.trim() === "", `File stderr assert must be empty, instead of ${runResult.stderr}`);

  t.assert(runResult.stdout.trim() === "Hello World~", `File stdout must be "Hello World~", instead of "${runResult.stdout}"`);

  await fs.rm(filePath, { force: true });
});
