using System.Net;
using System.Text;
using Moq;
using Moq.Protected;

namespace UnitTests.Mocks; 

public static class PestoHttpClientMock {
    // ReSharper disable once InconsistentNaming
		public static async Task<string?> CaptureRequestUrlAsync(Func<HttpClient, Task> testAsync) {
			Mock<HttpMessageHandler> handlerMock = new();

			using HttpResponseMessage responseMessage = new() {
				StatusCode = System.Net.HttpStatusCode.OK,
				Content = new StringContent(
					content: "{}",
					encoding: Encoding.UTF8,
					mediaType: "application/json"
				)
			};

			string? sentUrl = null;

			handlerMock
				.Protected()
				.Setup<Task<HttpResponseMessage>>(
					"SendAsync",
					ItExpr.IsAny<HttpRequestMessage>(),
					ItExpr.IsAny<CancellationToken>()
				)
				.Callback((HttpRequestMessage requestMessage, CancellationToken _) => {
					sentUrl = requestMessage.RequestUri?.OriginalString;
				})
				.ReturnsAsync(responseMessage);

			using HttpClient httpClient = new(handlerMock.Object, disposeHandler: false) {
				BaseAddress = new Uri("https://pesto.teknologiumum.com/"),
				DefaultRequestHeaders =
				{
					{ "User-Agent", "Pesto Testing/1.0" },
					{ "Accept", "*/*" },
					{ "Accept-Encoding", "gzip, deflate, br" }
				},
				Timeout = TimeSpan.FromSeconds(45)
			};

			await testAsync(httpClient);

			return sentUrl;
		}

		// ReSharper disable once InconsistentNaming
		public static async Task TestHttpClientUsingDummyJsonContentAsync(string jsonContent, Func<HttpClient, Task> testAsync, HttpStatusCode statusCode) {
			Mock<HttpMessageHandler> handlerMock = new();

			handlerMock
				.Protected()
				.Setup<Task<HttpResponseMessage>>(
					"SendAsync",
					ItExpr.IsAny<HttpRequestMessage>(),
					ItExpr.IsAny<CancellationToken>()
				)
				.ReturnsAsync(() => new HttpResponseMessage {
					StatusCode = statusCode,
					Content = new StringContent(
						content: jsonContent,
						encoding: Encoding.UTF8,
						mediaType: "application/json"
					)
				});

			using HttpClient httpClient = new(handlerMock.Object, disposeHandler: false) {
				BaseAddress = new Uri("https://pesto.teknologiumum.com/"),
				DefaultRequestHeaders =
				{
					{ "User-Agent", "Pesto/1.0" },
					{ "Accept", "*/*" },
					{ "Accept-Encoding", "gzip, deflate, br" }
				},
				Timeout = TimeSpan.FromSeconds(45)
			};

			await testAsync(httpClient);
		}

		// ReSharper disable once InconsistentNaming
		public static async Task TestHttpClientUsingDummyJsonResourceAsync(string resourceName, Func<HttpClient, Task> testAsync, HttpStatusCode statusCode = HttpStatusCode.OK) {
			await using Stream? stream = typeof(PestoHttpClientMock).Assembly.GetManifestResourceStream(resourceName);
			if (stream is null) throw new InvalidProgramException($"Embedded resource not found: {resourceName}");
			using StreamReader streamReader = new(stream);
			string jsonContent = await streamReader.ReadToEndAsync();
			await TestHttpClientUsingDummyJsonContentAsync(jsonContent, testAsync, statusCode);
		}
}
