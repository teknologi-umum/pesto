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

func TestClient_Execute(t *testing.T) {
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

		response, err := client.Execute(
			ctx,
			pesto.CodeRequest{
				Language:       "Python",
				Code:           "print('Hello World')",
				Version:        "3.10.2",
				CompileTimeout: time.Minute,
				RunTimeout:     time.Minute,
			},
		)
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if response.Language != "Python" {
			t.Errorf("expected response.Language to be 'Python', instead got %s", response.Language)
		}

		if response.Version != "3.10.2" {
			t.Errorf("expected response.Version to be '3.10.2', instead got %s", response.Version)
		}

		if response.Runtime.Stdout != "Hello World" {
			t.Errorf("exepcted response.Runtime.Stdout to be 'Hello World', instead got %s", response.Runtime.Stdout)
		}
	})

	t.Run("MissingParameters", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{
			Token:   token,
			BaseURL: happyMockServerURL,
		})
		if err != nil {
			t.Fatalf("creating client: %s", err.Error())
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		_, err = client.Execute(ctx, pesto.CodeRequest{})
		if err == nil {
			t.Errorf("expecting an error, instead got nil")
		}

		if !errors.Is(err, pesto.ErrMissingParameters) {
			t.Errorf("expecting an error of ErrMissingParameters, instead got %s", err.Error())
		}
	})

	t.Run("InvalidToken", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{
			Token:   "invalid-token",
			BaseURL: happyMockServerURL,
		})
		if err != nil {
			t.Fatalf("creating client: %s", err.Error())
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		_, err = client.Execute(ctx, pesto.CodeRequest{})
		if err == nil {
			t.Errorf("expecting an error, instead got nil")
		}

		if !errors.Is(err, pesto.ErrTokenNotRegistered) {
			t.Errorf("expecting an error of ErrTokenNotRegistered, instead got %s", err.Error())
		}
	})

	t.Run("RuntimeNotFound", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{
			Token:   token,
			BaseURL: happyMockServerURL,
		})
		if err != nil {
			t.Fatalf("creating client: %s", err.Error())
		}

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		_, err = client.Execute(
			ctx,
			pesto.CodeRequest{
				Language: pesto.LanguageLua,
				Code:     "print('Hello World')",
				Version:  pesto.VersionLua,
			},
		)
		if err == nil {
			t.Errorf("expecting an error, instead got nil")
		}

		if !errors.Is(err, pesto.ErrRuntimeNotFound) {
			t.Errorf("expecting an error of ErrRuntimeNotFound, instead got %s", err.Error())
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
			_, err := client.Execute(
				ctx,
				pesto.CodeRequest{
					Language: pesto.LanguagePython,
					Code:     "print('Hello World')",
					Version:  pesto.VersionPython,
				},
			)
			if err == nil {
				t.Errorf("expecting an error, instead got nil")
			}

			if !errors.Is(err, pesto.ErrMonthlyLimitExceeded) {
				t.Errorf("expecting an error of ErrMonthlyLimitExceeded, instead got %s", err.Error())
			}
		}

		_, err = client.Execute(
			ctx,
			pesto.CodeRequest{
				Language: pesto.LanguagePython,
				Code:     "print('Hello World')",
				Version:  pesto.VersionPython,
			},
		)
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

		response, err := client.Execute(
			ctx,
			pesto.CodeRequest{
				Language:       pesto.LanguagePython,
				Version:        pesto.VersionLatest,
				Code:           "print('Hello world!')",
				CompileTimeout: 0,
				RunTimeout:     0,
				MemoryLimit:    0,
			},
		)
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if response.Language != "Python" {
			t.Errorf("expecting response.Language to be 'Python', instead got %q", response.Language)
		}

		if response.Runtime.ExitCode != 0 {
			t.Errorf("expecting response.Runtime.ExitCode to be '0', instead got %q", response.Runtime.ExitCode)
		}

		if response.Runtime.Output != "Hello world!\n" {
			t.Errorf("expecting response.Runtime.Output to be 'Hello world\\n', instead got %q", response.Runtime.Output)
		}
	})
}

func ExampleClient_Execute() {
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

	response, err := client.Execute(
		ctx,
		pesto.CodeRequest{
			Language:       "Python",
			Code:           "print('Hello World')",
			Version:        "3.10.2",
			CompileTimeout: time.Minute,
			RunTimeout:     time.Minute,
		},
	)
	if err != nil {
		if errors.Is(err, pesto.ErrMissingParameters) {
			log.Fatalf("Your fault")
			return
		}

		if errors.Is(err, pesto.ErrRuntimeNotFound) {
			log.Fatalf("Sending a request to unknown runtime, refer to Pesto documentation")
			return
		}

		if errors.Is(err, pesto.ErrMonthlyLimitExceeded) {
			log.Fatalf("Wait until next month, or ask for more allowance")
			return
		}

		if errors.Is(err, pesto.ErrServerRateLimited) {
			log.Fatalf("Too many burst request to the server, implement a semaphore or similar to get around this")
			return
		}

		if errors.Is(err, pesto.ErrInternalServerError) {
			log.Fatalf("Our fault, please help by notifying us about the issue")
			return
		}

		log.Fatalf("unexpected error: %s", err.Error())
		return
	}

	log.Println(response.Runtime.Output)
}
