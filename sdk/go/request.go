package pesto

import (
	"context"
	"fmt"
	"net/http"
	"strings"
)

// sendRequest will modify the http request from the given parameter
// and adds some headers including the token and content types.
func (c *Client) sendRequest(ctx context.Context, request *http.Request) (*http.Response, error) {
	request.Header.Set("X-Pesto-Token", c.token)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "application/json")

	return c.httpClient.Do(request)
}

type errorResponse struct {
	Message string `json:"message"`
}

// handleErrorCode will maps HTTP status code from the HTTP response
// into the errors that are defined on this package
func (c *Client) handleErrorCode(code int, response errorResponse) error {
	switch code {
	case http.StatusNotFound:
		return fmt.Errorf("api path not found")
	case http.StatusInternalServerError:
		return fmt.Errorf("%w: %s", ErrInternalServerError, response.Message)
	case http.StatusUnauthorized:
		if response.Message == "Token must be supplied" {
			return ErrMissingToken
		} else if response.Message == "Token not registered" {
			return ErrTokenNotRegistered
		} else if response.Message == "Token has been revoked" {
			return ErrTokenRevoked
		}
	case http.StatusTooManyRequests:
		if response.Message == "Monthly limit exceeded" {
			return ErrMonthlyLimitExceeded
		}

		return ErrServerRateLimited
	case http.StatusBadRequest:
		if response.Message == "Runtime not found" {
			return ErrRuntimeNotFound
		}

		if strings.HasPrefix(response.Message, "Missing parameters") {
			return fmt.Errorf("%w: %s", ErrMissingParameters, response.Message)
		}

		return fmt.Errorf("%s (this is probably a problem with the SDK, please submit an issue on our Github repository)", response.Message)
	}

	return fmt.Errorf("received code %d: %s (this is probably a problem with the SDK, please submit an issue on our Github repository)", code, response.Message)
}
