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
    return { runtime: this._registeredRuntimes };
  }

  public ping(): PingResponse {
    return { message: "OK" };
  }

  public async execute(req: CodeRequest): Promise<CodeResponse> {
    const runtimeIndex = this._registeredRuntimes.findIndex(
      (r) => r.language === req.language && r.version === req.version
    );
    if (runtimeIndex < 0) {
      throw new ClientError("Runtime not found");
    }

    const runtime = this._registeredRuntimes[runtimeIndex];

    // Acquire the available user.
    const user = this._users.acquire();
    if (user === null) {
      throw new ServerError("no user available");
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
