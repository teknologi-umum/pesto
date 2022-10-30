package pesto

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

type PingResponse struct {
	Message string `json:"message"`
}

func (c *Client) Ping(ctx context.Context) (PingResponse, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL.JoinPath("/api/ping").String(), nil)
	if err != nil {
		return PingResponse{}, fmt.Errorf("creating request: %w", err)
	}

	response, err := c.sendRequest(ctx, request)
	if err != nil {
		return PingResponse{}, fmt.Errorf("sending request: %w", err)
	}

	if response.StatusCode != 200 {
		var errResponse errorResponse
		err := json.NewDecoder(response.Body).Decode(&errResponse)
		if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrClosedPipe) {
			return PingResponse{}, fmt.Errorf("reading json body: %w", err)
		}

		err = response.Body.Close()
		if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrClosedPipe) && !errors.Is(err, http.ErrBodyReadAfterClose) {
			return PingResponse{}, fmt.Errorf("closing response body: %w", err)
		}

		return PingResponse{}, c.handleErrorCode(response.StatusCode, errResponse)
	}

	var pingResponse PingResponse
	err = json.NewDecoder(response.Body).Decode(&pingResponse)
	if err != nil {
		return PingResponse{}, fmt.Errorf("reading json body: %w", err)
	}

	err = response.Body.Close()
	if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrClosedPipe) && !errors.Is(err, http.ErrBodyReadAfterClose) {
		return PingResponse{}, fmt.Errorf("closing response body: %w", err)
	}

	return pingResponse, nil
}
