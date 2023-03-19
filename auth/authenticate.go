package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/go-redis/redis/v9"
)

type TokenValue struct {
	UserEmail    string `json:"UserEmail"`
	MonthlyLimit int64  `json:"MonthlyLimit"`
	Revoked      bool   `json:"Revoked"`
}

func (d *Deps) Authenticate(w http.ResponseWriter, r *http.Request) {
	// Terminate if the request is not a GET
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Acquire X-Pesto-Token from header
	token := r.Header.Get("X-Pesto-Token")
	if token == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"message":"Token must be supplied"}`))
		return
	}

	// The token should be exists as a key on redis
	ctx, cancel := context.WithTimeout(r.Context(), time.Second*10)
	defer cancel()

	resp, err := d.Client.Get(ctx, token).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"message":"Token not registered"}`))
			return
		}

		d.Console.Error(err.Error())
		d.Sentry.CaptureException(
			fmt.Errorf("getting token %s: %w", token, err),
			&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
			nil,
		)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":` + strconv.Quote(err.Error()) + "}"))
		return
	}

	var tokenValue TokenValue
	err = json.Unmarshal([]byte(resp), &tokenValue)
	if err != nil {
		d.Console.Error(err.Error())
		d.Sentry.CaptureException(
			fmt.Errorf("unmarshal token value: %w", err),
			&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
			nil,
		)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":` + strconv.Quote(err.Error()) + "}"))
		return
	}

	if tokenValue.Revoked {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"message":"Token has been revoked"}`))
		return
	}

	// Acquire monthly counter limit
	formattedDate := time.Now().UTC().Format("2006-01")
	limitResp, err := d.Client.Get(ctx, "counter/"+formattedDate+"/"+tokenValue.UserEmail).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		d.Console.Error(err.Error())
		d.Sentry.CaptureException(
			fmt.Errorf("getting counter %s: %w", "counter/"+formattedDate+"/"+tokenValue.UserEmail, err),
			&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
			nil,
		)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":` + strconv.Quote(err.Error()) + "}"))
		return
	}

	if errors.Is(err, redis.Nil) {
		limitResp = "0"
	}

	var counterLimit int64
	v, err := strconv.ParseInt(limitResp, 10, 64)
	if err != nil {
		d.Console.Error(err.Error())
		d.Sentry.CaptureException(
			fmt.Errorf("parsing counter limit: %w", err),
			&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
			nil,
		)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":` + strconv.Quote(err.Error()) + "}"))
		return
	}

	counterLimit += v

	if counterLimit > tokenValue.MonthlyLimit {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"message":"Monthly limit exceeded"}`))
		return
	}

	// Increment monthly counter
	go func(tokenValue TokenValue) {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		formattedDate := time.Now().UTC().Format("2006-01")

		_, err := d.Client.Set(ctx, "counter/"+formattedDate+"/"+tokenValue.UserEmail, strconv.FormatInt(counterLimit+1, 10), time.Hour*24*40).Result()
		if err != nil {
			d.Console.Error(err.Error())
			d.Sentry.CaptureException(
				fmt.Errorf("putting counter %s: %w", "counter/"+formattedDate+"/"+tokenValue.UserEmail, err),
				&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
				nil,
			)

			log.Printf("error incrementing monthly counter: %v", err)
		}
	}(tokenValue)

	w.WriteHeader(http.StatusOK)
}
