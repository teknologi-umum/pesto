import { test } from "uvu";
import * as assert from "uvu/assert";
import { Job } from "../src/job/job";
import { Runtime } from "../src/runtime/runtime";
// import { SystemUsers, User } from "../src/user/user";

test("should throw error on invalid job parameters", () => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});

  assert.throws(
    () => {
      new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, "");
    },
    "Invalid job parameters"
  );
});

test("should give a default value for runTimeout and memoryLimit", () => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});
  const job = new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, "console.log(\"Hello world~\");");

  assert.equal(job.runTimeout, 5_000);

  assert.equal(job.memoryLimit, 128 * 1024 * 1024);
});

test("should not use default value for runTimeout and memoryLimit", () => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {});
  const job = new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, "console.log(\"Hello world~\");", 10_000, 10_000, 256 * 1024 * 1024);

  assert.equal(job.runTimeout, 10_000);

  assert.equal(job.memoryLimit, 256 * 1024 * 1024);
});

test.run();
