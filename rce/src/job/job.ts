import childProcess from "child_process";
import console from "console";
import path from "path";
import { Runtime } from "@/runtime/runtime";
import { User } from "@/user/user";
import * as Sentry from "@sentry/node";
import fs from "fs/promises";
import { Files } from "./files";

export interface JobPrerequisites {
	user: User;
	runtime: Runtime;
	files: Files;
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
	private _sourceFilePath: string[];
	private _builtFilePath: string;
	private readonly _entrypointsPath: string[];
	private _baseFilePath: string;
	public readonly compileTimeout: number;
	public readonly runTimeout: number;
	public readonly memoryLimit: number;

	constructor(
		public readonly user: User,
		public readonly runtime: Runtime,
		public readonly files: Files,
		compileTimeout?: number,
		runTimeout?: number,
		memoryLimit?: number,
	) {
		if (
			user === undefined ||
			Object.keys(user).length === 0 ||
			runtime === undefined ||
			Object.keys(runtime).length === 0 ||
			files === undefined
		) {
			throw new TypeError("Invalid job parameters");
		}

		if (
			compileTimeout !== undefined &&
			compileTimeout !== null &&
			compileTimeout >= 1
		) {
			this.compileTimeout = compileTimeout;
		} else {
			this.compileTimeout = 10_000;
		}

		if (runTimeout !== undefined && runTimeout !== null && runTimeout >= 1) {
			this.runTimeout = runTimeout;
		} else {
			this.runTimeout = 10_000;
		}

		if (memoryLimit !== undefined && memoryLimit !== null && memoryLimit >= 1) {
			this.memoryLimit = memoryLimit;
		} else {
			this.memoryLimit = this.runtime.memoryLimit;
		}

		this._sourceFilePath = [];
		this._builtFilePath = "";
		this._entrypointsPath = [];
		this._baseFilePath = "";
	}

	createFile(): Promise<void> {
		return Sentry.startSpan(
			{
				name: "createFile",
				op: "job.create_file",
			},
			async () => {
				this._baseFilePath = path.join("/code", `/${this.user.username}`);

				for await (const file of this.files.files) {
					const filePath = path.join(
						"/code",
						`/${this.user.username}`,
						file.fileName,
					);
					await fs.writeFile(filePath, file.code, { encoding: "utf-8" });
					await fs.chmod(filePath, 0o700);
					await fs.chown(filePath, this.user.uid, this.user.gid);

					// Make sure the file is written properly.
					const stat = await fs.stat(filePath);
					console.log(`File path: ${filePath}`);
					console.log(
						`File stat: UID: ${stat.uid}, GID: ${stat.gid}, Mode: ${stat.mode}, Size: ${stat.size}`,
					);

					if (file.entrypoint === true) {
						this._entrypointsPath.push(file.fileName);
					}

					this._sourceFilePath.push(filePath);
				}
			},
		);
	}

	compile(): Promise<CommandOutput> {
		return Sentry.startSpan(
			{
				name: "compile",
				op: "job.compile",
				attributes: {
					is_compiled: this.runtime.compiled,
				},
			},
			async () => {
				if (!this.runtime.compiled) {
					return {
						stdout: "",
						stderr: "",
						output: "",
						exitCode: 0,
						signal: "",
					};
				}

				try {
					const buildCommand: string[] = [
						"/usr/bin/nice",
						"/usr/bin/prlimit",
						"--nproc=" + this.runtime.processLimit.toString(),
						"--nofile=2048",
						"--fsize=10000000", // 10MB
						"--rttime=" + this.compileTimeout.toString(),
						"--as=" + this.memoryLimit.toString(),
						"/usr/local/bin/nosocket",
						...this.runtime.buildCommand.map((arg) =>
							arg.replace("{file}", this._entrypointsPath.join(" ")),
						),
					];

					const buildCommandOutput = await this.executeCommand(buildCommand);

					if (buildCommandOutput.exitCode !== 0) {
						await this.cleanup();
					}

					this._builtFilePath = path.join(this._baseFilePath, "code");

					return buildCommandOutput;
				} catch (error) {
					await this.cleanup();
					throw error;
				}
			},
		);
	}

	run(): Promise<CommandOutput> {
		return Sentry.startSpan(
			{
				name: "run",
				op: "job.run",
				attributes: {
					is_compiled: this.runtime.compiled,
				},
			},
			async () => {
				try {
					const finalFileName: string[] = [];
					for (const file of this._entrypointsPath) {
						let baseName: string = path.basename(file);
						if (this.runtime.compiled) {
							baseName = this._builtFilePath.replace(
								`.${this.runtime.extension}`,
								"",
							);
						}

						finalFileName.push(baseName);
					}

					const runCommand: string[] = [
						"/usr/bin/nice",
						"/usr/bin/prlimit",
						"--nproc=" + this.runtime.processLimit.toString(),
						"--nofile=2048",
						"--fsize=30000000", // 30MB
						"--rttime=" + this.runTimeout.toString(),
					];

					if (this.runtime.shouldLimitMemory) {
						runCommand.push("--as=" + this.memoryLimit.toString());
					}

					runCommand.push(
						"/usr/local/bin/nosocket",
						...this.runtime.runCommand.map((arg) =>
							arg.replace("{file}", finalFileName.join(" ")),
						),
					);

					const result = await this.executeCommand(runCommand);
					return result;
				} finally {
					await this.cleanup();
				}
			},
		);
	}

	private cleanup(): Promise<void> {
		return Sentry.startSpan(
			{
				name: "cleanup",
				op: "job.cleanup",
			},
			async () => {
				// Crawl the directory and delete all files.
				const files = await fs.readdir(this._baseFilePath, {
					withFileTypes: false,
				});

				const promises = files.map((file) => {
					return fs.rm(path.join(this._baseFilePath, file), {
						force: true,
						recursive: true,
						maxRetries: 3,
						retryDelay: 100,
					});
				});

				await Promise.allSettled(promises);
				console.log(`Cleaned files: ${files.join(", ")}`);
			},
		);
	}

	private executeCommand(command: string[]): Promise<CommandOutput> {
		return Sentry.startSpan(
			{
				name: "executeCommand",
				op: "job.execute_command",
				attributes: {
					command,
				},
			},
			() => {
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
							PATH: process.env?.PATH ?? "",
							LOGGER_TOKEN: "",
							LOGGER_SERVER_ADDRESS: "",
							ENVIRONMENT: "",
							...this.runtime.environment,
						},
						cwd: "/code/" + username,
						gid: gid,
						uid: uid,
						timeout: timeout ?? 5_000,
						stdio: "pipe",
						detached: true,
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
							signal: exitSignal,
						});
					});
				});
			},
		);
	}
}
