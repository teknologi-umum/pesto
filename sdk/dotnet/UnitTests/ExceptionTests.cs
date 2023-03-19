using FluentAssertions;
using Pesto.Exceptions;

namespace UnitTests; 

public class ExceptionTests {
    [Fact]
    public void CanCreatePestoApiException() {
        var pestoApiException = new PestoAPIException();
        pestoApiException.Message.Should().Be("Unhandled exception with empty message");

        var pestoApiExceptionWithMessage = new PestoAPIException("Hello world");
        pestoApiExceptionWithMessage.Message.Should().Be("Hello world");
    }

    [Fact]
    public void CanCreatePestoMonthlyLimitExceededException() {
        var exception = new PestoMonthlyLimitExceededException();
        exception.Message.Should().Be("Monthly limit exceeded for current token");
    }

    [Fact]
    public void CanCreatePestoRuntimeNotFoundException() {
        var exception = new PestoRuntimeNotFoundException(null);
        exception.Message.Should().Be("Runtime not found for current request");

        var exceptionWithMessage = new PestoRuntimeNotFoundException("Java");
        exceptionWithMessage.Message.Should().Be("Runtime not found for Java");
    }

    [Fact]
    public void CanCreatePestoServerRateLimitedException() {
        var exception = new PestoServerRateLimitedException();
        exception.Message.Should().Be("Server rate limited");
    }
}
