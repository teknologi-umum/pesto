use std::{env, fmt};
use std::error::Error;
use std::fmt::{Display, Formatter};
use axum::{Router, routing::get};
use axum::extract::State;
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::IntoResponse;
use axum::routing::any;
use redis::{Client, RedisError, AsyncCommands};
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

enum PestoError {
    UserNotFound,
    EmailAlreadyExists,
    RedisError(RedisError),
}

impl Display for PestoError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            PestoError::UserNotFound => write!(f, "User not found"),
            PestoError::EmailAlreadyExists => write!(f, "Email already exists"),
            PestoError::RedisError(e) => write!(f, "Redis error: {}", e),
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct HumanUser {
    name: String,
    email: String,
    building: Option<String>,
    calls: i64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct TokenValue {
    user_email: String,
    monthly_limit: i64,
    revoked: bool,
}

#[derive(Clone)]
struct WaitingListService<Command: AsyncCommands> {
    pub redis_client: Command,
}

impl<Command: AsyncCommands> WaitingListService<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    fn put_user_in_waiting_list(human_user: HumanUser) -> Result<(), PestoError> {
        todo!()
    }

    fn get_users() -> Result<Vec<HumanUser>, PestoError> {
        todo!()
    }

    fn remove_user(human_user: HumanUser) -> Result<(), PestoError> {
        todo!()
    }
}

#[derive(Clone)]
struct ApprovalService<Command: AsyncCommands> {
    pub redis_client: Command,
}

impl<Command: AsyncCommands> ApprovalService<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    fn approve_user(token_value: TokenValue) -> Result<(), PestoError> {
        todo!()
    }

    fn revoke_user(token_value: TokenValue) -> Result<(), PestoError> {
        todo!()
    }

    fn get_user_by_token(token: String) -> Result<TokenValue, PestoError> {
        todo!()
    }
}

#[derive(Clone)]
struct TrialService<Command: AsyncCommands> {
    pub redis_client: Command,
}

impl<Command: AsyncCommands> TrialService<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    fn create_token() -> Result<String, PestoError> {
        todo!()
    }
}

#[derive(Clone)]
struct MailersendClient {
    pub api_key: String,
}

struct MailersendEmailPayload {
    pub from: MailersendEmailFrom,
    pub to: Vec<MailersendEmailTo>,
    pub subject: String,
    pub text: String,
    pub html: String,
}

struct MailersendEmailFrom {
    pub email: String,
    pub name: String,
}

struct MailersendEmailTo {
    pub email: String,
    pub name: String,
}

impl MailersendClient {
    fn new(api_key: String) -> Self {
        Self { api_key }
    }

    fn send_email(&self, destination: String, subject: String, text: String, html: String) {
        todo!()
    }
}

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}
fn main() -> Result<(), Box<dyn Error>> {
    tracing_subscriber::registry::Registry::default()
        .with(sentry::integrations::tracing::layer())
        .init();

    let _guard = sentry::init((env::var("SENTRY_DSN").unwrap_or(String::from("")), sentry::ClientOptions {
        release: sentry::release_name!(),
        sample_rate: 1.0,
        traces_sample_rate: 0.5,
        ..Default::default()
    }));

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let redis_client = Client::open("redis://@localhost:6379").unwrap();
            let redis_async_connection = redis_client.get_multiplexed_async_connection().await.unwrap();
            let approval_service = ApprovalService::new(redis_async_connection.clone());
            let waiting_list_service = WaitingListService::new(redis_async_connection);

            let app = Router::new()
                .route("/healthz", get(healthcheck))
                .with_state(approval_service)
                .with_state(waiting_list_service);

            let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
            axum::serve(listener, app).await.unwrap();
        });

    Ok(())
}