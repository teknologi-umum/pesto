use std::collections::HashMap;
use std::env;
use std::error::Error;
use std::fmt::{Display, Formatter};

use axum::{Router, routing::get};
use axum::extract::State;
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::any;
use opentelemetry::{global, trace::Tracer};
use opentelemetry::trace::{SpanKind, TracerProvider};
use opentelemetry_otlp::WithExportConfig;
use redis::{AsyncCommands, Client, RedisResult};
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

async fn authenticate<Command: AsyncCommands>(
    headers: HeaderMap,
    State(mut auth_repo): State<AuthRepo<Command>>,
) -> impl IntoResponse {
    let tracer = global::tracer("pesto-auth-rust-service");

    let mut span = tracer.span_builder("GET /").with_kind(SpanKind::Server).start(&tracer);

    if headers.get("X-Pesto-Token").is_none() {
        return (
            StatusCode::UNAUTHORIZED,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Token must be supplied"}"#,
        );
    }

    let token: String = headers.get("X-Pesto-Token").unwrap().to_str().unwrap().to_string();
    let token_value = match auth_repo.acquire_token_value(token).await {
        Ok(token_value) => token_value,
        Err(AuthError::TokenNotRegistered) => {
            return (
                StatusCode::UNAUTHORIZED,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Token not registered"}"#,
            );
        }
        Err(AuthError::FailedToAcquireToken(e)) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal server error"}"#,
            );
        }
    };

    if token_value.revoked {
        return (
            StatusCode::UNAUTHORIZED,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Token has been revoked"}"#,
        );
    }

    let counter_limit = match auth_repo.acquire_counter_limit(&token_value).await {
        Ok(counter_limit) => counter_limit,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal server error"}"#,
            );
        }
    };

    if counter_limit > token_value.monthly_limit {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Monthly limit exceeded"}"#,
        );
    }

    match auth_repo.increment_monthly_counter(&token_value, counter_limit).await {
        Ok(_) => (),
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal server error"}"#,
            );
        }
    }

    (StatusCode::OK, [(header::CONTENT_TYPE, "text/plain")], "")
}

enum AuthError {
    TokenNotRegistered,
    FailedToAcquireToken(Box<dyn Error>),
}

impl Display for AuthError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::TokenNotRegistered => write!(f, "Token not registered"),
            AuthError::FailedToAcquireToken(e) => write!(f, "Failed to acquire token: {}", e),
        }
    }
}

#[derive(Deserialize, Serialize, Clone)]
struct TokenValue {
    user_email: String,
    monthly_limit: i64,
    revoked: bool,
}

#[derive(Clone)]
struct AuthRepo<Command: AsyncCommands> {
    pub redis_client: Command,
}

impl<Command: AsyncCommands> AuthRepo<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    async fn acquire_token_value(&mut self, token: String) -> Result<TokenValue, AuthError> {
        let tracer = global::tracer("pesto-auth-rust-service");
        let mut span = tracer.start("acquire_token_value");

        // Acquire redis value from the key from the `token` parameter
        let token_value: RedisResult<Option<String>> = self.redis_client.get(token).await;

        match token_value {
            Ok(Some(value)) => {
                let token_value: TokenValue = serde_json::from_str(&value).unwrap();
                Ok(token_value)
            }
            Ok(None) => Err(AuthError::TokenNotRegistered),
            Err(redis_error) => Err(AuthError::FailedToAcquireToken(Box::new(redis_error))),
        }
    }

    async fn acquire_counter_limit(&mut self, token_value: &TokenValue) -> Result<i64, AuthError> {
        let tracer = global::tracer("pesto-auth-rust-service");
        let mut span = tracer.start("acquire_counter_limit");

        let formatted_date = chrono::Utc::now().format("%Y-%m").to_string();
        let key = format!("counter/{}/{}", formatted_date, token_value.user_email);
        let value: RedisResult<Option<String>> = self.redis_client.get(key).await;

        match value {
            Ok(Some(value)) => {
                let counter_limit: i64 = value.parse().unwrap();
                Ok(counter_limit)
            }
            Ok(None) => Ok(0),
            Err(redis_error) => Err(AuthError::FailedToAcquireToken(Box::new(redis_error))),
        }
    }

    async fn increment_monthly_counter(
        &mut self,
        token_value: &TokenValue,
        counter_limit: i64,
    ) -> Result<(), AuthError> {
        let tracer = global::tracer("pesto-auth-rust-service");
        let mut span = tracer.start("acquire_token_value");

        if token_value.user_email.starts_with("trial")
            && token_value.user_email.ends_with("@pesto.teknologiumum.com")
        {
            return Ok(());
        }

        let formatted_date = chrono::Utc::now().format("%Y-%m").to_string();

        let key = format!("counter/{}/{}", formatted_date, token_value.user_email);
        let value = (counter_limit + 1).to_string();
        let expiration: u64 = 60 * 60 * 24 * 40; // 40 days
        let cmd: RedisResult<()> = self.redis_client.set_ex(key, value, expiration).await;
        match cmd {
            Ok(_) => Ok(()),
            Err(_) => Err(AuthError::TokenNotRegistered),
        }
    }
}

fn init_tracer() {
    match opentelemetry_otlp::new_exporter()
        .http()
        .with_endpoint(env::var("OTEL_HTTP_ENDPOINT").unwrap_or("".to_string()))
        .with_headers(HashMap::from_iter(vec![(String::from("x-api-key"), env::var("BASELIME_API_KEY").unwrap_or("".to_string()))].into_iter()))
        .build_span_exporter() {
        Ok(oltp_span_exporter) => {
            let provider = opentelemetry_sdk::trace::TracerProvider::builder()
                .with_simple_exporter(oltp_span_exporter)
                .build();

            global::set_tracer_provider(provider);
        },
        Err(error) => {
            println!("{}", error);
            let stdout_span_exporter = opentelemetry_stdout::SpanExporter::default();

            let provider = opentelemetry_sdk::trace::TracerProvider::builder()
                .with_simple_exporter(stdout_span_exporter)
                .build();

            global::set_tracer_provider(provider);
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    init_tracer();
    let redis_client = Client::open("redis://@localhost:6379")?;
    let redis_async_connection = redis_client.get_multiplexed_async_connection().await?;
    let auth_repo = AuthRepo::new(redis_async_connection);

    let app = Router::new()
        .route("/healthz", get(healthcheck))
        .route("/", any(authenticate))
        .with_state(auth_repo);

    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
