package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/go-redis/redis/v9"
)

type TokenValue struct {
	UserEmail    string `json:"UserEmail"`
	MonthlyLimit int64  `json:"MonthlyLimit"`
	Revoked      bool   `json:"Revoked"`
}

var ErrTokenNotRegistered = errors.New("token not registered")

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

	// The token should be existed as a key on redis
	ctx, cancel := context.WithTimeout(r.Context(), time.Second*10)
	defer cancel()

	tokenValue, err := d.acquireTokenValue(ctx, token)
	if err != nil {
		if errors.Is(err, ErrTokenNotRegistered) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"message":"Token not registered"}`))
			return
		}

		d.Console.Error(err.Error())
		sentry.GetHubFromContext(r.Context()).CaptureException(err)

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
	counterLimit, err := d.acquireCounterLimit(ctx, tokenValue)
	if err != nil {
		d.Console.Error(err.Error())
		sentry.GetHubFromContext(r.Context()).CaptureException(err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":` + strconv.Quote(err.Error()) + "}"))
		return
	}

	if counterLimit > tokenValue.MonthlyLimit {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"message":"Monthly limit exceeded"}`))
		return
	}

	// Increment monthly counter
	go d.incrementMonthlyCounter(r.Context(), tokenValue, counterLimit)

	w.WriteHeader(http.StatusOK)
}

func (d *Deps) acquireTokenValue(ctx context.Context, token string) (TokenValue, error) {
	span := sentry.StartSpan(ctx, "authenticate.acquire_token_value")
	defer span.Finish()

	resp, err := d.Client.Get(ctx, token).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return TokenValue{}, ErrTokenNotRegistered
		}

		return TokenValue{}, err
	}

	var tokenValue TokenValue
	err = json.Unmarshal([]byte(resp), &tokenValue)
	if err != nil {
		return TokenValue{}, err
	}

	return tokenValue, nil
}

func (d *Deps) acquireCounterLimit(ctx context.Context, tokenValue TokenValue) (int64, error) {
	span := sentry.StartSpan(ctx, "authenticate.acquire_counter_limit")
	defer span.Finish()

	formattedDate := time.Now().UTC().Format("2006-01")
	limitResp, err := d.Client.Get(ctx, "counter/"+formattedDate+"/"+tokenValue.UserEmail).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		return 0, fmt.Errorf("getting counter %s: %w", "counter/"+formattedDate+"/"+tokenValue.UserEmail, err)
	}

	if errors.Is(err, redis.Nil) {
		limitResp = "0"
	}

	var counterLimit int64
	v, err := strconv.ParseInt(limitResp, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("parsing counter limit: %w", err)
	}

	counterLimit += v

	return counterLimit, nil
}

func (d *Deps) incrementMonthlyCounter(ctx context.Context, tokenValue TokenValue, counterLimit int64) {
	span := sentry.StartSpan(ctx, "authenticate.increase_limit")
	defer span.Finish()

	// Do nothing if user email contains the secret/testing user.
	if strings.HasPrefix(tokenValue.UserEmail, "trial") && strings.HasSuffix(tokenValue.UserEmail, "@pesto.teknologiumum.com") {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	formattedDate := time.Now().UTC().Format("2006-01")

	_, err := d.Client.Set(ctx, "counter/"+formattedDate+"/"+tokenValue.UserEmail, strconv.FormatInt(counterLimit+1, 10), time.Hour*24*40).Result()
	if err != nil {
		d.Console.Error(err.Error())
		sentry.GetHubFromContext(ctx).CaptureException(fmt.Errorf("putting counter %s: %w", "counter/"+formattedDate+"/"+tokenValue.UserEmail, err))

		log.Printf("error incrementing monthly counter: %v", err)
	}
}
