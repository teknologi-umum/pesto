package main_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAuthenticate_Method(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "/", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}

	rec := httptest.NewRecorder()

	deps.Authenticate(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected status code %d, got %d", http.StatusMethodNotAllowed, rec.Code)
	}
}

func TestAuthenticate_EmptyToken(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}

	rec := httptest.NewRecorder()

	deps.Authenticate(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status code %d, got %d", http.StatusUnauthorized, rec.Code)
	}

	if rec.Body.String() != "Token must be supplied" {
		t.Errorf("expected body %q, got %q", "Token must be supplied", rec.Body.String())
	}
}

func TestAuthenticate_NotRegistered(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("X-Pesto-Token", "not-registered")

	rec := httptest.NewRecorder()

	deps.Authenticate(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status code %d, got %d", http.StatusUnauthorized, rec.Code)
	}

	if rec.Body.String() != "Token not registered" {
		t.Errorf("expected body %q, got %q", "Token not registered", rec.Body.String())
	}
}

func TestAuthenticate_Ok(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("X-Pesto-Token", "foo")

	rec := httptest.NewRecorder()

	deps.Authenticate(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status code %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestAuthenticate_Revoked(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("X-Pesto-Token", "bar")

	rec := httptest.NewRecorder()

	deps.Authenticate(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status code %d, got %d", http.StatusUnauthorized, rec.Code)
	}

	if rec.Body.String() != "Token has been revoked" {
		t.Errorf("expected body %q, got %q", "Token has been revoked", rec.Body.String())
	}
}

func TestAuthenticate_InvalidValue(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "/", nil)
	if err != nil {
		t.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("X-Pesto-Token", "baz")

	rec := httptest.NewRecorder()

	deps.Authenticate(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("expected status code %d, got %d", http.StatusInternalServerError, rec.Code)
	}
}
