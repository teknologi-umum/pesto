# Pesto - Remote Code Execution Engine

**Pesto** is a Remote Code Execution Engine that lets you execute any piece of code on a remote server via REST API. It is heavily inspired by [Piston](https://github.com/engineer-man/piston). Pesto is not a fork of Piston, it's an entire rewrite from scratch and therefore it's not compatible with Piston but should be similar if you're already familiar with Piston.

Pesto was written with a fresh start, minimizing the dependencies needed, and system controlled for limited resources usage. Hence, users will need to register in order to gain access to Pesto's API.

See [our website](https://pesto.teknologiumum.com) for details.

## Structure

| Codebase     | Description                               |
| ------------ | ----------------------------------------- |
| auth         | Authentication middleware for Pesto's API |
| landing      | Frontend service and entrypoint           |
| rce          | Remote code execution engine service      |
| registration | Registration and user management service  |

## Contributing

Details on how to contribute will be specified soon.

Please use [issues](https://github.com/teknologi-umum/pesto/issues) to file a bug or discuss any matter before contributing to the source code.

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

See [LICENSE](./LICENSE)