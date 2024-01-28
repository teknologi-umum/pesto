import { test, expect } from "vitest";
import { Runtime } from "../src/runtime/runtime.js";

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
  type Semver = {
    major: number,
    minor: number,
    patch: number,
    edition: "latest" | "rc" | "beta" | "alpha" | "nightly"
  }

  function parseSemver(tags: string[]): Semver {
    const semver: Semver = {
      major: 0,
      minor: 0,
      patch: 0,
      edition: "latest"
    };

    for (let i = 0; i < tags.length; i++) {
      switch (i) {
        case 0: {
          const parsedNumber = Number.parseInt(tags[i]);
          if (Number.isNaN(parsedNumber)) {
            break;
          }

          semver.major = parsedNumber;
          break;
        }
        case 1: {
          const parsedNumber = Number.parseInt(tags[i]);
          if (Number.isNaN(parsedNumber)) {
            break;
          }

          semver.minor = parsedNumber;
          break;
        }
        case 2: {
          const parsedNumber = Number.parseInt(tags[i]);
          if (Number.isNaN(parsedNumber)) {
            break;
          }

          semver.patch = parsedNumber;
          break;
        }
        case 3: {
          if (tags[i].startsWith("rc")) {
            semver.edition = "rc";
          } else if (tags[i].startsWith("beta")) {
            semver.edition = "beta";
          } else if (tags[i].startsWith("alpha")) {
            semver.edition = "alpha";
          } else if (tags[i] !== "") {
            semver.edition = "nightly";
          }
        }
      }
    }

    return semver;
  }

  expect(parseSemver(["3"])).toMatchObject({ major: 3, minor: 0, patch: 0, edition: "latest" });
  expect(parseSemver(["16", "15", "8", "rc-8"])).toMatchObject({ major: 16, minor: 15, patch: 8, edition: "rc" });
  expect(parseSemver(["lorem", "ipsum", "dolor", "sit", "amet"])).toMatchObject({ major: 0, minor: 0, patch: 0, edition: "nightly" });
});

test("should be able to search for latest tag", () => {
  type LanguageVersion = {
    language: string,
    versions: Array<
      {
        index: number,
        version: string
      }
    >
  }

  type Semver = {
    major: number,
    minor: number,
    patch: number,
    edition: "latest" | "rc" | "beta" | "alpha" | "nightly"
  }

  function parseSemver(tags: string[]): Semver {
    const semver: Semver = {
      major: 0,
      minor: 0,
      patch: 0,
      edition: "latest"
    };

    for (let i = 0; i < tags.length; i++) {
      switch (i) {
        case 0: {
          const parsedNumber = Number.parseInt(tags[i]);
          if (Number.isNaN(parsedNumber)) {
            break;
          }

          semver.major = parsedNumber;
          break;
        }
        case 1: {
          const parsedNumber = Number.parseInt(tags[i]);
          if (Number.isNaN(parsedNumber)) {
            break;
          }

          semver.minor = parsedNumber;
          break;
        }
        case 2: {
          const parsedNumber = Number.parseInt(tags[i]);
          if (Number.isNaN(parsedNumber)) {
            break;
          }

          semver.patch = parsedNumber;
          break;
        }
        case 3: {
          if (tags[i].startsWith("rc")) {
            semver.edition = "rc";
          } else if (tags[i].startsWith("beta")) {
            semver.edition = "beta";
          } else if (tags[i].startsWith("alpha")) {
            semver.edition = "alpha";
          } else if (tags[i] !== "") {
            semver.edition = "nightly";
          }
        }
      }
    }

    return semver;
  }

  const runtimes: Runtime[] = [
    new Runtime("Java", "17", false, "java", true, ["javac", "build"], ["javac", "run"], ["java"], {}, false, 500, 100, 1),
    new Runtime("Java", "11", false, "java", true, ["javac", "build"], ["javac", "run"], ["java"], {}, false, 500, 100, 1),
    new Runtime("Java", "8", false, "java", true, ["javac", "build"], ["javac", "run"], ["java"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "8.0.3", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "18.1.0", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "18.1.2", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "16.2.0", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1),
    new Runtime("Nodejs", "14.6.11", false, "js", false, [], ["node", "run"], ["node"], {}, false, 500, 100, 1)
  ];

  // Attempt to set the "latest" tag to true for each language
  const languageVersions: LanguageVersion[] = [];
  for (let i = 0; i < runtimes.length; i++) {
    const languageIndex = languageVersions.findIndex(r => r.language === runtimes[i].language);
    if (languageIndex === -1) {
      languageVersions.push({ language: runtimes[i].language, versions: [{ index: i, version: runtimes[i].version }] });
      continue;
    }

    languageVersions[languageIndex].versions.push({ index: i, version: runtimes[i].version });
  }

  for (const language of languageVersions) {
    // Don't waste time sorting. If the length of language.versions is 1
    // then it must be the latest version.
    if (language.versions.length === 1) {
      runtimes[language.versions[0].index].markAsLatest();
      continue;
    }

    // Otherwise, we'll sort them as normal case.
    // Note that in Javascript, this sort function sorts the array in place.
    // Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#return_value
    language.versions.sort((a, b): number => {
      // Parse the semver
      const aVersionTag = a.version.split(/\.|-/gm, 4);
      const bVersionTag = b.version.split(/\.|-/gm, 4);

      // Normal semver consist of major.minor.patch-edition
      const aSemver: Semver = parseSemver(aVersionTag);
      const bSemver: Semver = parseSemver(bVersionTag);

      if (aSemver.major === bSemver.major) {
        if (aSemver.minor === bSemver.minor) {
          if (aSemver.patch === bSemver.patch) {
            if (aSemver.edition === bSemver.edition) {
              return 0;
            }

            // I'm too lazy to write the rest of it. We'll just avoid nightly.
            if (aSemver.edition === "nightly" || bSemver.edition === "nightly") {
              return 1;
            }

            // Otherwise, we'll just return -1
            return -1;
          } else if (aSemver.patch > bSemver.patch) {
            return -1;
          }

          return 1;
        } else if (aSemver.minor > bSemver.minor) {
          return -1;
        }

        return 1;
      } else if (aSemver.major > bSemver.major) {
        return -1;
      }

      return 1;
    });

    const latestIndex = language.versions[0].index;
    runtimes[latestIndex].markAsLatest();
  }

  expect(runtimes[0].latest).toStrictEqual(true);
  expect(runtimes[1].latest).toStrictEqual(false);
  expect(runtimes[2].latest).toStrictEqual(false);
  expect(runtimes[3].latest).toStrictEqual(false);
  expect(runtimes[4].latest).toStrictEqual(false);
  expect(runtimes[5].latest).toStrictEqual(true);
  expect(runtimes[6].latest).toStrictEqual(false);
  expect(runtimes[7].latest).toStrictEqual(false);
});
