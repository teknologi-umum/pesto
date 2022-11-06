package pesto_test

import (
	"context"
	"errors"
	"log"
	"testing"
	"time"

	pesto "github.com/teknologi-umum/pesto/sdk/go"
)

func TestClient_ListRuntimes(t *testing.T) {
	t.Run("Happy", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{
			Token:   token,
			BaseURL: happyMockServerURL,
		})
		if err != nil {
			t.Fatalf("creating client: %s", err.Error())
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		response, err := client.ListRuntimes(ctx)
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if len(response.Runtime) != 1 {
			t.Errorf("expected runtime to have 1 value, got %d", len(response.Runtime))
		}
	})

	t.Run("RateLimited", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{
			Token:   token,
			BaseURL: rateLimitedMockServerURL,
		})
		if err != nil {
			t.Fatalf("creating client: %s", err.Error())
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		for i := 0; i < 3; i++ {
			_, err := client.ListRuntimes(ctx)
			if err == nil {
				t.Errorf("expecting an error, instead got nil")
			}

			if !errors.Is(err, pesto.ErrMonthlyLimitExceeded) {
				t.Errorf("expecting an error of ErrMonthlyLimitExceeded, instead got %s", err.Error())
			}
		}

		_, err = client.ListRuntimes(ctx)
		if err == nil {
			t.Errorf("expecting an error, instead got nil")
		}

		if !errors.Is(err, pesto.ErrServerRateLimited) {
			t.Errorf("expecting an error of ErrServerRateLimited, instead got %s", err.Error())
		}
	})
}

func ExampleClient_ListRuntimes() {
	client, err := pesto.NewClientWithConfig(pesto.Config{
		Token:   token,
		BaseURL: happyMockServerURL,
	})
	if err != nil {
		log.Fatalf("creating client: %s", err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	response, err := client.ListRuntimes(ctx)
	if err != nil {
		log.Fatalf("unexpected error: %s", err.Error())
		return
	}

	log.Println(response.Runtime)
}
