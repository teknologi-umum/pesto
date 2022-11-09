"""
Copyright 2022-2023 Teknologi Umum and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""


class MissingParameterError(Exception):
    """
    Some parameters are missing on the HTTP request
    or the request body is empty.
    """

    def __init__(self, message: str):
        self.message = message


class EmptyTokenError(Exception):
    """
    Token was empty during Client creation.
    """

    def __init__(self):
        self.message = "empty token"


class MissingTokenError(Exception):
    """
    Token was not sent during the HTTP request.
    """

    def __init__(self):
        self.message = "missing token"


class InternalServerError(Exception):
    """
    An error occurred on Pesto's server.
    Client should retry the request after a few seconds.

    If the error persist, please contact the Pesto team.
    """

    def __init__(self, message: str):
        self.message = message


class TokenNotRegisteredError(Exception):
    """
    Given Client token was not registered on Pesto's API.
    """

    def __init__(self):
        self.message = "token not registered"


class TokenRevokedError(Exception):
    """
    Provided token is already revoked on Pesto's API.
    """

    def __init__(self):
        self.message = "token revoked"


class MonthlyLimitExceededError(Exception):
    """
    The token exceeds the monthly quota limit defined by the Pesto's API.

    To increase your limit, please contact the Pesto team.
    """

    def __init__(self):
        self.message = "monthly limit exceeded"


class ServerRateLimitedError(Exception):
    """
    Client got rate limited by the API for sending burst or too many
    concurrent requests to Pesto's API.

    To get around this, you can implement your own semaphore to handle parallel requests.
    To learn more about semaphore, you can see this Wikipedia article:
    https://en.wikipedia.org/wiki/Semaphore_(programming)
    """

    def __init__(self):
        self.message = "server rate limited"


class RuntimeNotFoundError(Exception):
    """
    Provided language-version combination does not exists on Pesto's API.
    """
