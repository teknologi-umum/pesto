using System.Diagnostics.CodeAnalysis;
using System.Net;
using FluentAssertions;
using Pesto;
using Pesto.Exceptions;
using Pesto.Models;
using UnitTests.Mocks;

namespace UnitTests;

public class PestoClientTests {
    [Fact]
    public Task CanGetPingResponse() {
        return TestPestoApiAsync(
            client => client.PingAsync(CancellationToken.None),
            "https://pesto.teknologiumum.com/api/ping",
            "UnitTests.Responses.SuccessfulPingResponse.json",
            response => { response.Message.Should().Be("OK"); }
        );
    }

    [Fact]
    public Task CanGetListRuntimes() {
        return TestPestoApiAsync(
            client => client.ListRuntimesAsync(CancellationToken.None),
            "https://pesto.teknologiumum.com/api/list-runtimes",
            "UnitTests.Responses.SuccessfulListRuntimes.json",
            response => {
                response.Runtime.Should().HaveCount(3);
                response.Runtime[0].Language.Should().Be("Go");
                response.Runtime[0].Version.Should().Be("1.18.2");
                response.Runtime[0].Aliases.Should().ContainInOrder(new List<string> { "go", "golang" });
                response.Runtime[0].Compiled.Should().BeTrue();

                response.Runtime[1].Language.Should().Be("C#");
                response.Runtime[1].Version.Should().Be("6.0.300");
                response.Runtime[1].Aliases.Should().ContainInOrder(new List<string> { "c#", "dotnet" });
                response.Runtime[1].Compiled.Should().BeTrue();

                response.Runtime[2].Language.Should().Be("Javascript");
                response.Runtime[2].Version.Should().Be("18.12.0");
                response.Runtime[2].Aliases.Should().ContainInOrder(new List<string> { "javascript", "node", "js" });
                response.Runtime[2].Compiled.Should().BeFalse();
            }
        );
    }

    [Fact]
    public Task CanExecuteCode() {
        return TestPestoApiAsync(
            client =>
                client.ExecuteAsync(new CodeRequest("Python", "print('Hello world')"), CancellationToken.None),
            "https://pesto.teknologiumum.com/api/execute",
            "UnitTests.Responses.SuccessfulExecuteCode.json",
            response => {
                response.Language.Should().Be("Python");
                response.Version.Should().Be("3.10.2");
                response.Compile.ExitCode.Should().Be(0);
                response.Runtime.Stdout.Should().Be("Hello World");
                response.Runtime.Stderr.Should().BeEmpty();
                response.Runtime.Output.Should().Be("Hello World");
                response.Runtime.ExitCode.Should().Be(0);
            });
    }

    [Fact]
    public Task CanExecuteCode2() {
        return TestPestoApiAsync(
            client => client.ExecuteAsync("Python", "print('Hello world')", CancellationToken.None),
            "https://pesto.teknologiumum.com/api/execute",
            "UnitTests.Responses.SuccessfulExecuteCode.json",
            response => {
                response.Language.Should().Be("Python");
                response.Version.Should().Be("3.10.2");
                response.Compile.ExitCode.Should().Be(0);
                response.Runtime.Stdout.Should().Be("Hello World");
                response.Runtime.Stderr.Should().BeEmpty();
                response.Runtime.Output.Should().Be("Hello World");
                response.Runtime.ExitCode.Should().Be(0);
            });
    }

