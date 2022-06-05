package main

import (
	"context"
	"net/http"
	"time"
)

func (d *Deps) Healthz(w http.ResponseWriter, r *http.Request) {
	endpoints := d.Client.Endpoints()
	if len(endpoints) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	for _, endpoint := range endpoints {
		ctx, cancel := context.WithTimeout(r.Context(), time.Second*5)
		defer cancel()

		_, err := d.Client.Status(ctx, endpoint)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(err.Error()))
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
