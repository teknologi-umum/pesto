package pesto_test

import (
	"context"
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
}
