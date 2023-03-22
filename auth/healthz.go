package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/getsentry/sentry-go"
)

func (d *Deps) Healthz(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second*5)
	defer cancel()

	_, err := d.Client.Ping(ctx).Result()
	if err != nil {
		d.Console.ErrorWith(err.Error()).String("endpoint", "healthz")
		sentry.GetHubFromContext(r.Context()).CaptureException(fmt.Errorf("healthz error: %w", err))

		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(err.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
