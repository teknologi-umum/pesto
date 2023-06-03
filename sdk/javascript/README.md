# Javascript SDK for Pesto

Client SDK for [Javascript](https://developer.mozilla.org/en-US/docs/Web/javascript)

## Installation

```shell
npm install @teknologi-umum/pesto

# If you want to use the version from the master branch
npm install @teknologi-umum/pesto@nightly
```

## Usage

```javascript
import { PestoClient } from "@teknologi-umum/pesto";

const pestoClient = new PestoClient({ token: "YOUR_TOKEN_GOES_HERE" });

// API check
const pingResponse = await pestoClient.ping();
console.log(pingResponse.message); // Should returns "OK"

// List available runtimes
const listRuntimesResponse = await pestoClient.listRuntimes();
console.log(listRUntimesResponse.runtime);

// Execute code snippet
const codeResult = await pestoClient.execute({
    language: "Python",
    version: "latest",
    code: "print('Hello world!')"
});
console.log(codeResult.runtime.output);
```

### Handy default configuration

```javascript
import { PestoClient } from "@teknologi-umum/pesto";

const pestoClient = new PestoClient.fromToken("YOUR_TOKEN_GOES_HERE");
```

### Handling errors

The SDK provides handy specific error classes which each state a specific case.
You should pick the one that is more close to your need.

```javascript
import {
    PestoClient,
    EmptyTokenError,
    MissingTokenError,
    MissingParameterError,
    UnauthorizedError,
    InternalServerError,
    TokenNotRegisteredError,
    TokenRevokedError,
    MonthlyLimitExceededError,
    ServerRateLimitedError,
    RuntimeNotFoundError
} from "@teknologi-umum/pesto";

try {
    const pestoClient = new PestoClient({ token: "YOUR_TOKEN_GOES_HERE" });

    const codeResult = await pestoClient.execute({
        language: "Python",
        version: "latest",
        code: "print('Hello world!')"
    });

    console.log(codeResult.runtime.output);
} catch (error) {
    if (error instanceof EmptyTokenError) {
        // You did not provide a token
        return;
    }

    if (error instanceof MissingTokenError) {
        // Token did not sent during the HTTP request.
        // This is probably due to the SDK's fault.
        return;
    }

    if (error instanceof MissingParameterError) {
        // You are missing a few fields that is required to be filled
        return;
    }

    if (error instanceof RuntimeNotFoundError) {
        // Provided language-version combination does not exist on Pesto's API.
        return;
    }

    if (error instanceof UnauthorizedError) {
        // Unauthorized request with unknown reason
        return;
    }

    if (error instanceof InternalServerError) {
        // An error occurred on Pesto's server.
        // Client should retry the request after a few seconds.
        // If the error persist, please contact the Pesto team.
        return;
    }

    if (error instanceof TokenNotRegisteredError) {
        // You set a token that is not registered by the Pesto's API
        return;
    }

    if (error instanceof TokenRevokedError) {
        // Your token has been revoked on the Pesto's API
        return;
    }

    if (error instanceof MonthlyLimitExceededError) {
        // The token exceeds the monthly quota limit defined by the Pesto's API.
        // To increase your limit, please contact the Pesto team.
        return;
    }

    if (error instanceof ServerRateLimitedError) {
        // Client got rate limited by the API for sending burst or too many concurrent requests to Pesto's API.
        //
        // To get around this, you can implement your own semaphore to handle parallel requests.
        // To learn more about semaphore, you can see this Wikipedia article:
        // https://en.wikipedia.org/wiki/Semaphore_(programming)
        return;
    }
}
```

## License

```
Copyright 2022 Teknologi Umum and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

See [LICENSE](../../LICENSE)
