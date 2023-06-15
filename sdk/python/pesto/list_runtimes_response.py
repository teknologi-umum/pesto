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


class Runtime:
    def __init__(self, language: str, version: str, aliases: list[str], compiled: bool):
        self.__language = language
        self.__version = version
        self.__aliases = aliases
        self.__compiled = compiled

    @property
    def language(self) -> str:
        return self.__language

    @property
    def version(self) -> str:
        return self.__version

    @property
    def aliases(self) -> list[str]:
        return self.__aliases

    @property
    def compiled(self) -> bool:
        return self.__compiled


class ListRuntimesResponse:
    def __init__(self, runtimes: list[Runtime]):
        self.__runtimes = runtimes

    @property
    def runtimes(self) -> list[Runtime]:
        return self.__runtimes
