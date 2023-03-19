
/**
 * @generated from protobuf message rce.Runtime
 */
export type Runtime = {
  /**
   * @generated from protobuf field: string language = 1;
   */
  language: string;
  /**
   * @generated from protobuf field: string version = 2;
   */
  version: string;
  /**
   * @generated from protobuf field: repeated string aliases = 3;
   */
  aliases: string[];
  /**
   * @generated from protobuf field: bool compiled = 4;
   */
  compiled: boolean;
}

/**
 * @generated from protobuf message rce.Runtimes
 */
 export type Runtimes = {
  /**
   * @generated from protobuf field: repeated rce.Runtime runtime = 1;
   */
  runtime: Runtime[];
}

/**
 * @generated from protobuf message rce.PingResponse
 */
export type PingResponse = {
  /**
   * @generated from protobuf field: string message = 1;
   */
  message: string;
}

export type CodeRequest_File = {
  fileName: string,
  code: string,
  entrypoint: boolean
}

/**
 * @generated from protobuf message rce.CodeRequest
 */
export type CodeRequest = {
  /**
   * @generated from protobuf field: string language = 1;
   */
  language: string;
  /**
   * @generated from protobuf field: string version = 2;
   */
  version: string;

  files: CodeRequest_File[]
  /**
   * @generated from protobuf field: int32 compile_timeout = 4;
   */
  compileTimeout?: number;
  /**
   * @generated from protobuf field: int32 run_timeout = 5;
   */
  runTimeout?: number;
  /**
   * @generated from protobuf field: int32 memory_limit = 6;
   */
  memoryLimit?: number;
}

/**
 * @generated from protobuf message rce.CodeResponse.Output
 */
 export type CodeResponse_Output = {
  /**
   * @generated from protobuf field: string stdout = 1;
   */
  stdout: string;
  /**
   * @generated from protobuf field: string stderr = 2;
   */
  stderr: string;
  /**
   * @generated from protobuf field: string output = 3;
   */
  output: string;
  /**
   * @generated from protobuf field: int32 exitCode = 4;
   */
  exitCode: number;
}

/**
 * @generated from protobuf message rce.CodeResponse
 */
export type CodeResponse = {
  /**
   * @generated from protobuf field: string language = 1;
   */
  language: string;
  /**
   * @generated from protobuf field: string version = 2;
   */
  version: string;
  /**
   * @generated from protobuf field: rce.CodeResponse.Output compile = 3;
   */
  compile?: CodeResponse_Output;
  /**
   * @generated from protobuf field: rce.CodeResponse.Output runtime = 4;
   */
  runtime?: CodeResponse_Output;
}

export interface ICodeExecutionEngineService {
  /**
   * @generated from protobuf rpc: ListRuntimes(rce.EmptyRequest) returns (rce.Runtimes);
   */
  listRuntimes(): Runtimes;
  /**
   * @generated from protobuf rpc: Execute(rce.CodeRequest) returns (rce.CodeResponse);
   */
  execute(req: CodeRequest): Promise<CodeResponse>;
  /**
   * @generated from protobuf rpc: Ping(rce.EmptyRequest) returns (rce.PingResponse);
   */
  ping(): PingResponse;
}
