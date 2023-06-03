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

import fetch, { type Response } from "node-fetch";
import {
    EmptyTokenError,
    InternalServerError,
    MissingParameterError,
    MissingTokenError,
    MonthlyLimitExceededError,
    RuntimeNotFoundError,
    ServerRateLimitedError,
    TokenNotRegisteredError,
    TokenRevokedError,
    UnauthorizedError
} from "./errors";
import type { CodeRequest, CodeResponse, ErrorResponse, PingResponse, RuntimeResponse } from "./responses";

export type ClientConfig = {
    token: string;
    baseURL?: URL;
};

export class PestoClient {
    private readonly baseURL: URL;
    private readonly token: string;

    constructor(config: ClientConfig) {
        if (config.token === undefined || config.token === null || config.token === "") {
            throw new EmptyTokenError();
        }

        this.token = config.token;
        this.baseURL = config.baseURL ?? new URL("https://pesto.teknologiumum.com");
    }

    public static fromToken(token: string): PestoClient {
        return new PestoClient({ token: token });
    }

    public async ping(abortSignal?: AbortSignal): Promise<PingResponse> {
        const response = await fetch(new URL("/api/ping", this.baseURL).toString(), {
            signal: abortSignal,
            headers: {
                "X-Pesto-Token": this.token,
                Accept: "application/json"
            },
            method: "GET"
        });

        if (response.status !== 200) {
            throw await this.processError(response);
        }

        const body = (await response.json()) as PingResponse;
        return { message: body.message };
    }

    public async listRuntimes(abortSignal?: AbortSignal): Promise<RuntimeResponse> {
        const response = await fetch(new URL("/api/list-runtimes", this.baseURL).toString(), {
            signal: abortSignal,
            headers: {
                "X-Pesto-Token": this.token,
                Accept: "application/json"
            },
            method: "GET"
        });

        if (response.status !== 200) {
            throw await this.processError(response);
        }

        const body = (await response.json()) as RuntimeResponse;
        return { runtime: body.runtime };
    }

    public async execute(codeRequest: CodeRequest, abortSignal?: AbortSignal): Promise<CodeResponse> {
        const response = await fetch(new URL("/api/execute", this.baseURL).toString(), {
            signal: abortSignal,
            headers: {
                "X-Pesto-Token": this.token,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(codeRequest),
            method: "POST"
        });

        if (response.status !== 200) {
            await this.processError(response);
        }

        const body = (await response.json()) as CodeResponse;
        return {
            language: body.language,
            version: body.version,
            runtime: body.runtime,
            compile: body.compile
        };
    }

    private async processError(response: Response): Promise<void> {
        switch (response.status) {
            case 404:
                throw new Error("api path not found");
            case 500: {
                const body = (await response.json()) as ErrorResponse;
                throw new InternalServerError(body.message);
            }
            case 401: {
                const body = (await response.json()) as ErrorResponse;
                if (body.message === "Token must be supplied") throw new MissingTokenError();
                if (body.message === "Token not registered") throw new TokenNotRegisteredError();
                if (body.message === "Token has been revoked") throw new TokenRevokedError();
                throw new UnauthorizedError();
            }
            case 429: {
                const body = (await response.json()) as ErrorResponse;
                if (body?.message === "Monthly limit exceeded") throw new MonthlyLimitExceededError();
                throw new ServerRateLimitedError();
            }
            case 400: {
                const body = (await response.json()) as ErrorResponse;
                if (body?.message === "Runtime not found") throw new RuntimeNotFoundError();
                if (body?.message.startsWith("Missing parameters")) throw new MissingParameterError(body.message);
                throw new Error(
                    `${body.message} (this is probably a problem with the SDK, please submit an issue on our Github repository)`
                );
            }
        }

        const body = await response.text();
        throw new Error(
            `Received ${response.status} with body ${body} (this is probably a problem with the SDK, please submit an issue on our Github repository)`
        );
    }
}

export * from "./errors";
export * from "./responses";
