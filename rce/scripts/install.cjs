#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This file is executed first as defined on the Dockerfile to download,
 * install, and register available runtimes to the Docker image.
 *
 * It will crawwl the 'packages' directory next to this 'scripts' directory,
 * and will:
 *
 * 1. Read 'config.toml' file for the package/runtime configuration.
 * 2. Set 'install.sh' file to have execute mode permission.
 * 3. Execute 'install.sh' file to install the package/runtime.
 * 4. Test the package/runtime against the defined test file on 'config.toml'
 *    using the configuration on the 'config.toml' itself. Here, it validates
 *    whether it returns 'Hello world!' exactly. Only then, the package/runtime
 *    is marked by working.
 */

const fs = require("fs/promises");
const cp = require("child_process");
const path = require("path");
const console = require("console");
const toml = require("toml");

// This file should be in CommonJS as it will be called directly.

function execute(
    command,
    workingDirectory = process.cwd(),
    env = {"PATH": process.env?.PATH ?? "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"}
) {
    return new Promise((resolve, reject) => {
        const cmd = cp.spawn(
            command,
            {
                cwd: workingDirectory,
                env: {
                    ...process.env,
                    ...env,
                    PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:" + env.PATH
                },
                maxBuffer: 1024 * 500,
                stdio: undefined,
                shell: true
            }
        );

        let stdout = "";
        let stderr = "";

        cmd.stdout.on("data", (data) => {
            console.log(data.toString());
            stdout += data.toString();
        });

        cmd.stderr.on("data", (data) => {
            console.error(data.toString());
            stderr += data.toString();
        });

        cmd.on("error", (error) => {
            reject(error);
        });

        cmd.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(stderr));
                return;
            }

            resolve(stdout);
        });
    });
}

(async () => {
    const packages = await fs.readdir(path.join(__dirname, "..", "packages"), {withFileTypes: true});
    for await (const pkg of packages) {
        if (!pkg.isDirectory()) {
            continue;
        }

        console.log(`Installing ${pkg.name}.`);

        const packagePath = path.join(__dirname, "..", "packages", pkg.name);
        await execute("chmod +x install.sh", packagePath);
        await execute("./install.sh", packagePath);

        const configPath = path.join(packagePath, "config.toml");
        const configFile = await fs.readFile(configPath, "utf8");
        const config = toml.parse(configFile, {joiner: "\n", bigint: false});

        const environment = config["environment"]?.reduce((acc, curr) => {
            const [key, ...value] = curr.split("=");
            acc[key] = value.join("=");
            return acc;
        }, {}) || undefined;

        // Run the Hello World file.
        if (config.compiled) {
            const compiled = await execute(
                config["build_command"].join(" ").replace("{file}", config["test_file"]),
                packagePath,
                environment
            );
            console.log(compiled);

            // Run the test file.
            const testResult = await execute(
                config["run_command"].join(" ").replace("{file}", config["test_file"]),
                packagePath,
                environment
            );
            console.log(testResult);

            if (testResult.trim() !== "Hello world!") {
                throw new Error(`Test file failed for package ${pkg.name}. Expecting "Hello world!", got "${testResult.trim()}"`);
            }
        } else {
            const testResult = await execute(
                config["run_command"].join(" ").replace("{file}", config["test_file"]),
                packagePath,
                environment
            );
            console.log(testResult);

            if (testResult.trim() !== "Hello world!") {
                throw new Error(`Test file failed for package ${pkg.name}. Expecting "Hello world!", got "${testResult.trim()}"`);
            }
        }

        console.log(`Package ${pkg.name} installed successfully.`);
    }
})();
