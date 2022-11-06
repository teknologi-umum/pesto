package pesto_test

import (
	"errors"
	"log"
	"net/url"
	"os"
	"testing"

	pesto "github.com/teknologi-umum/pesto/sdk/go"
)

var token = "testing-token"
var happyMockServerURL *url.URL
var rateLimitedMockServerURL *url.URL

func TestMain(m *testing.M) {
	var err error

	happyMockServer := HappyMockServer()
	happyMockServerURL, err = url.Parse(happyMockServer.URL)
	if err != nil {
		log.Fatalf("parsing url: %s", err.Error())
	}

	rateLimitedMockServer := RateLimitedMockServer()
	rateLimitedMockServerURL, err = url.Parse(rateLimitedMockServer.URL)
	if err != nil {
		log.Fatalf("parsing url: %s", err.Error())
	}

	exitCode := m.Run()

	happyMockServer.Close()
	rateLimitedMockServer.Close()

	os.Exit(exitCode)
}

func TestNewClient(t *testing.T) {
	t.Run("MissingToken", func(t *testing.T) {
		_, err := pesto.NewClient("")
		if err == nil {
			t.Errorf("expecting an error, got nil")
		}

		if !errors.Is(err, pesto.ErrEmptyToken) {
			t.Errorf("expecting error of ErrEmptyToken, got %s", err.Error())
		}
	})

	t.Run("Success", func(t *testing.T) {
		client, err := pesto.NewClient("some-token")
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if client == nil {
			t.Errorf("expected non-nil client, got nil")
		}
	})
}

func TestNewClientWithConfig(t *testing.T) {
	t.Run("EmptyToken", func(t *testing.T) {
		_, err := pesto.NewClientWithConfig(pesto.Config{})
		if err == nil {
			t.Errorf("expecting an error, got nil")
		}

		if !errors.Is(err, pesto.ErrEmptyToken) {
			t.Errorf("expecting error of ErrEmptyToken, got %s", err.Error())
		}
	})

	t.Run("TokenOnly", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{Token: "some-token"})
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if client == nil {
			t.Errorf("expected non-nil client, got nil")
		}
	})
}
