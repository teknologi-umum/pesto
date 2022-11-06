package pesto_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
)

func HappyMockServer() *httptest.Server {
	handler := http.NewServeMux()

	handler.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"OK"}`))
	})

	handler.HandleFunc("/api/list-runtimes", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"runtime":[{"language":"Go","version":"1.18.2","aliases":["go","golang"],"compiled":true}]}`))
	})

	handler.HandleFunc("/api/execute", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("X-Pesto-Token") == "" {
			if r.Header.Get("X-Pesto-Token") != token {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"message":"Token must be supplied"}`))
				return
			}
		}

		if r.Header.Get("X-Pesto-Token") != token {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"message":"Token not registered"}`))
			return
		}

		type requestBody struct {
			Language       string `json:"language"`
			Version        string `json:"version"`
			Code           string `json:"code"`
			CompileTimeout int32  `json:"compileTimeout,omitempty"`
			RunTimeout     int32  `json:"runTimeout,omitempty"`
			MemoryLimit    int32  `json:"memoryLimit,omitempty"`
		}

		var body requestBody
		err := json.NewDecoder(r.Body).Decode(&body)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"message":"Invalid body parameter: ` + err.Error() + `"}`))
			return
		}

		if body.Language == "" || body.Code == "" || body.Version == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"message":"Missing parameters"}`))
			return
		}

		if body.Language != "Python" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"message":"Runtime not found"}`))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
			"language": "Python",
			"version": "3.10.2",
			"compile": {
			  "stdout": "",
			  "stderr": "",
			  "output": "",
			  "exitCode": 0
			},
			"runtime": {
			  "stdout": "Hello World",
			  "stderr": "",
			  "output": "Hello World",
			  "exitCode": 0
			}
		  }`))
	})

	return httptest.NewServer(handler)
}

func RateLimitedMockServer() *httptest.Server {
	rateLimiter := sync.Map{}

	handler := http.NewServeMux()

	handler.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		v, ok := rateLimiter.Load("ping")
		if !ok {
			rateLimiter.Store("ping", int(1))
			v = int(1)
		}

		if v.(int) > 3 {
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte("Too many request"))
			return
		}

		rateLimiter.Store("ping", v.(int)+1)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"message":"Monthly limit exceeded"}`))
	})
	handler.HandleFunc("/api/list-runtimes", func(w http.ResponseWriter, r *http.Request) {
		v, ok := rateLimiter.Load("list-runtimes")
		if !ok {
			rateLimiter.Store("list-runtimes", int(1))
			v = int(1)
		}

		if v.(int) > 3 {
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte("Too many request"))
			return
		}

		rateLimiter.Store("list-runtimes", v.(int)+1)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"message":"Monthly limit exceeded"}`))
	})
	handler.HandleFunc("/api/execute", func(w http.ResponseWriter, r *http.Request) {
		v, ok := rateLimiter.Load("execute")
		if !ok {
			rateLimiter.Store("execute", int(1))
			v = int(1)
		}

		if v.(int) > 3 {
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte("Too many request"))
			return
		}

		rateLimiter.Store("execute", v.(int)+1)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		w.Write([]byte(`{"message":"Monthly limit exceeded"}`))
	})

	return httptest.NewServer(handler)
}
