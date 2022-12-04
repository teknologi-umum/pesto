package pesto_test

import (
	"context"
	"errors"
	"log"
	"os"
	"testing"
	"time"

	pesto "github.com/teknologi-umum/pesto/sdk/go"
)

func TestClient_Ping(t *testing.T) {
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

		response, err := client.Ping(ctx)
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if response.Message != "OK" {
			t.Errorf("expecting response.Message to be 'OK', instead got %s", response.Message)
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
			_, err := client.Ping(ctx)
			if err == nil {
				t.Errorf("expecting an error, instead got nil")
			}

			if !errors.Is(err, pesto.ErrMonthlyLimitExceeded) {
				t.Errorf("expecting an error of ErrMonthlyLimitExceeded, instead got %s", err.Error())
			}
		}

		_, err = client.Ping(ctx)
		if err == nil {
			t.Errorf("expecting an error, instead got nil")
		}

		if !errors.Is(err, pesto.ErrServerRateLimited) {
			t.Errorf("expecting an error of ErrServerRateLimited, instead got %s", err.Error())
		}
	})

	t.Run("RealAPI", func(t *testing.T) {
		if os.Getenv("PESTO_TOKEN") == "" {
			t.Skip("Skipped because PESTO_TOKEN environment variable is empty")
		}

		client, err := pesto.NewClient(os.Getenv("PESTO_TOKEN"))
		if err != nil {
			t.Fatalf("creating client: %s", err.Error())
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		response, err := client.Ping(ctx)
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if response.Message == "" {
			t.Errorf("expecting response.Message to not be empty")
		}
	})
}

func ExampleClient_Ping() {
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

	response, err := client.Ping(ctx)
	if err != nil {
		log.Fatalf("unexpected error: %s", err.Error())
		return
	}

	log.Println(response.Message)
}
