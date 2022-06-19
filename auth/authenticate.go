package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/getsentry/sentry-go"
)

type TokenValue struct {
	UserEmail    string `json:"user_email"`
	MonthlyLimit int64  `json:"monthly_limit"`
	Revoked      bool   `json:"revoked"`
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
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Token must be supplied"))
		return
	}

	// The token should be exists as a key on etcd
	ctx, cancel := context.WithTimeout(r.Context(), time.Second*10)
	defer cancel()

	resp, err := d.Client.KV.Get(ctx, token)
	if err != nil {
		d.Logger.CaptureException(
			fmt.Errorf("getting token %s: %w", token, err),
			&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
			nil,
		)

		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	if resp.Count == 0 {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Token not registered"))
		return
	}

	var tokenValue TokenValue
	for _, kv := range resp.Kvs {
		err := json.Unmarshal(kv.Value, &tokenValue)
		if err != nil {
			d.Logger.CaptureException(
				fmt.Errorf("unmarshal token value: %w", err),
				&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
				nil,
			)

			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		if tokenValue.Revoked {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Token has been revoked"))
			return
		}
	}

	// Acquire monthly counter limit
	formattedDate := time.Now().UTC().Format("2006-01")
	limitResp, err := d.Client.KV.Get(ctx, "counter/"+formattedDate+"/"+tokenValue.UserEmail)
	if err != nil {
		d.Logger.CaptureException(
			fmt.Errorf("getting counter %s: %w", "counter/"+formattedDate+"/"+tokenValue.UserEmail, err),
			&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
			nil,
		)

		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	var counterLimit int64
	for _, kv := range limitResp.Kvs {
		v, err := strconv.ParseInt(string(kv.Value), 10, 64)
		if err != nil {
			d.Logger.CaptureException(
				fmt.Errorf("parsing counter limit: %w", err),
				&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
				nil,
			)

			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}

		counterLimit += v
	}

	if counterLimit > tokenValue.MonthlyLimit {
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte("Monthly limit exceeded"))
		return
	}

	// Increment monthly counter
	go func(tokenValue TokenValue) {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		formattedDate := time.Now().UTC().Format("2006-01")

		_, err := d.Client.KV.Put(ctx, "counter/"+formattedDate+"/"+tokenValue.UserEmail, strconv.FormatInt(counterLimit+1, 10))
		if err != nil {
			d.Logger.CaptureException(
				fmt.Errorf("putting counter %s: %w", "counter/"+formattedDate+"/"+tokenValue.UserEmail, err),
				&sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()},
				nil,
			)

			log.Printf("error incrementing monthly counter: %v", err)
		}
	}(tokenValue)

	w.WriteHeader(http.StatusOK)
}
