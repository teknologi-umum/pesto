# Go SDK for Pesto

Client SDK for [Go](https://go.dev)

```go
package main

import (
    "context"
    "fmt"

    pesto "github.com/teknologi-umum/pesto/sdk/go"
)

func main() {
    client, err := pesto.NewClient("YOUR_TOKEN_GOES_HERE")
    if err != nil {
        // Handle the error
        // It will return ErrEmptyToken if you provide no token
    }

    codeResult, err := client.Execute(context.TODO(), pesto.CodeRequest{
        Language: pesto.LanguagePython,
        Version: pesto.VersionPython,
        Code: "print('Hello world!')",
    })
    if err != nil {
        // Handle the error
    }

    fmt.Println(codeResult.Runtime.Output) // should outputs 'Hello world!'
}
```

See [pkg.go.dev](https://pkg.go.dev/github.com/teknologi-umum/pesto/sdk/go) for complete API documentation.

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