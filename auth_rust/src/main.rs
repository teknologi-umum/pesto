use axum::extract::State;
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::any;
use axum::{routing::get, Router};
use redis::{AsyncCommands, Client};
use std::error::Error;
use std::fmt::{Display, Formatter};
use tokio::net::TcpListener;

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

async fn authenticate<Command: AsyncCommands>(
    headers: HeaderMap,
    State(auth_repo): State<AuthRepo<Command>>,
) -> impl IntoResponse {
    match headers.get("X-Pesto-Token") {
        Some(token) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"OK}"#,
        ),
        None => (
            StatusCode::UNAUTHORIZED,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Token must be supplied"}"#,
        ),
    }
}

enum AuthError {
    TokenNotRegistered,
}

impl Display for AuthError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            AuthError::TokenNotRegistered => write!(f, "Token not registered"),
        }
    }
}

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

    fn acquire_token_value(&self, token: &str) -> Result<TokenValue, AuthError> {
        todo!()
    }

    fn acquire_counter_limit(&self, token_value: &TokenValue) -> Result<i64, AuthError> {
        todo!()
    }

    fn increment_monthly_counter(
        &self,
        token_value: &TokenValue,
        counter_limit: i64,
    ) -> Result<(), AuthError> {
        todo!()
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let redis_client = Client::open("redis://@localhost:6739")?;
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
