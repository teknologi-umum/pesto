use axum::extract::State;
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::any;
use axum::{routing::get, Router};
use redis::aio::MultiplexedConnection;
use redis::{AsyncCommands, Client};
use std::error::Error;
use std::fmt::{Display, Formatter};
use std::sync::Arc;
use tokio::net::TcpListener;

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

async fn authenticate<Command: AsyncCommands>(
    headers: HeaderMap,
    State(auth_repo): State<AuthRepo<Command>>, // auth_repo: AuthRepo<Command>,
) -> impl IntoResponse {
    if let Some(token) = headers.get("X-Pesto-Token") {
        todo!();
        return (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"OK\}"#,
        );
    } else {
        return (
            StatusCode::UNAUTHORIZED,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Token must be supplied"}"#,
        );
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
    pub redis_client: Arc<Command>,
}

impl<Command: AsyncCommands> AuthRepo<Command> {
    fn new(redis_client: Arc<Command>) -> Self {
        return AuthRepo { redis_client };
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let redis_client = Client::open("redis://@localhost:6739")?;
    let redis_async_connection = redis_client.get_multiplexed_async_connection().await?;
    let rc_client = Arc::new(redis_async_connection);
    let auth_repo = AuthRepo::new(rc_client);

    let app = Router::new()
        .route("/healthz", get(healthcheck))
        .route("/", any(authenticate::<MultiplexedConnection>))
        .with_state(auth_repo);

    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
