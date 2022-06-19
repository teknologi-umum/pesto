import fs from "fs/promises";
import path from "path";
import toml from "@ltd/j-toml";
import { Runtime } from "./runtime";

type ConfigurationFile = {
  language: string;
  version: string;
  compiled: boolean;
  extension: string;
  build_command: string[];
  environment: string[];
  run_command: string[];
  test_file: string;
  aliases: string[];
}

export async function acquireRuntime() {
  const packagesPath = process.env?.NODE_ENV === "production" ? path.resolve(__dirname, "../packages") : path.resolve(__dirname, "../../packages");
  const runtimes: Runtime[] = [];
  const packagesDir = await fs.readdir(
    packagesPath,
    { withFileTypes: true }
  );

  for await (const packageDir of packagesDir) {
    if (packageDir.isDirectory()) {
      const packageDirPath = path.resolve(
        packagesPath,
        packageDir.name
      );
      const configFilePath = path.resolve(packageDirPath, "config.toml");
      const configFile = await fs.readFile(configFilePath, "utf8");
      const configObject = toml.parse(configFile, { joiner: "\n", bigint: false }) as ConfigurationFile;
      const runtime = new Runtime(
        configObject.language,
        configObject.version,
        configObject.extension,
        configObject.compiled,
        configObject.build_command,
        configObject.run_command,
        configObject.aliases,
        Object.fromEntries(configObject.environment.map((o: string) => o.split("=")))
      );
      runtimes.push(runtime);
    }
  }

  return runtimes;
}
