import test from "ava";
import { Job } from "../src/job/job.js";
import { Runtime } from "../src/runtime/runtime.js";
// import { SystemUsers, User } from "../src/user/user.js";

test("should throw error on invalid job parameters", (t) => {
    const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"]);

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

test("should give a default value for timeout and memoryLimit", (t) => {
    const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"]);
    const job = new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, "console.log(\"Hello world~\");");

    if (job.timeout === 5_000) {
        t.pass("Default value for timeout is 5_000");
    }

    if (job.memoryLimit === 128 * 1024 * 1024) {
        t.pass("Default value for memoryLimit is 128MB");
    }
});

test("should not use default value for timeout and memoryLimit", (t) => {
    const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"]);
    const job = new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, "console.log(\"Hello world~\");", 10_000, 256 * 1024 * 1024);

    if (job.timeout === 10_000) {
        t.pass("Default value for timeout is 10_000");
    }

    if (job.memoryLimit === 256 * 1024 * 1024) {
        t.pass("Default value for memoryLimit is 256MB");
    }
});
