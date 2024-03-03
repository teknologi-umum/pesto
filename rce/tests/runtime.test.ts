import { test, expect } from "vitest";
import { Runtime } from "../src/runtime/runtime.js";
import { attemptToSetLatestForRuntimes, parseSemver } from "../src/runtime/acquire.js";

test("should throw error on invalid runtime parameters", () => {
  expect(
    () => {
      new Runtime("", "", false, "", true, [], [], [], {}, false, 0, 0, -1);
    })
      .toThrowError(new TypeError("Invalid runtime parameters"));
});

test("should throw error on invalid buildCommand parameters whilist being a compiled runtime", () => {
  expect(
    () => {
      new Runtime("Maven", "1.0.0", true, ".xml", true, [], ["mvn", "war:explode"], ["mvn"], { "JAVA_HOME": "/usr/lib/jvm/java-8-openjdk-amd64", "PATH": "/usr/local/bin:/usr/bin:/bin" }, false, 0, 0, 1);
    })
      .toThrowError(new TypeError("Invalid runtime parameters: buildCommand is empty yet compiled is true"));
});

test("should throw error on invalid memoryLimit parameters", () => {
  expect(
    () => {
      new Runtime("C", "11", true, "c", true, ["gcc", "./a.out"], ["./a.out"], ["c"], { "PATH": "/usr/local/bin:/usr/bin:/bin" }, true, -1, 0, 1);
    }
  ).toThrow();
});

test("should throw error on invalid processLimit parameters", () => {
  expect(
    () => {
      new Runtime("C", "11", true, "c", true, ["gcc", "./a.out"], ["./a.out"], ["c"], { "PATH": "/usr/local/bin:/usr/bin:/bin" }, true, 256, -1, 1);
    }
  ).toThrow();
});

test("should be able to parse semver", () => {
  expect(parseSemver(["3"])).toMatchObject({ major: 3, minor: 0, patch: 0, edition: "latest" });
  expect(parseSemver(["16", "15", "8", "rc-8"])).toMatchObject({ major: 16, minor: 15, patch: 8, edition: "rc" });
  expect(parseSemver(["lorem", "ipsum", "dolor", "sit", "amet"])).toMatchObject({ major: 0, minor: 0, patch: 0, edition: "nightly" });
});

test("should be able to search for latest tag", () => {
  const rawRuntimes: Runtime[] = [
    new Runtime("Java", "17", false, "java", true, ["javac", "build"], ["javac", "run"], ["java"], {}, false, 500, 100, 1),
    new Runtime("Java", "11", false, "java", true, ["javac", "build"], ["javac", "run"], ["java"], {}, false, 500, 100, 1),
    new Runtime("Java", "8", false, "java", true, ["javac", "build"], ["javac", "run"], ["java"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "8.0.3", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "18.1.0", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "18.1.2", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "16.2.0", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "14.6.11", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1)
  ];

  const runtimes = attemptToSetLatestForRuntimes(rawRuntimes);

  expect(runtimes[0].latest).toStrictEqual(true);
  expect(runtimes[1].latest).toStrictEqual(false);
  expect(runtimes[2].latest).toStrictEqual(false);
  expect(runtimes[3].latest).toStrictEqual(false);
  expect(runtimes[4].latest).toStrictEqual(false);
  expect(runtimes[5].latest).toStrictEqual(true);
  expect(runtimes[6].latest).toStrictEqual(false);
  expect(runtimes[7].latest).toStrictEqual(false);
});
