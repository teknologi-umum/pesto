import path from "path";
import fs from "fs/promises";
import console from "console";
import childProcess from "child_process";
import { Runtime } from "@/runtime/runtime";
import { User } from "@/user/user";

export interface JobPrerequisites {
  user: User;
  runtime: Runtime;
  code: string;
  compileTimeout: number;
  memoryLimit: number;
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  output: string;
  exitCode: number;
  signal: string;
}

export class Job implements JobPrerequisites {
  private _sourceFilePath: string;
  private _builtFilePath: string;
  public compileTimeout: number;
  public runTimeout: number;
  public memoryLimit: number;

  constructor(
    public user: User,
    public runtime: Runtime,
    public code: string,
    compileTimeout?: number,
    runTimeout?: number,
    memoryLimit?: number
  ) {
    if (user === undefined
      || Object.keys(user).length === 0
      || runtime === undefined
      || Object.keys(runtime).length === 0
      || code === null
      || code === undefined
      || code === "") {
      throw new TypeError("Invalid job parameters");
    }

    if (compileTimeout !== undefined && compileTimeout !== null && compileTimeout >= 1) {
      this.compileTimeout = compileTimeout;
    } else {
      this.compileTimeout = 5_000;
    }

    if (runTimeout !== undefined && runTimeout !== null && runTimeout >= 1) {
      this.runTimeout = runTimeout;
    } else {
      this.runTimeout = 5_000;
    }

    if (
      memoryLimit !== undefined &&
      memoryLimit !== null &&
      memoryLimit >= 1
    ) {
      this.memoryLimit = memoryLimit;
    } else {
      this.memoryLimit = 128 * 1024 * 1024;
    }

    this._sourceFilePath = "";
    this._builtFilePath = "";
  }

  async createFile(): Promise<void> {
    const filePath = path.join("/code", `/${this.user.username}`, `/code.${this.runtime.extension}`);
    await fs.writeFile(filePath, this.code, { encoding: "utf-8" });
    await fs.chmod(filePath, 0o700);
    await fs.chown(filePath, this.user.uid, this.user.gid);

    // Make sure the file is written properly.
    const stat = await fs.stat(filePath);
    console.log(`File path: ${filePath}`);
    console.log(`File stat: UID: ${stat.uid}, GID: ${stat.gid}, Mode: ${stat.mode}, Size: ${stat.size}`);
    this._sourceFilePath = filePath;
  }

  async compile(): Promise<CommandOutput> {
    if (!this.runtime.compiled) {
      return {
        stdout: "",
        stderr: "",
        output: "",
        exitCode: 0,
        signal: ""
      };
    }

    try {
      const fileName = path.basename(this._sourceFilePath);
      const buildCommand: string[] = [
        "/usr/bin/nice",
        "prlimit",
        "--nproc=256",
        "--nofile=2048",
        "--fsize=10000000", // 10MB
        "--rttime=" + this.compileTimeout.toString(),
        "--as=" + this.memoryLimit.toString(),
        "nosocket",
        ...this.runtime.buildCommand.map(arg => arg.replace("{file}", fileName))
      ];

      const buildCommandOutput = await this.executeCommand(buildCommand);

      if (buildCommandOutput.exitCode !== 0) {
        this.cleanup();
      }

      this._builtFilePath = this._sourceFilePath.replace(`code.${this.runtime.extension}`, "code");

      return buildCommandOutput;
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  async run(): Promise<CommandOutput> {
    try {
      let finalFileName: string = path.basename(this._sourceFilePath);
      if (this.runtime.compiled) {
        finalFileName = this._builtFilePath.replace(`.${this.runtime.extension}`, "");
      }

      // HACK: skip memory limit if it's Java, because... you know.
      const memoryLimit: string = this.runtime.language === "Java" ? "" : "--as=" + this.memoryLimit.toString();

      const runCommand: string[] = [
        "/usr/bin/nice",
        "prlimit",
        "--nproc=256",
        "--nofile=2048",
        "--fsize=30000000", // 30MB
        "--rttime=" + this.runTimeout.toString()
      ];

      if (memoryLimit !== "") {
        runCommand.push(memoryLimit);
      }

      runCommand.push(
        "nosocket",
        ...this.runtime.runCommand.map((arg) =>
          arg.replace("{file}", finalFileName)
        )
      );

      const result = await this.executeCommand(runCommand);
      await this.cleanup();
      return result;
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    // Crawl the directory and delete all files.
    const pwd = "/code/" + this.user.username;

    const files = await fs.readdir(pwd, { withFileTypes: false });

    const promises = files.map((file) => {
      return fs.rm(path.join(pwd, file), { force: true, recursive: true, maxRetries: 3, retryDelay: 100 });
    });

    await Promise.allSettled(promises);
    console.log(`Cleaned files: ${files.join(", ")}`);
  }

  private executeCommand(command: string[]): Promise<CommandOutput> {
    const { gid, uid, username } = this.user;
    const timeout = this.compileTimeout;

    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      let output = "";
      let exitCode = 0;
      let exitSignal = "";

      const cmd = childProcess.spawn(command[0], command.slice(1), {
        env: {
          PATH: process.env?.PATH ?? "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
          LOGGER_TOKEN: "",
          LOGGER_SERVER_ADDRESS: "",
          ENVIRONMENT: ""
        },
        cwd: "/code/" + username,
        gid: gid,
        uid: uid,
        timeout: timeout ?? 5_000,
        stdio: "pipe",
        detached: true
      });

      cmd.stdout.on("data", (data) => {
        stdout += data.toString();
        output += data.toString();

        if (process.env.ENVIRONMENT === "development") {
          console.log(data.toString());
        }
      });

      cmd.stderr.on("data", (data) => {
        stderr += data.toString();
        output += data.toString();

        if (process.env.ENVIRONMENT === "development") {
          console.log(data.toString());
        }
      });

      cmd.on("error", (error) => {
        cmd.stdout.destroy();
        cmd.stderr.destroy();

        reject(error.message);
      });

      cmd.on("close", (code, signal) => {
        cmd.stdout.destroy();
        cmd.stderr.destroy();

        exitCode = code ?? 0;
        exitSignal = signal ?? "";

        resolve({
          stdout: stdout.slice(0, 5000),
          stderr: stderr.slice(0, 5000),
          output: output.slice(0, 5000),
          exitCode,
          signal: exitSignal
        });
      });
    });
  }
}
