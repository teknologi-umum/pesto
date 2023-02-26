using Pesto;
using System.Diagnostics.CodeAnalysis;
using FluentAssertions;
using UnitTests.Mocks;

namespace UnitTests; 

public class PestoClientTests {
    [Fact]
    public Task ShouldThrowExceptionOnEmptyToken() {
        return;
        
    }

    [Fact]
    public Task CanGetPingResponse() { }

    [Fact]
    public Task CanGetListRuntimes() { }

    [Fact]
    public Task CanExecuteCode() { }

    #region Helpers

    private static async Task TestPestoAPIAsync<TResult>(
        Func<PestoClient, Task<TResult>> invokeMethodAsync,
        string expectedUrl,
        string expectedResponseResourceName,
        Action<TResult> validateResult
    ) {
        string? capturedUrl = await PestoHttpClientMock.CaptureRequestUrlAsync([ExcludeFromCodeCoverage] async (httpClient) => {
            using PestoClient apiClient = new("fake-token", httpClient);
            try {
                _ = await invokeMethodAsync(apiClient);
            } catch {
                // We only need to capture url. Suppress all exceptions.
            }
        });

        capturedUrl.Should().Be(expectedUrl);

        await PestoHttpClientMock.TestHttpClientUsingDummyJsonResourceAsync(
            resourceName: expectedResponseResourceName,
            testAsync: async httpClient => {
                using PestoClient apiClient = new(token: "fake-token", httpClient: httpClient);
                TResult result = await invokeMethodAsync(apiClient);
                validateResult(result);
            }
        );
    }

    #endregion
}
