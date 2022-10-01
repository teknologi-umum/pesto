package main_test

import (
	main "auth"
	"context"
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/go-redis/redis/v9"
)

var deps *main.Deps

func TestMain(m *testing.M) {
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

	_, err := deps.Client.Set(ctx, "foo", `{"user_email":"foo@example.com","revoked":false}`, redis.KeepTTL).Result()
	if err != nil {
		return fmt.Errorf("failed to seed etcd: %v", err)
	}

	_, err = deps.Client.Set(ctx, "bar", `{"user_email":"bar@example.com","revoked":true}`, redis.KeepTTL).Result()
	if err != nil {
		return fmt.Errorf("failed to seed etcd: %v", err)
	}

	_, err = deps.Client.Set(ctx, "baz", `{user_email:"baz@example.com","ugla_baga":"baka!"`, redis.KeepTTL).Result()
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
		_, err := deps.Client.Del(ctx, token).Result()
		if err != nil {
			return fmt.Errorf("failed to cleanup etcd: %v", err)
		}
	}

	return nil
}
