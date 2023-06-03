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


class CodeOutput:
    def __init__(self, stdout: str, stderr: str, output: str, exit_code: int):
        self.__stdout = stdout
        self.__stderr = stderr
        self.__output = output
        self.__exit_code = exit_code

    @property
    def stdout(self) -> str:
        return self.__stdout

    @property
    def stderr(self) -> str:
        return self.__stderr

    @property
    def output(self) -> str:
        return self.__output

    @property
    def exit_code(self) -> int:
        return self.__exit_code


class CodeResponse:
    def __init__(
        self,
        language: str,
        version: str,
        compile_output: CodeOutput,
        runtime_output: CodeOutput,
    ):
        self.__language = language
        self.__version = version
        self.__compile_output = compile_output
        self.__runtime_output = runtime_output

    @property
    def language(self) -> str:
        return self.__language

    @property
    def version(self) -> str:
        return self.__version

    @property
    def compile_output(self) -> CodeOutput:
        return self.__compile_output

    @property
    def runtime_output(self) -> CodeOutput:
        return self.__runtime_output
