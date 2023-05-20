// Copyright 2022-2023 Teknologi Umum and contributors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Pesto.Exceptions;
using Pesto.Models;

namespace Pesto {
    public class PestoClient : IDisposable {
        private readonly Uri _baseUrl = new Uri("https://pesto.teknologiumum.com");
        private readonly TimeSpan _defaultTimeout = TimeSpan.FromSeconds(30);
        private readonly HttpClient _httpClient;

        private readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions
            { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        public PestoClient(string token) {
            if (string.IsNullOrWhiteSpace(token)) throw new ArgumentNullException(nameof(token));

            _httpClient = new HttpClient();

            // Configure HTTP client
            _httpClient.DefaultRequestHeaders.Add("X-Pesto-Token", token);
            _httpClient.Timeout     = _defaultTimeout;
            _httpClient.BaseAddress = _baseUrl;
        }

        public PestoClient(string token, string baseUrl) {
            if (string.IsNullOrWhiteSpace(token)) throw new ArgumentNullException(nameof(token));
            if (string.IsNullOrWhiteSpace(baseUrl)) throw new ArgumentNullException(nameof(baseUrl));

            _baseUrl    = new Uri(baseUrl);
            _httpClient = new HttpClient();

            // Configure HTTP client
            _httpClient.DefaultRequestHeaders.Add("X-Pesto-Token", token);
            _httpClient.Timeout     = _defaultTimeout;
            _httpClient.BaseAddress = _baseUrl;
        }

        public PestoClient(string token, Uri baseUrl) {
            if (string.IsNullOrWhiteSpace(token)) throw new ArgumentNullException(nameof(token));

            _baseUrl    = baseUrl;
            _httpClient = new HttpClient();

            // Configure HTTP client
            _httpClient.DefaultRequestHeaders.Add("X-Pesto-Token", token);
            _httpClient.Timeout     = _defaultTimeout;
            _httpClient.BaseAddress = _baseUrl;
        }

        public PestoClient(string token, Uri baseUrl, TimeSpan defaultTimeout) {
            if (string.IsNullOrWhiteSpace(token)) throw new ArgumentNullException(nameof(token));

            _baseUrl    = baseUrl;
            _httpClient = new HttpClient();

            // Configure HTTP client
            _httpClient.DefaultRequestHeaders.Add("X-Pesto-Token", token);
            _httpClient.Timeout     = defaultTimeout;
            _httpClient.BaseAddress = _baseUrl;
        }

        public PestoClient(string token, HttpClient httpClient) {
            if (string.IsNullOrWhiteSpace(token)) throw new ArgumentNullException(nameof(token));

            _httpClient = httpClient;

            // Configure HTTP client
            _httpClient.DefaultRequestHeaders.Add("X-Pesto-Token", token);
        }

        public void Dispose() {
            _httpClient.Dispose();
        }


        /// <summary>
        ///     Ping calls the ping endpoint. This is useful to check whether the API is having a downtime.
        ///     To make the function work properly, put a context with deadline (or timeout), or provide
        ///     DefaultTimeout a value when creating the client.
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <returns>PingResponse record which shows some message</returns>
        /// <exception cref="PestoServerRateLimitedException">Too many request to the API. Client should try again in a few minutes</exception>
        /// <exception cref="PestoAPIException"></exception>
        public async Task<PingResponse> PingAsync(CancellationToken cancellationToken) {
            using (var request = new HttpRequestMessage(HttpMethod.Get, "api/ping")) {
                using (HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken)) {
                    if (response.StatusCode.CompareTo(429) == 0) {
                        throw new PestoServerRateLimitedException();
                    }

                    response.EnsureSuccessStatusCode();

                    using (Stream responseBody = await response.Content.ReadAsStreamAsync()) {
                        var pingResponse = await JsonSerializer.DeserializeAsync<PingResponse>(
                            responseBody,
                            _jsonSerializerOptions,
                            cancellationToken);

                        if (pingResponse == null) {
                            throw new PestoAPIException();
                        }

                        return pingResponse;
                    }
                }
            }
        }

        /// <summary>
        ///     ListRuntimes calls the list-runtimes endpoint. The Language and Version item from the response record
        ///     can be used to create an execute code request.
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <returns>Array of runtimes</returns>
        /// <exception cref="PestoServerRateLimitedException">Too many request to the API. Client should try again in a few minutes</exception>
        /// <exception cref="PestoAPIException"></exception>
        public async Task<RuntimeResponse> ListRuntimesAsync(CancellationToken cancellationToken) {
            using (var request = new HttpRequestMessage(HttpMethod.Get, "api/list-runtimes")) {
                using (HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken)) {
                    if (response.StatusCode.CompareTo(429) == 0) {
                        throw new PestoServerRateLimitedException();
                    }

                    response.EnsureSuccessStatusCode();

                    using (Stream responseBody = await response.Content.ReadAsStreamAsync()) {
                        var runtimeResponse = await JsonSerializer.DeserializeAsync<RuntimeResponse>(
                            responseBody,
                            _jsonSerializerOptions,
                            cancellationToken);

                        if (runtimeResponse == null) {
                            throw new PestoAPIException();
                        }

                        return runtimeResponse;
                    }
                }
            }
        }

