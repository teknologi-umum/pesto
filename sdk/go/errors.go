package pesto

import "errors"

var (
	ErrMissingParameters    = errors.New("missing parameters")
	ErrInternalServerError  = errors.New("internal server error")
	ErrEmptyToken           = errors.New("empty token")
	ErrMissingToken         = errors.New("missing token")
	ErrTokenNotRegistered   = errors.New("token not registered")
	ErrTokenRevoked         = errors.New("token revoked")
	ErrMonthlyLimitExceeded = errors.New("monthly limit exceeded")
	ErrServerRateLimited    = errors.New("server rate limited")
	ErrRuntimeNotFound      = errors.New("runtime not found")
)
