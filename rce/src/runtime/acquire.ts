import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import toml from "toml";
import { Runtime } from "./runtime";

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
                configObject.extension,
                configObject.compiled,
                configObject.build_command,
                configObject.run_command,
                configObject.aliases
            );
            runtimes.push(runtime);
        }
    }

    return runtimes;
}