    [Fact]
    public void ShouldThrowExceptionOnFailedPingRequest() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client => client.PingAsync(CancellationToken.None),
                HttpStatusCode.Forbidden,
                "https://pesto.teknologiumum.com/api/ping",
                "UnitTests.Responses.SuccessfulPingResponse.json",
                response => { response.Message.Should().Be("OK"); }
            );
        };

        f.Should().ThrowAsync<HttpRequestException>();
    }

    [Fact]
    public void ShouldThrowExceptionOnInvalidPingResponse() {
        Func<Task> f = async () => {
            await TestPestoApiAsync(
                client => client.PingAsync(CancellationToken.None),
                "https://pesto.teknologiumum.com/api/ping",
                "UnitTests.Responses.InvalidResponse.json",
                response => { response.Message.Should().Be("OK"); }
            );
        };

        f.Should().ThrowAsync<PestoAPIException>();
    }

    [Fact]
    public void ShouldThrowExceptionOnRateLimitedListRuntimes() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client => client.ListRuntimesAsync(CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/list-runtimes",
                expectedResponseResourceName: "UnitTests.Responses.SuccessfulListRuntimes.json",
                validateResult: response => {
                    response.Runtime.Should().HaveCount(3);
                    response.Runtime[0].Language.Should().Be("Go");
                    response.Runtime[0].Version.Should().Be("1.18.2");
                    response.Runtime[0].Aliases.Should().ContainInOrder(new List<string> { "go", "golang" });
                    response.Runtime[0].Compiled.Should().BeTrue();

                    response.Runtime[1].Language.Should().Be("C#");
                    response.Runtime[1].Version.Should().Be("6.0.300");
                    response.Runtime[1].Aliases.Should().ContainInOrder(new List<string> { "c#", "dotnet" });
                    response.Runtime[1].Compiled.Should().BeTrue();

                    response.Runtime[2].Language.Should().Be("Javascript");
                    response.Runtime[2].Version.Should().Be("18.12.0");
                    response.Runtime[2].Aliases.Should()
                            .ContainInOrder(new List<string> { "javascript", "node", "js" });

                    response.Runtime[2].Compiled.Should().BeFalse();
                },
                expectedStatusCode: HttpStatusCode.TooManyRequests
            );
        };

        f.Should().ThrowAsync<PestoServerRateLimitedException>();
    }

    [Fact]
    public void ShouldThrowExceptionOnInvalidListRuntimesResponse() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client => client.ListRuntimesAsync(CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/list-runtimes",
                expectedResponseResourceName: "UnitTests.Responses.InvalidResponse.json",
                validateResult: response => {
                    response.Runtime.Should().HaveCount(3);
                    response.Runtime[0].Language.Should().Be("Go");
                    response.Runtime[0].Version.Should().Be("1.18.2");
                    response.Runtime[0].Aliases.Should().ContainInOrder(new List<string> { "go", "golang" });
                    response.Runtime[0].Compiled.Should().BeTrue();

                    response.Runtime[1].Language.Should().Be("C#");
                    response.Runtime[1].Version.Should().Be("6.0.300");
                    response.Runtime[1].Aliases.Should().ContainInOrder(new List<string> { "c#", "dotnet" });
                    response.Runtime[1].Compiled.Should().BeTrue();

                    response.Runtime[2].Language.Should().Be("Javascript");
                    response.Runtime[2].Version.Should().Be("18.12.0");
                    response.Runtime[2].Aliases.Should()
                            .ContainInOrder(new List<string> { "javascript", "node", "js" });

                    response.Runtime[2].Compiled.Should().BeFalse();
                },
                expectedStatusCode: HttpStatusCode.OK
            );
        };

        f.Should().ThrowAsync<PestoAPIException>();
    }

    [Fact]
    public void ShouldThrowExceptionForMonthlyLimitExceededExecuteCode() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client => client.ExecuteAsync("Python", "print('Hello world')", CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.MonthlyLimitExceededError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.TooManyRequests
            );
        };

        f.Should().ThrowAsync<PestoMonthlyLimitExceededException>();
    }

    [Fact]
    public void ShouldThrowExceptionForMonthlyLimitExceededExecuteCode2() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync(new CodeRequest("Python", "print('Hello world')"), CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.MonthlyLimitExceededError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.TooManyRequests
            );
        };

        f.Should().ThrowAsync<PestoMonthlyLimitExceededException>();
    }

    [Fact]
    public void ShouldThrowExceptionForServerRateLimitedExecuteCode() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync("Python", "print('Hello world')", CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.BadRequestError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.TooManyRequests
            );
        };

        f.Should().ThrowAsync<PestoServerRateLimitedException>();
    }

    [Fact]
    public void ShouldThrowExceptionForServerRateLimitedExecuteCode2() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync(new CodeRequest("Python", "print('Hello world')"), CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.BadRequestError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.TooManyRequests
            );
        };

        f.Should().ThrowAsync<PestoServerRateLimitedException>();
    }


    [Fact]
    public void ShouldThrowExceptionForRuntimeNotFoundExecuteCode() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync("Python", "print('Hello world')", CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.BadRequestError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.BadRequest
            );
        };

        f.Should().ThrowAsync<PestoRuntimeNotFoundException>()
         .WithMessage("Runtime not found for Python");
    }

    [Fact]
    public void ShouldThrowExceptionForRuntimeNotFoundExecuteCode2() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync(new CodeRequest("Python", "print('Hello world')"), CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.BadRequestError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.BadRequest
            );
        };

        f.Should().ThrowAsync<PestoRuntimeNotFoundException>()
         .WithMessage("Runtime not found for Python");
    }

    [Fact]
    public void ShouldThrowExceptionForBadRequestExecuteCode() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync("Python", "print('Hello world')", CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.BadRequestError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.Conflict
            );
        };

        f.Should().ThrowAsync<PestoAPIException>();
    }

    [Fact]
    public void ShouldThrowExceptionForBadRequestExecuteCode2() {
        Func<Task> f = async () => {
            await TestFailingPestoApiClient(
                client =>
                    client.ExecuteAsync(new CodeRequest("Python", "print('Hello world')"), CancellationToken.None),
                expectedUrl: "https://pesto.teknologiumum.com/api/execute",
                expectedResponseResourceName: "UnitTests.Responses.BadRequestError.json",
                validateResult: response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                },
                expectedStatusCode: HttpStatusCode.Conflict
            );
        };

        f.Should().ThrowAsync<PestoAPIException>();
    }

    [Fact]
    public void ShouldThrowExceptionForInvalidExecuteCodeResponse() {
        Func<Task> f = async () => {
            await TestPestoApiAsync(
                client =>
                    client.ExecuteAsync(new CodeRequest("Python", "print('Hello world')"), CancellationToken.None),
                "https://pesto.teknologiumum.com/api/execute",
                "UnitTests.Responses.InvalidResponse.json",
                response => {
                    response.Language.Should().Be("Python");
                    response.Version.Should().Be("3.10.2");
                    response.Compile.ExitCode.Should().Be(0);
                    response.Runtime.Stdout.Should().Be("Hello World");
                    response.Runtime.Stderr.Should().BeEmpty();
                    response.Runtime.Output.Should().Be("Hello World");
                    response.Runtime.ExitCode.Should().Be(0);
                }
            );
        };

        f.Should().ThrowAsync<PestoAPIException>();
    }

    [Fact]
    public void CanDispose() {
        PestoClient client = new("TESTING");

        client.Dispose();
    }

    #region Helpers

    private static async Task TestPestoApiAsync<TResult>(
        Func<PestoClient, Task<TResult>> invokeMethodAsync,
        string expectedUrl,
        string expectedResponseResourceName,
        Action<TResult> validateResult
    ) {
        string? capturedUrl = await PestoHttpClientMock.CaptureRequestUrlAsync(
            [ExcludeFromCodeCoverage] async (httpClient) => {
                var apiClient = new PestoClient("TESTING", httpClient);
                try {
                    _ = await invokeMethodAsync(apiClient);
                }
                catch {
                    // We don't care about the exception, we just want to capture the URL
                }
            });

        capturedUrl.Should().Be(expectedUrl);

        await PestoHttpClientMock.TestHttpClientUsingDummyJsonResourceAsync(
            expectedResponseResourceName,
            async httpClient => {
                var apiClient = new PestoClient("TESTING", httpClient);
                TResult result = await invokeMethodAsync(apiClient);
                validateResult(result);
            }
        );
    }

    private static async Task TestFailingPestoApiClient<TResult>(
        Func<PestoClient, Task<TResult>> invokeMethodAsync,
        HttpStatusCode expectedStatusCode,
        string expectedUrl,
        string expectedResponseResourceName,
        Action<TResult> validateResult
    ) {
        string? capturedUrl = await PestoHttpClientMock.CaptureRequestUrlAsync(
            [ExcludeFromCodeCoverage] async (httpClient) => {
                var apiClient = new PestoClient("TESTING", httpClient);
                try {
                    _ = await invokeMethodAsync(apiClient);
                }
                catch {
                    // We don't care about the exception, we just want to capture the URL
                }
            });

        capturedUrl.Should().Be(expectedUrl);

        await PestoHttpClientMock.TestHttpClientUsingDummyJsonResourceAsync(
            expectedResponseResourceName,
            async httpClient => {
                var apiClient = new PestoClient("TESTING", httpClient);
                TResult result = await invokeMethodAsync(apiClient);
                validateResult(result);
            },
            expectedStatusCode
        );
    }

    #endregion
}
