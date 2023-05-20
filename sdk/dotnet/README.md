# Javascript SDK for Pesto

Client SDK for [.NET](https://dotnet.microsoft.com/)

## Installation

```shell
dotnet add package Pesto

# Using Package Manager
NuGet\Install-Package Pesto
```

## Usage

```csharp
using Pesto;

var pestoClient = new PestoClient("YOUR_TOKEN_GOES_HERE");

var pingResult = await pestoClient.PingAsync(CancellationToken.None);
Console.WriteLine(pingResult.Message); // Should return "OK"

var listRuntimesResult = await pestoClient.ListRUntimesAsync(CancellationToken.None);
Console.WriteLine(listRuntimesResult.Runtime);

var executeCodeResult = await pestoClient.ExecuteAsync("Python", "print('Hello world!')", CancellationToken.None);
Console.WriteLine(executeCodeResult.Runtime.Output);

# Or..

var executeCodeResult = await pestoClient.ExecuteAsync(new CodeRequest("Python", "print('Hello world!')"), CancellationToken.None);
Console.WriteLine(executeCodeResult.Runtime.Output);
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