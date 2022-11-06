package pesto

import "errors"

var (
	// ErrMisingParameters indicates some parameters are missing
	// or empty on the request body.
	ErrMissingParameters = errors.New("missing parameters")
	// ErrInternalServerError indicates an error from Pesto's server.
	// Client should retry the request after a few seconds.
	ErrInternalServerError = errors.New("internal server error")
	// ErrEmptyToken indicates that token was empty during the
	// client creation.
	ErrEmptyToken = errors.New("empty token")
	// ErrMissingToken indicates that token was not sent during
	// HTTP request.
	ErrMissingToken = errors.New("missing token")
	// ErrTokenNotRegistered indicates that the provided token
	// is invalid or not registered on the Pesto's API.
	ErrTokenNotRegistered = errors.New("token not registered")
	// ErrTokenRevoked indicates the token was revoked from the Pesto's API.
	ErrTokenRevoked = errors.New("token revoked")
	// ErrMonthlyLimitExceeded indicates the token exceeds the monthly
	// quota request limit.
	ErrMonthlyLimitExceeded = errors.New("monthly limit exceeded")
	// ErrServerRateLimited indicates client got limited from sending burst
	// request to the server.
	ErrServerRateLimited = errors.New("server rate limited")
	// ErrRuntimeNotFound indicates the provided Language-Version combination
	// does not exists as a runtime on Pesto's API,
	ErrRuntimeNotFound = errors.New("runtime not found")
)
