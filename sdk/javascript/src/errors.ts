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


/**
 * Some parameters are missing on the HTTP request or the request body is empty.
 */
export class MissingParameterError extends Error {
    constructor(public override message: string) {
        super(message);
    }
}

/**
 * Token was empty during Client creation.
 */
export class EmptyTokenError extends Error {
    constructor() {
        super("Empty token");
    }
}

/**
 * Token was not sent during the HTTP request.
 */
export class MissingTokenError extends Error {
    constructor() {
        super("missing token");
    }
}

/**
 * An error occurred on Pesto's server. Client should retry the request after a few seconds.
 *
 * If the error persist, please contact the Pesto team.
 */
export class InternalServerError extends Error {
    constructor(public override message: string) {
        super(message);
    }
}

/**
 * Given Client token was not registered on Pesto's API.
 */
export class TokenNotRegisteredError extends Error {
    constructor() {
        super("Token not registered");
    }
}

/**
 * Provided token is already revoked on Pesto's API.
 */
export class TokenRevokedError extends Error {
    constructor() {
        super("Token revoked");
    }
}

/**
 * The token exceeds the monthly quota limit defined by the Pesto's API.
 *
 * To increase your limit, please contact the Pesto team.
 */
export class MonthlyLimitExceededError extends Error {
    constructor() {
        super("Monthly limit exceeded");
    }
}

/**
 * Client got rate limited by the API for sending burst or too many concurrent requests to Pesto's API.
 *
 * To get around this, you can implement your own semaphore to handle parallel requests.
 * To learn more about semaphore, you can see this Wikipedia article:
 * https://en.wikipedia.org/wiki/Semaphore_(programming)
 */
export class ServerRateLimitedError extends Error {
    constructor() {
        super("Server rate limited");
    }
}

/**
 * Provided language-version combination does not exists on Pesto's API.
 */
export class RuntimeNotFoundError extends Error {
    constructor(language?: string, version?: string) {
        const combination: string = language !== undefined && version !== undefined ? ` of ${language} and ${version}` : "";
        super(`Provided language-version combination${combination} does not exists on Pesto's API`);
    }
}

/**
 * The files "entrypoint" parameter exceeds what was defined on the language package.
 *
 * Please refer to the documentation of each language.
 */
export class MaximumAllowedEntrypointsExceededError extends Error {
    constructor(public override message: string) {
        super(message);
    }
}
