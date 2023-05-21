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

// Package pesto provides client SDK for Pesto, a remote code execution engine.
// To learn more about pesto, please visit https://pesto.teknologiumum.com/
package pesto

import (
	"net/http"
	"net/url"
	"time"
)

// Client stores data related to the HTTP request creation.
type Client struct {
	baseURL        *url.URL
	defaultTimeout time.Duration
	token          string
	httpClient     *http.Client
}

// Config provides configuration for Pesto client.
type Config struct {
	// BaseURL states the base URL of the Pesto's API.
	// Defaults to "https://pesto.teknologiumum.com"
	BaseURL *url.URL
	// DefaultTimeout is used to set the timeout for HTTP request.
	// Defaults to 5 minutes
	DefaultTimeout time.Duration
	// Token contains the Pesto token.
	// To acquire a token, go to https://pesto.teknologiumum.com/#request
	Token string
	// HttpClient states custom HTTP client to use throughout the SDK.
	// Defaults to &http.Client{}
	HttpClient *http.Client
}

// NewClient populates Client struct with default values and the provided token.
// If token is not provided, it will return ErrEmptyToken error.
//
// To create a client with custom configuration, use NewClientWithConfig.
func NewClient(token string) (*Client, error) {
	if token == "" {
		return &Client{}, ErrEmptyToken
	}

	client := &Client{
		baseURL: &url.URL{
			Scheme: "https",
			Host:   "pesto.teknologiumum.com",
		},
		defaultTimeout: time.Minute * 5,
		token:          token,
		httpClient:     &http.Client{Timeout: time.Minute * 5},
	}

	return client, nil
}

// NewClientWithConfig creates a Client struct with the given Config struct.
// If token is not provided, it will return ErrEmptyToken error.
// If anything else is not provided, it will set a default value.
func NewClientWithConfig(config Config) (*Client, error) {
	if config.Token == "" {
		return &Client{}, ErrEmptyToken
	}

	client := &Client{
		token:          config.Token,
		baseURL:        config.BaseURL,
		defaultTimeout: config.DefaultTimeout,
		httpClient:     config.HttpClient,
	}

	if config.BaseURL == nil {
		client.baseURL = &url.URL{
			Scheme: "https",
			Host:   "pesto.teknologiumum.com",
		}
	}

	if config.DefaultTimeout == 0 {
		client.defaultTimeout = time.Minute * 5
	}

	if config.HttpClient == nil {
		client.httpClient = &http.Client{Timeout: config.DefaultTimeout}
	}

	return client, nil
}
