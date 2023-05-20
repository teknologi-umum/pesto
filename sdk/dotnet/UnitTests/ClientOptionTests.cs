using FluentAssertions;
using Pesto;

namespace UnitTests;

public class ClientOptionTests {
    [Fact]
    public void ThrowExceptionForEmptyToken() {
        new Action(() => { _ = new PestoClient(""); }).Should().Throw<ArgumentNullException>();

        new Action(() => { _ = new PestoClient("", "https://pesto.teknologiumum.com"); }).Should()
            .Throw<ArgumentNullException>();

        new Action(() => { _ = new PestoClient("", new Uri("https://pesto.teknologiumum.com")); }).Should()
            .Throw<ArgumentNullException>();

        new Action(
                () => { _ = new PestoClient("", new Uri("https://pesto.teknologiumum.com"), TimeSpan.FromMinutes(1)); })
            .Should().Throw<ArgumentNullException>();

        new Action(() => { _ = new PestoClient("", new HttpClient()); }).Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void ShouldBeAbleToCreatePestoClients() {
        var client = new PestoClient("TESTING");
        client.Should().BeOfType<PestoClient>();
    }

    [Fact]
    public void ShouldBeAbleToCreatePestoClientWithCustomBaseUrl() {
        var stringClient = new PestoClient("TESTING", "https://party.teknologiumum.com");
        stringClient.Should().BeOfType<PestoClient>();

        var uriClient = new PestoClient("TESTING", new Uri("https://party.teknologiumum.com"));
        uriClient.Should().BeOfType<PestoClient>();
    }

    [Fact]
    public void ShouldBeAbleToCreatePestoClientWithCustomTimespan() {
        var client = new PestoClient("TESTING", new Uri("https://party.teknologiumum.com"), TimeSpan.FromDays(1));
        client.Should().BeOfType<PestoClient>();
    }
}
