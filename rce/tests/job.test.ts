import test from "ava";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { Job } from "../src/job/job.js";
import { Runtime } from "../src/runtime/runtime.js";
import { Files } from "../src/job/files.js";

test("should throw error on invalid job parameters", (t) => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {}, true, 512 * 1024 * 1024, 256, 1);

  t.throws(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore testing purposes
    () => new Job({ uid: 1, gid: 1, free: false, username: "code_executor_1" }, runtime, undefined),
    {
      instanceOf: TypeError,
      message: "Invalid job parameters"
    }
  );
});

test("should give a default value for timeouts and memoryLimit", (t) => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {}, true, 512 * 1024 * 1024, 256, 1);
  const job = new Job(
    { uid: 1, gid: 1, free: false, username: "code_executor_1" },
    runtime,
    new Files([{fileName: "index.js", code: "console.log(\"Hello world~\");", entrypoint: true }], "js")
  );

  t.assert(job.compileTimeout === 10_000, `Default value for compileTimeout must be 5_000, instead got ${job.compileTimeout}`);

  t.assert(job.runTimeout === 10_000, `Default value for runTimeout must be 10_000, instead got ${job.runTimeout}`);

  t.assert(job.memoryLimit === 512 * 1024 * 1024, `Default value for memoryLimit must be 512MB, instead got ${job.memoryLimit}`);
});

test("should not use default value for timeouts and memoryLimit", (t) => {
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {}, true, 512 * 1024 * 1024, 256, 1);
  const job = new Job(
    { uid: 1, gid: 1, free: false, username: "code_executor_1" },
    runtime,
    new Files([{fileName: "index.js", code: "console.log(\"Hello world~\");", entrypoint: true }], "js"),
    10_000,
    25_000,
    256 * 1024 * 1024
  );

  t.assert(job.compileTimeout === 10_000, `Value for compileTimeout must be 10_000, instead got ${job.compileTimeout}`);

  t.assert(job.runTimeout === 25_000, `Value for runTimeout must be 25_000, instead got ${job.runTimeout}`);

  t.assert(job.memoryLimit === 256 * 1024 * 1024, `Value for memoryLimit must be 256MB, instead got ${job.memoryLimit}`);
});

