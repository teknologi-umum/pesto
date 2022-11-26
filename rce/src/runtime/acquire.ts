import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import toml from "toml";
import { Runtime } from "./runtime";

type Version = {
	index: number,
	version: string,
}

type LanguageVersion = {
  language: string,
  versions: Version[],
}

type Semver = {
  major: number,
  minor: number,
  patch: number,
  edition: "latest" | "rc" | "beta" | "alpha" | "nightly"
}

/**
 * The way we'd check the semver is by checking the length of the array
 * in each versionTag above.
 *
 * If the length of the array is 1, we can put it on the "major" section.
 * If the length of the array is 2, it's "major" and "minor".
 * If the length of the array is 3, it's "major", "minor" and "patch".
 * If the length of the array is 4, we should examine the 3rd index and check if it's compatible with our edition.
 * We'll ignore every value that comes after the 3rd index.
 */
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

export async function acquireRuntime() {
  const runtimes: Runtime[] = [];
  const packagesDir = await fs.readdir(
    path.resolve(fileURLToPath(import.meta.url), "../../packages"),
    { withFileTypes: true }
  );

  for await (const packageDir of packagesDir) {
    if (packageDir.isDirectory()) {
      const packageDirPath = path.resolve(
        fileURLToPath(import.meta.url),
        "../../packages",
        packageDir.name
      );
      const configFilePath = path.resolve(packageDirPath, "config.toml");
      const configFile = await fs.readFile(configFilePath, "utf8");
      const configObject = toml.parse(configFile);
      const runtime = new Runtime(
        configObject.language,
        configObject.version,
        false,
        configObject.extension,
        configObject.compiled,
        configObject.build_command,
        configObject.run_command,
        configObject.aliases,
        Object.fromEntries(configObject.environment.map((o: string) => o.split("="))),
        configObject.should_limit_memory,
        configObject.memory_limit * 1024 * 1024,
        configObject.process_limit,
        configObject.allowed_entrypoints
      );
      runtimes.push(runtime);
    }
  }

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

  return runtimes;
}
