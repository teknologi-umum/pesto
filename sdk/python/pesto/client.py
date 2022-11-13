"""
Copyright 2022-2023 Teknologi Umum and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import requests

from pesto.exceptions import InternalServerError, MissingTokenError, TokenNotRegisteredError, TokenRevokedError, \
    MonthlyLimitExceededError, ServerRateLimitedError, RuntimeNotFoundError, MissingParameterError, \
    MaximumAllowedEntrypointsExceededError
from pesto.execute_request import CodeRequest
from pesto.list_runtimes_response import ListRuntimesResponse, Runtime
from pesto.ping_response import PingResponse


def handle_error(status: int, body: dict[str, str]):
    if status == 404:
        raise Exception("api path not found")
    elif status == 500:
        raise InternalServerError(body['message'])
    elif status == 401:
        if body['message'] == "Token must be supplied":
            raise MissingTokenError()
        elif body['message'] == "Token not registered":
            raise TokenNotRegisteredError()
        elif body['message'] == "Token has been revoked":
            raise TokenRevokedError()
    elif status == 429:
        if body['message'] == "Monthly limit exceeded":
            raise MonthlyLimitExceededError()

        raise ServerRateLimitedError()
    elif status == 400:
        if body['message'] == "Runtime not found":
            raise RuntimeNotFoundError()

        if body['message'].startswith("Missing parameters"):
            raise MissingParameterError(body['message'])

        if body['message'].startswith("Maximum allowed entrypoint exceeded"):
            raise MaximumAllowedEntrypointsExceededError(body['message'])

        raise Exception(body['message'] + "(this is probably a problem with the SDK, please submit an issue on "
                                          "our Github repository)")
    raise Exception(f"received code {status}: {body['message']}" +
                    " (this is probably a problem with the SDK, please submit an issue on our Github repository")


class Client:
    """
    Creates a new Pesto client.
    """

    def __init__(self, token: str, base_url="https://pesto.teknologiumum.com", timeout_seconds=300):
        self.token = token
        self.base_url = base_url
        self.timeout_seconds = timeout_seconds

    async def ping(self) -> PingResponse:
        response = requests.get(
            url=self.base_url + "/api/ping",
            headers={'X-Pesto-Token': self.token, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        )

        response_body = response.json()
        if response.status_code != 200:
            handle_error(response.status_code, response_body)

        return PingResponse(response_body.message)

    async def list_runtimes(self) -> ListRuntimesResponse:
        response = requests.get(
            url=self.base_url + "/api/list-runtimes",
            headers={'X-Pesto-Token': self.token, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        )

        response_body = response.json()
        if response.status_code != 200:
            handle_error(response.status_code, response_body)

        runtimes: list[Runtime] = []
        for rt in response_body.runtime:
            runtimes.append(Runtime(rt.language, rt.version, rt.aliases, rt.compiled))

        return ListRuntimesResponse(runtimes)

    async def execute(self, request: CodeRequest):
        # TODO
        return