test.serial("should be able to create a file", async (t) => {
  if (process.env?.LANGUAGE_JAVASCRIPT !== "true") {
    t.pass("Skipping test because LANGUAGE_JAVASCRIPT was not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {}, true, 512 * 1024 * 1024, 256, 1);
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files([{ fileName: "code.js", code: "console.log(\"Hello world~\");", entrypoint: true }], runtime.extension)
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
  if (process.env?.LANGUAGE_JAVASCRIPT !== "true") {
    t.pass("Skipping test because LANGUAGE_JAVASCRIPT was not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {}, true, 512 * 1024 * 1024, 256, 1);
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files([{fileName: "code.js", code: "console.log(\"Hello world~\");", entrypoint: true }], runtime.extension),
    10_000,
    10_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const result = await job.run();

  t.assert(result.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${result.exitCode} and message ${result.output}`);

  t.assert(result.output.trim() === "Hello world~", `File output must be "Hello world~", instead of "${result.output}"`);

  t.assert(result.stderr.trim() === "", "File stderr assert must be empty");

  t.assert(result.stdout.trim() === "Hello world~", `File stdout must be "Hello world~", instead of "${result.stdout}"`);
});

test.serial("should be able to compile and run a file - C", async (t) => {
  if (process.env?.LANGUAGE_C !== "true") {
    t.pass("Skipping test because LANGUAGE_C is not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime(
    "C",
    "10.2.1",
    "c",
    true,
    ["gcc", "-Wall", "-Wextra", "-Werror", "-O2", "-std=c99", "-pedantic", "-o", "code", "{file}"],
    ["./code"],
    ["c"],
    {},
    true,
    256 * 1024 * 1024,
    256,
    1
  );
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files([
      {
        fileName: "main.c",
        code: `#include <stdio.h>

        int main() {
            printf("Hello World~");
            return 0;
        }`,
        entrypoint: true
      }
    ], runtime.extension),
    10_000,
    10_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const compileResult = await job.compile();

  t.assert(compileResult.exitCode === 0, `Compile result didn't exit with 0, instead it exited with ${compileResult.exitCode} and message ${compileResult.output}`);

  const runResult = await job.run();

  t.assert(runResult.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${runResult.exitCode} and message ${runResult.output}`);

  t.assert(runResult.output.trim() === "Hello World~", `File output must be "Hello World~", instead of "${runResult.output}"`);

  t.assert(runResult.stderr.trim() === "", `File stderr assert must be empty, instead of ${runResult.stderr}`);

  t.assert(runResult.stdout.trim() === "Hello World~", `File stdout must be "Hello World~", instead of "${runResult.stdout}"`);
});


test.serial("should be able to compile and run a file - Python", async (t) => {
  if (process.env?.LANGUAGE_PYTHON !== "true") {
    t.pass("Skipping test because LANGUAGE_PYTHON is not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime(
    "Python",
    "3.9.2",
    "py",
    false,
    [],
    ["python3", "{file}"],
    ["py"],
    {},
    true,
    256 * 1024 * 1024,
    256,
    1
  );

  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files([
      {
        fileName: "main.py",
        code: "print(\"Hello World~\")",
        entrypoint: true
      }
    ], runtime.extension),
    10_000,
    10_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const compileResult = await job.compile();

  t.assert(compileResult.exitCode === 0, `Compile result didn't exit with 0, instead it exited with ${compileResult.exitCode} and message ${compileResult.output}`);

  const runResult = await job.run();

  t.assert(runResult.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${runResult.exitCode} and message ${runResult.output}`);

  t.assert(runResult.output.trim() === "Hello World~", `File output must be "Hello World~", instead of "${runResult.output}"`);

  t.assert(runResult.stderr.trim() === "", `File stderr assert must be empty, instead of ${runResult.stderr}`);

  t.assert(runResult.stdout.trim() === "Hello World~", `File stdout must be "Hello World~", instead of "${runResult.stdout}"`);
});


test.serial("should be able to run multiple files - NodeJS", async (t) => {
  if (process.env?.LANGUAGE_JAVASCRIPT !== "true") {
    t.pass("Skipping test because LANGUAGE_JAVASCRIPT was not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime("Javascript", "16.14.0", "js", false, [], ["node", "{file}"], ["node", "js"], {}, true, 512 * 1024 * 1024, 256, 1);
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files(
      [
        {
          fileName: "main.js",
          code: `const hello = require("./hello");

          hello();`,
          entrypoint: true
        },
        {
          fileName: "hello.js",
          code: `const world = require("./world");

          module.exports = () => console.log("Hello " + world);`,
          entrypoint: false
        },
        {
          fileName: "world.js",
          code: "module.exports = \"world~\"",
          entrypoint: false
        }
      ],
      runtime.extension
    ),
    10_000,
    10_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const result = await job.run();

  t.assert(result.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${result.exitCode} and message ${result.output}`);

  t.assert(result.output.trim() === "Hello world~", `File output must be "Hello world~", instead of "${result.output}"`);

  t.assert(result.stderr.trim() === "", "File stderr assert must be empty");

  t.assert(result.stdout.trim() === "Hello world~", `File stdout must be "Hello world~", instead of "${result.stdout}"`);
});


test.serial("should be able to execute Happy Numbers - Lua", async (t) => {
  if (process.env?.LANGUAGE_LUA !== "true") {
    t.pass("Skipping test because LANGUAGE_LUA is not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime(
    "Lua",
    "5.4",
    "lua",
    false,
    [],
    ["lua", "{file}"],
    ["lua"],
    {},
    true,
    256 * 1024 * 1024,
    256,
    1
  );

  // Solution stolen from:
  // https://rosettacode.org/wiki/Happy_numbers#Lua
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files([
      {
        fileName: "happynumbers.lua",
        code: `function digits(n)
  if n > 0 then return n % 10, digits(math.floor(n/10)) end
end

function sumsq(a, ...)
  return a and a ^ 2 + sumsq(...) or 0
end

local happy = setmetatable({true, false, false, false}, {
      __index = function(self, n)
          self[n] = self[sumsq(digits(n))]
          return self[n]
      end } )

i, j = 0, 1
repeat
    i, j = happy[j] and (print(j) or i+1) or i, j + 1
until i == 8`,
        entrypoint: true
      }
    ], runtime.extension),
    15_000,
    15_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const compileResult = await job.compile();

  t.assert(compileResult.exitCode === 0, `Compile result didn't exit with 0, instead it exited with ${compileResult.exitCode} and message ${compileResult.output}`);

  const runResult = await job.run();

  t.assert(runResult.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${runResult.exitCode} and message ${runResult.output}`);

  t.assert(runResult.output.trim().split("\n").join(" ") === "1 7 10 13 19 23 28 31", `File output must be "1 7 10 13 19 23 28 31", instead of "${runResult.output}"`);

  t.assert(runResult.stderr.trim() === "", `File stderr assert must be empty, instead of ${runResult.stderr}`);

  t.assert(runResult.stdout.trim().split("\n").join(" ") === "1 7 10 13 19 23 28 31", `File stdout must be "1 7 10 13 19 23 28 31", instead of "${runResult.stdout}"`);
});



test.serial("should be able to execute Happy Numbers - Python", async (t) => {
  if (process.env?.LANGUAGE_PYTHON !== "true") {
    t.pass("Skipping test because LANGUAGE_PYTHON is not set");
    return;
  }

  const currentUser = os.userInfo();
  const runtime = new Runtime(
    "Python",
    "3.9.2",
    "py",
    false,
    [],
    ["python3", "{file}"],
    ["py"],
    {},
    true,
    256 * 1024 * 1024,
    256,
    1
  );

  // Solution stolen from:
  // https://rosettacode.org/wiki/Category:Python
  const job = new Job(
    { uid: currentUser.uid, gid: currentUser.gid, free: true, username: currentUser.username },
    runtime,
    new Files([
      {
        fileName: "happynumbers.py",
        code: `'''Happy numbers'''

from itertools import islice


# main :: IO ()
def main():
    '''Test'''
    print(
        take(8)(
            happyNumbers()
        )
    )


# happyNumbers :: Gen [Int]
def happyNumbers():
    '''Generator :: non-finite stream of happy numbers.'''
    x = 1
    while True:
        x = until(isHappy)(succ)(x)
        yield x
        x = succ(x)


# isHappy :: Int -> Bool
def isHappy(n):
    '''Happy number sequence starting at n reaches 1 ?'''
    seen = set()

    # p :: Int -> Bool
    def p(x):
        if 1 == x or x in seen:
            return True
        else:
            seen.add(x)
            return False

    # f :: Int -> Int
    def f(x):
        return sum(int(d)**2 for d in str(x))

    return 1 == until(p)(f)(n)


# GENERIC -------------------------------------------------

# succ :: Int -> Int
def succ(x):
    '''The successor of an integer.'''
    return 1 + x


# take :: Int -> [a] -> [a]
# take :: Int -> String -> String
def take(n):
    '''The prefix of xs of length n,
        or xs itself if n > length xs.'''
    return lambda xs: (
        xs[0:n]
        if isinstance(xs, list)
        else list(islice(xs, n))
    )


# until :: (a -> Bool) -> (a -> a) -> a -> a
def until(p):
    '''The result of repeatedly applying f until p holds.
        The initial seed value is x.'''
    def go(f, x):
        v = x
        while not p(v):
            v = f(v)
        return v
    return lambda f: lambda x: go(f, x)


if __name__ == '__main__':
    main()`,
        entrypoint: true
      }
    ], runtime.extension),
    15_000,
    15_000,
    512 * 1024 * 1024
  );

  await job.createFile();

  const compileResult = await job.compile();

  t.assert(compileResult.exitCode === 0, `Compile result didn't exit with 0, instead it exited with ${compileResult.exitCode} and message ${compileResult.output}`);

  const runResult = await job.run();

  t.assert(runResult.exitCode === 0, `Run result didn't exit with 0, instead it exited with ${runResult.exitCode} and message ${runResult.output}`);

  t.assert(runResult.output.trim() === "[1, 7, 10, 13, 19, 23, 28, 31]", `File output must be "[1, 7, 10, 13, 19, 23, 28, 31]", instead of "${runResult.output}"`);

  t.assert(runResult.stderr.trim() === "", `File stderr assert must be empty, instead of ${runResult.stderr}`);

  t.assert(runResult.stdout.trim() === "[1, 7, 10, 13, 19, 23, 28, 31]", `File stdout must be "[1, 7, 10, 13, 19, 23, 28, 31]", instead of "${runResult.stdout}"`);
});
