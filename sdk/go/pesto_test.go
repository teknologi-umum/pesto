package pesto_test

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	pesto "github.com/teknologi-umum/pesto/sdk/go"
)

var token = "testing-token"
var happyMockServerURL *url.URL

func TestMain(m *testing.M) {
	var err error

	happyMockServer := HappyMockServer()
	happyMockServerURL, err = url.Parse(happyMockServer.URL)
	if err != nil {
		log.Fatalf("parsing url: %s", err.Error())
	}

	exitCode := m.Run()

	happyMockServer.Close()

	os.Exit(exitCode)
}

func HappyMockServer() *httptest.Server {
	handler := http.NewServeMux()

	handler.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message":"OK"}`))
		w.WriteHeader(http.StatusOK)
	})

	handler.HandleFunc("/api/list-runtimes", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"runtime":[{"language":"Go","version":"1.18.2","aliases":["go","golang"],"compiled":true}]}`))
		w.WriteHeader(http.StatusOK)
	})

	handler.HandleFunc("/api/execute", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("X-Pesto-Token") == "" {
			if r.Header.Get("X-Pesto-Token") != token {
				w.Header().Set("Content-Type", "application/json")
				w.Write([]byte(`{"message":"Token must be supplied"}`))
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
		}

		if r.Header.Get("X-Pesto-Token") != token {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"message":"Token not registered"}`))
			w.WriteHeader(http.StatusUnauthorized)
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
			w.Write([]byte(`{"message":"Invalid body parameter: ` + err.Error() + `"}`))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if body.Language == "" || body.Code == "" || body.Version == "" {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"message":"Missing parameters"}`))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if body.Language != "Python" {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"message":"Runtime not found"}`))
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{
			"language": "Python",
			"version": "3.10.2",
			"compile": {
			  "stdout": "",
			  "stderr": ""
			  "output": ""
			  "exitCode": 0
			},
			"runtime": {
			  "stdout": "Hello World",
			  "stderr": ""
			  "output": "Hello World"
			  "exitCode": 0
			}
		  }`))
		w.WriteHeader(http.StatusOK)
	})

	return httptest.NewServer(handler)
}

func TestNewClient(t *testing.T) {
	t.Run("MissingToken", func(t *testing.T) {
		_, err := pesto.NewClient("")
		if err == nil {
			t.Errorf("expecting an error, got nil")
		}

		if !errors.Is(err, pesto.ErrEmptyToken) {
			t.Errorf("expecting error of ErrEmptyToken, got %s", err.Error())
		}
	})

	t.Run("Success", func(t *testing.T) {
		client, err := pesto.NewClient("some-token")
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if client == nil {
			t.Errorf("expected non-nil client, got nil")
		}
	})
}

func TestNewClientWithConfig(t *testing.T) {
	t.Run("EmptyToken", func(t *testing.T) {
		_, err := pesto.NewClientWithConfig(pesto.Config{})
		if err == nil {
			t.Errorf("expecting an error, got nil")
		}

		if !errors.Is(err, pesto.ErrEmptyToken) {
			t.Errorf("expecting error of ErrEmptyToken, got %s", err.Error())
		}
	})

	t.Run("TokenOnly", func(t *testing.T) {
		client, err := pesto.NewClientWithConfig(pesto.Config{Token: "some-token"})
		if err != nil {
			t.Errorf("unexpected error: %s", err.Error())
		}

		if client == nil {
			t.Errorf("expected non-nil client, got nil")
		}
	})
}
