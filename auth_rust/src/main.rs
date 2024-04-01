use std::error::Error;
use std::fmt::{Display, Formatter};
use std::rc::Rc;
use axum::{Router, routing::{any, get}};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse};
use redis::{AsyncCommands, Client, Commands};
use tokio::net::TcpListener;

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

async fn authenticate<R>(headers: HeaderMap) -> impl IntoResponse {
    if let Some(token) = headers.get("X-Pesto-Token") {
        todo!();
        return (StatusCode::OK, [(header::CONTENT_TYPE, "application/json")], "{\"message\":\"OK\"}");
    } else {
        return (
            StatusCode::UNAUTHORIZED,
            [(header::CONTENT_TYPE, "application/json")],
           "{\"message\":\"Token must be supplied\"}",
        );
    }
}

enum AuthError {
    TokenNotRegistered
}

impl Display for AuthError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::TokenNotRegistered => write!(f, "Token not registered")
        }
    }
}

struct TokenValue {
    user_email: String,
    monthly_limit: i64,
    revoked: bool,
}

trait AuthRepo {
    fn acquire_token_value(&self, token: String) -> Result<TokenValue, AuthError>;
    fn acquire_counter_limit(&self, token_value: TokenValue) -> Result<i64, AuthError>;
    fn increment_monthly_counter(&self, token_value: TokenValue, counter_limit: i64) -> Result<(), AuthError>;
}

// Before you say anything, yes I don't have time to think of the correct naming
// We'll just do it Java-like.
#[derive(Clone)]
struct AuthRepoImpl {
    pub redis_client: Rc<Box<dyn AsyncCommands>>,
}

impl AuthRepoImpl {
    fn new(redis_client: Rc<Box<dyn AsyncCommands>>) -> Self {
        return AuthRepoImpl{ redis_client }
    }
}

impl AuthRepo for AuthRepoImpl {
    fn acquire_token_value(&self, token: String) -> Result<TokenValue, AuthError> {
        todo!()
    }

    fn acquire_counter_limit(&self, token_value: TokenValue) -> Result<i64, AuthError> {
        todo!()
    }

    fn increment_monthly_counter(&self, token_value: TokenValue, counter_limit: i64) -> Result<(), AuthError> {
        todo!()
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let redis_client = Client::open("redis://@localhost:6739")?;
    let redis_async_connection = redis_client.get_multiplexed_async_connection().await?;
    let rc_client = Rc::new(Box::new(redis_async_connection) as Box<dyn AsyncCommands + Send + Sync>);
    let app = Router::new()
        .route("/healthz", get(healthcheck))
        .route("/", any(authenticate))
        .with_state(rc_client);


    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