        /// <summary>
        ///     Execute calls the execute endpoint, and execute the given code from the codeRequest parameter.
        /// </summary>
        /// <param name="language"></param>
        /// <param name="code"></param>
        /// <param name="cancellationToken"></param>
        /// <returns>The code execution result</returns>
        /// <exception cref="PestoMonthlyLimitExceededException">
        ///     Token has exceed the allowed monthly limit. User should contact
        ///     the Pesto team to increase their allowed limit.
        /// </exception>
        /// <exception cref="PestoRuntimeNotFoundException">
        ///     The runtime specified (language-version combination) is not allowed at
        ///     Pesto's API
        /// </exception>
        /// <exception cref="PestoServerRateLimitedException">Too many request to the API. Client should try again in a few minutes</exception>
        /// <exception cref="PestoAPIException"></exception>
        public async Task<CodeResponse>
            ExecuteAsync(string language, string code, CancellationToken cancellationToken) {
            string requestBody = JsonSerializer.Serialize(
                new CodeRequest(
                    language,
                    code,
                    version: "latest",
                    compileTimeout: 0,
                    runTimeout: 0,
                    memoryLimit: 0
                ),
                _jsonSerializerOptions);

            using (var request = new HttpRequestMessage(HttpMethod.Post, "api/execute")) {
                request.Content = new StringContent(requestBody);
                using (HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken)) {
                    if (response.StatusCode != HttpStatusCode.OK) {
                        using (Stream responseBody = await response.Content.ReadAsStreamAsync()) {
                            var errorResponse = await JsonSerializer.DeserializeAsync<ErrorResponse>(
                                responseBody,
                                _jsonSerializerOptions,
                                cancellationToken);

                            if (response.StatusCode == HttpStatusCode.BadRequest) {
                                if (errorResponse?.Message == "Runtime not found") {
                                    throw new PestoRuntimeNotFoundException(language);
                                }

                                throw new PestoAPIException(errorResponse?.Message);
                            }

                            if (response.StatusCode.CompareTo(429) == 0) {
                                if (errorResponse?.Message == "Monthly limit exceeded") {
                                    throw new PestoMonthlyLimitExceededException();
                                }

                                throw new PestoServerRateLimitedException();
                            }

                            throw new PestoAPIException(errorResponse?.Message);
                        }
                    }

                    response.EnsureSuccessStatusCode();

                    using (Stream responseBody = await response.Content.ReadAsStreamAsync()) {
                        var codeResponse = await JsonSerializer.DeserializeAsync<CodeResponse>(
                            responseBody,
                            _jsonSerializerOptions,
                            cancellationToken);

                        if (codeResponse == null) {
                            throw new PestoAPIException();
                        }

                        return codeResponse;
                    }
                }
            }
        }

        /// <summary>
        ///     Execute calls the execute endpoint, and execute the given code from the codeRequest parameter.
        /// </summary>
        /// <param name="codeRequest"></param>
        /// <param name="cancellationToken"></param>
        /// <returns>The code execution result</returns>
        /// <exception cref="PestoMonthlyLimitExceededException">
        ///     Token has exceed the allowed monthly limit. User should contact
        ///     the Pesto team to increase their allowed limit.
        /// </exception>
        /// <exception cref="PestoRuntimeNotFoundException">
        ///     The runtime specified (language-version combination) is not allowed at
        ///     Pesto's API
        /// </exception>
        /// <exception cref="PestoServerRateLimitedException">Too many request to the API. Client should try again in a few minutes</exception>
        /// <exception cref="PestoAPIException"></exception>
        public async Task<CodeResponse> ExecuteAsync(CodeRequest codeRequest, CancellationToken cancellationToken) {
            string requestBody = JsonSerializer.Serialize(codeRequest, _jsonSerializerOptions);
            using (var request = new HttpRequestMessage(HttpMethod.Post, "api/execute")) {
                request.Content = new StringContent(requestBody);
                using (HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken)) {
                    if (response.StatusCode != HttpStatusCode.OK) {
                        using (Stream responseBody = await response.Content.ReadAsStreamAsync()) {
                            var errorResponse = await JsonSerializer.DeserializeAsync<ErrorResponse>(
                                responseBody,
                                _jsonSerializerOptions,
                                cancellationToken);

                            if (response.StatusCode == HttpStatusCode.BadRequest) {
                                if (errorResponse?.Message == "Runtime not found") {
                                    throw new PestoRuntimeNotFoundException(codeRequest.Language);
                                }

                                throw new PestoAPIException(errorResponse?.Message);
                            }

                            if (response.StatusCode.CompareTo(429) == 0) {
                                if (errorResponse?.Message == "Monthly limit exceeded") {
                                    throw new PestoMonthlyLimitExceededException();
                                }

                                throw new PestoServerRateLimitedException();
                            }

                            throw new PestoAPIException(errorResponse?.Message);
                        }
                    }

                    response.EnsureSuccessStatusCode();

                    using (Stream responseBody = await response.Content.ReadAsStreamAsync()) {
                        var codeResponse = await JsonSerializer.DeserializeAsync<CodeResponse>(
                            responseBody,
                            _jsonSerializerOptions,
                            cancellationToken);

                        if (codeResponse == null) {
                            throw new PestoAPIException();
                        }

                        return codeResponse;
                    }
                }
            }
        }
    }
}
