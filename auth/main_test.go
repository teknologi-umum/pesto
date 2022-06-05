package main_test

import (
	main "auth"
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/getsentry/sentry-go"
	clientv3 "go.etcd.io/etcd/client/v3"
)

var deps *main.Deps

func TestMain(m *testing.M) {
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

	logger, err := sentry.NewClient(sentry.ClientOptions{
		Dsn:   sentryDsn,
		Debug: false,
	})
	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}

	deps = &main.Deps{
		Logger: logger,
		Client: cli,
	}

	err = seed()
	if err != nil {
		log.Fatalf("seed error: %v", err)
	}

	exitCode := m.Run()

	err = cleanup()
	if err != nil {
		log.Printf("cleanup error: %v", err)
	}

	err = cli.Close()
	if err != nil {
		log.Printf("close etcd error: %v", err)
	}

	os.Exit(exitCode)
}

func seed() error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	_, err := deps.Client.KV.Put(ctx, "foo", `{"user_email":"foo@example.com","revoked":false}`)
	if err != nil {
		return fmt.Errorf("failed to seed etcd: %v", err)
	}

	_, err = deps.Client.KV.Put(ctx, "bar", `{"user_email":"bar@example.com","revoked":true}`)
	if err != nil {
		return fmt.Errorf("failed to seed etcd: %v", err)
	}

	_, err = deps.Client.KV.Put(ctx, "baz", `{user_email:"baz@example.com","ugla_baga":"baka!"`)
	if err != nil {
		return fmt.Errorf("failed to seed etcd: %v", err)
	}

	return nil
}

func cleanup() error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	tokens := []string{"foo", "bar", "baz"}
	for _, token := range tokens {
		_, err := deps.Client.KV.Delete(ctx, token)
		if err != nil {
			return fmt.Errorf("failed to cleanup etcd: %v", err)
		}
	}

	return nil
}
