// Copyright 2022-2023 Teknologi Umum and contributors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export type PingResponse = {
    message: string;
};

export type Runtime = {
    language: string;
    version: string;
    aliases: string[];
    compiled: boolean;
};

export type RuntimeResponse = {
    runtime: Runtime[];
};

export type ErrorResponse = {
    message: string;
}

export type CodeRequest =
    | {
        language: string;
        version: string;
        code: string;
        compileTimeout?: number;
        runTimeout?: number;
        memoryLimit?: number;
    }
    | {
        language: string;
        version: string;
        files: Array<{ name: string; code: string; entrypoint: boolean }>;
        compileTimeout?: number;
        runTimeout?: number;
        memoryLimit?: number;
    };

export type CodeOutput = {
    stdout: string;
    stderr: string;
    output: string;
    exitCode: number;
};

export type CodeResponse = {
    language: string;
    version: string;
    compile: CodeOutput;
    runtime: CodeOutput;
};
