package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/francoispqt/onelog"
	"github.com/getsentry/sentry-go"
	"github.com/go-redis/redis/v9"
)

type Deps struct {
	Client  *redis.Client
	Sentry  *sentry.Client
	Console *onelog.Logger
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

	redisUrl, ok := os.LookupEnv("REDIS_URL")
	if !ok {
		redisUrl = "redis://@localhost:6379"
	}

	parsedRedisConfig, err := redis.ParseURL(redisUrl)
	if err != nil {
		log.Fatalf("parsing redis url to config: %v", err)
	}

	cli := redis.NewClient(parsedRedisConfig)
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
		Sentry:  logger,
		Client:  cli,
		Console: onelog.New(os.Stdout, onelog.ALL),
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
	signal.Notify(sig, os.Interrupt)

	go func() {
		log.Printf("listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Println(err)
		}
	}()

	<-sig

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), time.Second*30)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatal(err)
	}
}
