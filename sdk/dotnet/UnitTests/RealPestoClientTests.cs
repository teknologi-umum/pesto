using FluentAssertions;
using Pesto;

namespace UnitTests; 

public class RealPestoClientTests : IDisposable {
    private PestoClient? _pestoClient { get; }
    private bool _shouldSkip { get; }
    
    public RealPestoClientTests() {
        var pestoToken = Environment.GetEnvironmentVariable("PESTO_TOKEN");
        if (pestoToken == null) {
            _shouldSkip = true;

            return;
        }
        
        _pestoClient = new PestoClient(pestoToken);
    }

    [SkippableFact]
    public async void CanGetPingResponse() {
        Skip.If(_shouldSkip);
    
        var source = new CancellationTokenSource(TimeSpan.FromMinutes(1));
        var cancellationToken = source.Token;
        var pingResult =  await _pestoClient.PingAsync(cancellationToken);

        pingResult.Should().NotBeNull();
        pingResult.Message.Should().Be("OK");
    }

    [SkippableFact]
    public async void CanGetListRuntimesResponse() {
        Skip.If(_shouldSkip);

        var source = new CancellationTokenSource(TimeSpan.FromMinutes(1));
        var cancellationToken = source.Token;
        var listRuntimesResult = await _pestoClient.ListRuntimesAsync(cancellationToken);

        listRuntimesResult.Should().NotBeNull();
        listRuntimesResult.Runtime.Should().HaveCountGreaterThan(0);
    }

    [SkippableFact]
    public async void CanGetExecuteCodeResponse() {
        Skip.If(_shouldSkip);

        var source = new CancellationTokenSource(TimeSpan.FromMinutes(1));
        var cancellationToken = source.Token;
        var executeCodeResult = await _pestoClient.ExecuteAsync("Python", "print('Hello world!')", cancellationToken);

        executeCodeResult.Should().NotBeNull();
        executeCodeResult.Language.Should().Be("Python");
        executeCodeResult.Version.Should().NotBeNullOrEmpty();
        executeCodeResult.Runtime.ExitCode.Should().Be(0);
        executeCodeResult.Runtime.Output.Should().Be("Hello world!\n");
    }

    public void Dispose() {
        _pestoClient?.Dispose();
    }
}
    