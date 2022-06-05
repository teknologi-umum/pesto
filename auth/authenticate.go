package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/getsentry/sentry-go"
)

type TokenValue struct {
	UserEmail string `json:"user_email"`
	Revoked   bool   `json:"revoked"`
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
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	if resp.Count == 0 {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("Token not registered"))
		return
	}

	for _, kv := range resp.Kvs {
		var tokenValue TokenValue
		err := json.Unmarshal(kv.Value, &tokenValue)
		if err != nil {
			d.Logger.CaptureException(fmt.Errorf("unmarshal token value: %w", err), &sentry.EventHint{OriginalException: err, Request: r, Context: r.Context()}, nil)

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

	w.WriteHeader(http.StatusOK)
}
