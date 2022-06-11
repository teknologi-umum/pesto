/**
 * @generated from protobuf message rce.EmptyRequest
 */
export interface EmptyRequest {
}
/**
 * @generated from protobuf message rce.Runtimes
 */
export interface Runtimes {
  /**
   * @generated from protobuf field: repeated rce.Runtime runtime = 1;
   */
  runtime: Runtime[];
}
/**
 * @generated from protobuf message rce.Runtime
 */
export interface Runtime {
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
 * @generated from protobuf message rce.PingResponse
 */
export interface PingResponse {
  /**
   * @generated from protobuf field: string message = 1;
   */
  message: string;
}
/**
 * @generated from protobuf message rce.CodeRequest
 */
export interface CodeRequest {
  /**
   * @generated from protobuf field: string language = 1;
   */
  language: string;
  /**
   * @generated from protobuf field: string version = 2;
   */
  version: string;
  /**
   * @generated from protobuf field: string code = 3;
   */
  code: string;
  /**
   * @generated from protobuf field: int32 compile_timeout = 4;
   */
  compileTimeout: number;
  /**
   * @generated from protobuf field: int32 run_timeout = 5;
   */
  runTimeout: number;
  /**
   * @generated from protobuf field: int32 memory_limit = 6;
   */
  memoryLimit: number;
}
/**
 * @generated from protobuf message rce.CodeResponse
 */
export interface CodeResponse {
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
/**
 * @generated from protobuf message rce.CodeResponse.Output
 */
export interface CodeResponse_Output {
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

export interface ICodeExecutionEngineService {
  /**
   * @generated from protobuf rpc: ListRuntimes(rce.EmptyRequest) returns (rce.Runtimes);
   */
  listRuntimes(): Runtimes;
  /**
   * @generated from protobuf rpc: Execute(rce.CodeRequest) returns (rce.CodeResponse);
   */
  execute(call: CodeRequest): Promise<CodeResponse>;
  /**
   * @generated from protobuf rpc: Ping(rce.EmptyRequest) returns (rce.PingResponse);
   */
  ping(): PingResponse;
}
