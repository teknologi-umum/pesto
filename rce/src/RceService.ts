import { ICodeExecutionEngineService } from "@/stub/rce_pb.grpc-server";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import {
    PingResponse,
    Runtimes,
    CodeRequest,
    CodeResponse
} from "@/stub/rce_pb";
import { Runtime as RceRuntime } from "@/runtime/runtime";
import { SystemUsers } from "./user/user";
import { CommandOutput, Job } from "./job/job";
import { Logger } from "@/Logger";
import { KnownOnly } from "./magic";
import { Level } from "./stub/logger_pb";
import { randomUUID } from "crypto";
import console from "console";

export type IRceService = KnownOnly<ICodeExecutionEngineService>;

export class RceServiceImpl implements IRceService {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, no-unused-vars, no-empty-function
    // @ts-ignore
    constructor(
        private readonly _logger: Logger,
        private _registeredRuntimes: RceRuntime[],
        private _users: SystemUsers
    ) {
        if (typeof _logger === "object" && !(_logger instanceof Logger)) {
            throw new TypeError("Invalid logger instance!");
        }

        if (_registeredRuntimes.length < 1) {
            throw new TypeError("No registered runtimes!");
        }

        if (typeof _users === "object" && !(_users instanceof SystemUsers)) {
            throw new TypeError("Not a valid user instance!");
        }
    }

    public listRuntimes(_call, callback: sendUnaryData<Runtimes>) {
        callback(null, { runtime: this._registeredRuntimes });
    }

    public ping(_call, callback: sendUnaryData<PingResponse>) {
        callback(null, { message: "OK" });
    }

    public async execute(
        call: ServerUnaryCall<CodeRequest, CodeResponse>,
        callback: sendUnaryData<CodeResponse>
    ) {
        const req = call.request;
        const requestID = randomUUID();

        try {
            const runtimeIndex = this._registeredRuntimes.findIndex(
                (r) => r.language === req.language && r.version === req.version
            );
            if (runtimeIndex < 0) {
                callback(new Error("Runtime not found"), null);
                this._logger.log("Runtime not found", Level.ERROR, requestID, {
                    language: req.language,
                    version: req.version,
                    code: req.code,
                    runTimeout: String(req.runTimeout),
                    compileTimeout: String(req.compileTimeout)
                });
                return;
            }

            const runtime = this._registeredRuntimes[runtimeIndex];

            // Acquire the available user.
            const user = this._users.acquire();
            if (user === null) {
                callback(new Error("No user available"), null);
                this._logger.log("No user available", Level.ERROR, requestID, {
                    language: req.language,
                    version: req.version,
                    code: req.code,
                    runTimeout: String(req.runTimeout),
                    compileTimeout: String(req.compileTimeout)
                });
                return;
            }

            // Create a job.
            const job = new Job(
                user,
                runtime,
                req.code,
                req.compileTimeout,
                req.memoryLimit
            );

            await job.createFile();
            const compileOutput: CommandOutput = {
                stdout: "",
                stderr: "",
                output: "",
                exitCode: 0,
                signal: ""
            };

            if (runtime.compiled) {
                const output = await job.compile();

                if (output.exitCode !== 0) {
                    this._users.release(user.uid);
                    callback(null, {
                        language: runtime.language,
                        version: runtime.version,
                        compile: {
                            output: output.output,
                            stderr: output.stderr,
                            stdout: output.stdout,
                            exitCode: output.exitCode
                        },
                        runtime: {
                            output: "",
                            stdout: "",
                            stderr: "",
                            exitCode: 0
                        }
                    });

                    return;
                }

                Object.assign(compileOutput, output);
            }


            const runtimeOutput = await job.run();
            // Release the user.
            this._users.release(user.uid);

            callback(null, {
                language: runtime.language,
                version: runtime.version,
                compile: {
                    output: compileOutput.output,
                    stderr: compileOutput.stderr,
                    stdout: compileOutput.stdout,
                    exitCode: compileOutput.exitCode
                },
                runtime: {
                    output: runtimeOutput.output,
                    stdout: runtimeOutput.stdout,
                    stderr: runtimeOutput.stderr,
                    exitCode: runtimeOutput.exitCode
                }
            });
        } catch (err: unknown) {
            console.log(err);

            if (err instanceof Error) {
                callback({ details: err.message }, null);
                this._logger.log(err.message, Level.ERROR, requestID, {
                    language: req.language,
                    version: req.version,
                    code: req.code,
                    runTimeout: String(req.runTimeout),
                    compileTimeout: String(req.compileTimeout)
                });
                return;
            }

            callback({ details: "Unknown error" }, null);
            if (typeof err === "string") {
                this._logger.log(err, Level.ERROR, requestID, {
                    language: req.language,
                    version: req.version,
                    code: req.code,
                    runTimeout: String(req.runTimeout),
                    compileTimeout: String(req.compileTimeout)
                });
            }
        }
    }
}
