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
    client, err := pesto.NewClient(YOUR_TOKEN_GOES_HERE)
    if err != nil {
        // Handle the error
        // It will return ErrEmptyToken if you provide no token
    }

    codeResult, err := client.Execute(context.TODO(), pesto.CodeRequest{
        Language: pesto.LanguagePython,
        Version: pesto.LanguagePython,
        Code: "print('Hello world!')",
    })
    if err != nil {
        // Handle the error
    }

    fmt.Println(codeResult.Runtime.Output) // should outputs 'Hello world!'
}
```

See [pkg.go.dev](https://pkg.go.dev/github.com/teknologi-umum/pesto/sdk/go) for complete API documentation.