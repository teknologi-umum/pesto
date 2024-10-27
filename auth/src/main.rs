use std::env;
use std::error::Error;
use std::fmt::{Debug, Display, Formatter};

use axum::extract::State;
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::any;
use axum::{routing::get, Router};
use redis::{AsyncCommands, Client, RedisError, RedisResult};
use sentry::metrics::Metric;
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

#[tracing::instrument]
async fn authenticate<Command: AsyncCommands>(
    headers: HeaderMap,
    State(mut auth_repo): State<AuthRepo<Command>>,
) -> impl IntoResponse {
    let token_value = match headers
        .get("X-Pesto-Token")
        .and_then(|v| v.to_str().ok())
        .map(String::from)
    {
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Token must be supplied"}"#,
            );
        }
        Some(token) => match auth_repo.acquire_token_value(token).await {
            Ok(token_value) => token_value,
            Err(AuthError::TokenNotRegistered) => {
                return (
                    StatusCode::UNAUTHORIZED,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"Token not registered"}"#,
                );
            }
            Err(AuthError::FailedToAcquireToken(_)) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"Internal server error"}"#,
                );
            }
            Err(AuthError::ParseError) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"Internal server error"}"#,
                );
            }
        },
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
        Err(_) => {
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

    if auth_repo
        .increment_monthly_counter(&token_value, counter_limit)
        .await
        .is_err()
    {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Internal server error"}"#,
        );
    }

    Metric::count("pesto.successful_auth")
        .with_tag("user_email", token_value.user_email.clone())
        .send();
    (StatusCode::OK, [(header::CONTENT_TYPE, "text/plain")], "")
}

enum AuthError {
    TokenNotRegistered,
    FailedToAcquireToken(RedisError),
    ParseError,
}

impl Display for AuthError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::TokenNotRegistered => write!(f, "Token not registered"),
            AuthError::FailedToAcquireToken(e) => write!(f, "Failed to acquire token: {}", e),
            AuthError::ParseError => write!(f, "Parse error"),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
struct TokenValue {
    #[serde(rename = "UserEmail")]
    user_email: String,
    #[serde(rename = "MonthlyLimit")]
    monthly_limit: i64,
    #[serde(rename = "Revoked")]
    revoked: bool,
}

#[derive(Clone)]
struct AuthRepo<Command: AsyncCommands> {
    pub redis_client: Command,
}

impl<Command: AsyncCommands> Debug for AuthRepo<Command> {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "AuthRepo")
    }
}

impl<Command: AsyncCommands> AuthRepo<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    #[tracing::instrument]
    async fn acquire_token_value(&mut self, token: String) -> Result<TokenValue, AuthError> {
        // Acquire redis value from the key from the `token` parameter
        let token_value: RedisResult<Option<String>> = self.redis_client.get(token).await;

        match token_value {
            Ok(Some(value)) => {
                let token_value: TokenValue =
                    serde_json::from_str(&value).map_err(|_| AuthError::ParseError)?;
                Ok(token_value)
            }
            Ok(None) => Err(AuthError::TokenNotRegistered),
            Err(redis_error) => {
                sentry::capture_error(&redis_error);
                Err(AuthError::FailedToAcquireToken(redis_error))
            }
        }
    }

    #[tracing::instrument]
    async fn acquire_counter_limit(&mut self, token_value: &TokenValue) -> Result<i64, AuthError> {
        let formatted_date = chrono::Utc::now().format("%Y-%m").to_string();
        let key = format!("counter/{}/{}", formatted_date, token_value.user_email);
        let value: RedisResult<Option<String>> = self.redis_client.get(key).await;

        match value {
            Ok(Some(value)) => {
                let counter_limit: i64 = value.parse().map_err(|_| AuthError::ParseError)?;
                Ok(counter_limit)
            }
            Ok(None) => Ok(0),
            Err(redis_error) => {
                sentry::capture_error(&redis_error);
                Err(AuthError::FailedToAcquireToken(redis_error))
            }
        }
    }

    #[tracing::instrument]
    async fn increment_monthly_counter(
        &mut self,
        token_value: &TokenValue,
        counter_limit: i64,
    ) -> Result<(), AuthError> {
        if token_value.user_email.to_lowercase().starts_with("trial")
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
            Err(redis_error) => {
                sentry::capture_error(&redis_error);
                Err(AuthError::FailedToAcquireToken(redis_error))
            }
        }
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    tracing_subscriber::registry::Registry::default()
        .with(sentry::integrations::tracing::layer())
        .init();

    let _guard = sentry::init((
        env::var("SENTRY_DSN").unwrap_or_default(),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            sample_rate: env::var("SENTRY_SAMPLE_RATE").unwrap_or(String::from("1.0")).parse()?,
            traces_sample_rate: env::var("SENTRY_TRACES_SAMPLE_RATE").unwrap_or(String::from("0.5")).parse()?, 
            ..Default::default()
        },
    ));

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let redis_client = Client::open(
                env::var("REDIS_URL").unwrap_or("redis://@localhost:6379".to_string()),
            )
            .unwrap();
            let redis_async_connection = redis_client
                .get_multiplexed_async_connection()
                .await
                .unwrap();
            let auth_repo = AuthRepo::new(redis_async_connection);

            let app = Router::new()
                .route("/healthz", get(healthcheck))
                .route("/", any(authenticate))
                .with_state(auth_repo);

            let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
            axum::serve(listener, app).await.unwrap();
        });

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_value_serialization() {
        let token_value = TokenValue {
            user_email: "johndoe@example.com".to_string(),
            monthly_limit: 100,
            revoked: false,
        };

        let serialized = serde_json::to_string(&token_value).unwrap();
        let deserialized: TokenValue = serde_json::from_str(&serialized).unwrap();
        
        assert_eq!(serialized, r#"{"UserEmail":"johndoe@example.com","MonthlyLimit":100,"Revoked":false}"#);
        assert_eq!(token_value, deserialized);
    }
}