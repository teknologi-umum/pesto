package main_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/getsentry/sentry-go"
)

func TestHealthz(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	ctx = sentry.SetHubOnContext(ctx, sentry.CurrentHub())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/healthz", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}

	rec := httptest.NewRecorder()

	deps.Healthz(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status code %d, got %d", http.StatusOK, rec.Code)
	}
}
