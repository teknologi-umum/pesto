package pesto_test

import (
	"context"
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
}
