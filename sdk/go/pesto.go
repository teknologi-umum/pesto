// Pesto provides client SDK for Pesto, a remote code execution engine.
package pesto

import (
	"net/http"
	"net/url"
	"time"
)

type Client struct {
	baseURL        *url.URL
	defaultTimeout time.Duration
	token          string
	httpClient     *http.Client
}

type Config struct {
	BaseURL        *url.URL
	DefaultTimeout time.Duration
	Token          string
	HttpClient     *http.Client
}

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
		httpClient:     http.DefaultClient,
	}

	return client, nil
}

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
		client.httpClient = http.DefaultClient
	}

	return client, nil
}
