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


import json


class File:
    def __init__(self, filename: str, code: str, entrypoint: bool = False):
        self.filename = filename
        self.code = code
        self.entrypoint = entrypoint

    def to_dict(self) -> dict:
        return {
            'name': self.filename,
            'code': self.code,
            'entrypoint': self.entrypoint
        }


class CodeRequest:
    def __init__(self, language: str, version: str, files: list[File], compile_timeout: int = 10000, run_timeout: int = 10000, memory_limit: int = 0):
        self.language = language
        self.version = version
        self.files = files
        self.compile_timeout = compile_timeout
        self.run_timeout = run_timeout
        self.memory_limit = memory_limit

    def to_json(self) -> str:
        return json.dumps({
            'language': self.language,
            'version': self.version,
            'files': [file.to_dict() for file in self.files],
            'compileTimeout': self.compile_timeout,
            'runTimeout': self.run_timeout,
            'memoryLimit': self.memory_limit
        })