package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	clientv3 "go.etcd.io/etcd/client/v3"
)

type Deps struct {
	Client *clientv3.Client
	Logger *sentry.Client
}

func main() {
	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "3000"
	}

	env, ok := os.LookupEnv("ENVIRONMENT")
	if !ok {
		env = "development"
	}

	sentryDsn, ok := os.LookupEnv("SENTRY_DSN")
	if !ok {
		sentryDsn = ""
	}

	etcdUrl, ok := os.LookupEnv("ETCD_URL")
	if !ok {
		etcdUrl = "localhost:2379"
	}

	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   strings.Split(etcdUrl, ","),
		DialTimeout: 30 * time.Second,
	})
	if err != nil {
		log.Fatalf("connect etcd error: %v", err)
	}
	defer func() {
		err := cli.Close()
		if err != nil {
			log.Printf("close etcd error: %v", err)
		}
	}()

	logger, err := sentry.NewClient(sentry.ClientOptions{
		Dsn:              sentryDsn,
		Debug:            env != "production",
		AttachStacktrace: true,
		Environment:      env,
	})
	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
	// Flush buffered events before the program terminates.
	defer logger.Flush(2 * time.Second)

	dependencies := &Deps{
		Logger: logger,
		Client: cli,
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/", dependencies.Authenticate)
	mux.HandleFunc("/healthz", dependencies.Healthz)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  10 * time.Second,
	}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, os.Kill)

	go func() {
		log.Printf("listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Println(err)
		}
	}()

	<-sig

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), time.Second*10)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatal(err)
	}
}
