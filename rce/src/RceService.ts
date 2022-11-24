import {
  PingResponse,
  Runtimes,
  CodeRequest,
  CodeResponse,
  ICodeExecutionEngineService
} from "@/stub/rce";
import { Runtime as RceRuntime } from "@/runtime/runtime";
import { SystemUsers } from "./user/user";
import { CommandOutput, Job } from "./job/job";
import { ClientError, ServerError } from "./Error";
import { Files } from "./job/files";


export class RceServiceImpl implements ICodeExecutionEngineService {
  constructor(
    private _registeredRuntimes: RceRuntime[],
    private _users: SystemUsers
  ) {
    if (_registeredRuntimes.length < 1) {
      throw new TypeError("No registered runtimes!");
    }

    if (typeof _users === "object" && !(_users instanceof SystemUsers)) {
      throw new TypeError("Not a valid user instance!");
    }
  }

  public listRuntimes(): Runtimes {
    return { runtime: this._registeredRuntimes.map(v => ({ language: v.language, version: v.version, aliases: v.aliases, compiled: v.compiled })) };
  }

  public ping(): PingResponse {
    return { message: "OK" };
  }

  public async execute(req: CodeRequest): Promise<CodeResponse> {
    let runtimeIndex: number;

    if (req.version === "latest") {
      runtimeIndex = this._registeredRuntimes.findIndex(
        (r) => r.language === req.language && r.latest === true
      );
    } else {
      runtimeIndex = this._registeredRuntimes.findIndex(
        (r) => r.language === req.language && r.version === req.version
      );
    }

    if (runtimeIndex < 0) {
      throw new ClientError("Runtime not found");
    }

    const runtime = this._registeredRuntimes[runtimeIndex];

    // Convert to Files class
    const files = new Files(req.files.map(o => ({ fileName: o.fileName, code: o.code, entrypoint: o.entrypoint })), runtime.extension);

    // Validate allowed entrypoints
    if (runtime.allowedEntrypoints !== -1 && files.files.length > 1 && files.files.filter((i) => i.entrypoint === true).length > runtime.allowedEntrypoints) {
      throw new ClientError(`Maximum allowed entrypoint exceeded of ${runtime.allowedEntrypoints} entries`);
    }

    // Acquire the available user.
    const user = this._users.acquire();
    if (user === null) {
      throw new ServerError("no user available");
    }

    // Create a job.
    const job = new Job(
      user,
      runtime,
      files,
      req.compileTimeout,
      req.runTimeout,
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
        return {
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
        };
      }

      Object.assign(compileOutput, output);
    }


    const runtimeOutput = await job.run();
    // Release the user.
    this._users.release(user.uid);

    const response: CodeResponse = {
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
    };

    return response;
  }
}
