# Pesto - Remote Code Execution Engine

**Pesto** is a Remote Code Execution Engine that lets you execute any piece of code on a remote server via REST API. It
is heavily inspired by [Piston](https://github.com/engineer-man/piston). Pesto is not a fork of Piston, it's an entire
rewrite from scratch and therefore it's not compatible with Piston but should be similar if you're already familiar with
Piston.

Pesto was written with a fresh start, minimizing the dependencies needed, and system controlled for limited resources
usage.

Pesto is not hosted anywhere at the moment, you will have to self-host it yourself. Though it's easy, all you need
is to clone the repository and run `docker compose up -d`.

## Who uses Pesto

* [Teknologi Umum Bot](https://github.com/teknologi-umum/bot)
* You?

Are you using Pesto on your project, if so, please put it here!

## Structure

| Codebase     | Description                               |
|--------------|-------------------------------------------|
| auth         | Authentication middleware for Pesto's API |
| landing      | Frontend service and entrypoint           |
| rce          | Remote code execution engine service      |
| registration | Registration and user management service  |
| sdk          | Client SDKs for Pesto's API               |

## Contributing

General contribution guidelines are on [CONTRIBUTING.md](./CONTRIBUTING.md), yet if you choose to do a code
contribution, please refer to the README file on each submodule that you are interested in. This repository may seem
daunting for newcomers, but rest assured, we're all friendly and we welcome any contributions whether it's just a typo
fix, a package version bump, or a security enhancement for one of Pesto's package. We are looking forward for your
contribution.

Please use [issues](https://github.com/teknologi-umum/pesto/issues) to file a bug or discuss any matter before
contributing to the source code.

If you need additional help, you can always talk to us via [Telegram](https://t.me/teknologi_umum_v2).

## License

```
Copyright 2024 Teknologi Umum <opensource@teknologiumum.com>

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