use axum::extract::{FromRef, State};
use axum::http::{header, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{post, put};
use axum::{routing::get, Json, Router};
use rand::distributions::Alphanumeric;
use rand::Rng;
use redis::{AsyncCommands, Client, RedisError, RedisResult};
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt::{Debug, Display, Formatter};
use std::{env, fmt};
use tokio::net::TcpListener;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

enum PestoError {
    UserNotFound,
    EmailAlreadyExists,
    EmptyToken,
    ParseError,
    RedisError(RedisError),
}

impl Display for PestoError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            PestoError::UserNotFound => write!(f, "User not found"),
            PestoError::EmailAlreadyExists => write!(f, "Email already exists"),
            PestoError::RedisError(e) => write!(f, "Redis error: {}", e),
            PestoError::ParseError => write!(f, "Parse error"),
            PestoError::EmptyToken => write!(f, "Empty token"),
        }
    }
}

#[derive(Clone)]
struct ApplicationState<Command: AsyncCommands + Clone> {
    waiting_list_service: WaitingListService<Command>,
    approval_service: ApprovalService<Command>,
    trial_service: TrialService<Command>,
    mailersend_client: MailersendClient,
}

impl<Command: AsyncCommands + Clone> Debug for ApplicationState<Command> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "ApplicationState")
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
    #[serde(skip_serializing, rename = "Token", alias = "token")]
    pub token: Option<String>,
    #[serde(rename = "UserEmail", alias = "email")]
    pub user_email: String,
    #[serde(rename = "MonthlyLimit", alias = "limit")]
    pub monthly_limit: i64,
    #[serde(default, rename = "Revoked")]
    pub revoked: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct PestoToken {
    pub token: String,
}

#[derive(Clone)]
struct WaitingListService<Command: AsyncCommands>
where
    Command: Clone,
{
    pub redis_client: Command,
}

impl<Command: AsyncCommands + Clone> FromRef<ApplicationState<Command>>
    for WaitingListService<Command>
{
    fn from_ref(input: &ApplicationState<Command>) -> Self {
        input.waiting_list_service.clone()
    }
}

impl<Command: AsyncCommands + Clone> Debug for WaitingListService<Command> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "WaitingListService")
    }
}

impl<Command: AsyncCommands + Clone> WaitingListService<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    #[tracing::instrument]
    async fn put_user_in_waiting_list(&mut self, human_user: HumanUser) -> Result<(), PestoError> {
        let users = match self.get_users().await {
            Ok(users) => users,
            Err(e) => return Err(e),
        };

        // Check if the user's email already exists on the waiting list
        let email_exists = users
            .iter()
            .any(|waiting_list_user| waiting_list_user.email == human_user.email);
        if email_exists {
            return Err(PestoError::EmailAlreadyExists);
        }

        // Email not exists, let's serialize human_user struct and insert it into Redis
        let serialized_user =
            serde_json::to_string(&human_user).map_err(|_| PestoError::ParseError)?;
        self.redis_client
            .rpush("waiting-list", serialized_user)
            .await
            .map_err(|e| PestoError::RedisError(e))?;

        Ok(())
    }

    #[tracing::instrument]
    async fn get_users(&mut self) -> Result<Vec<HumanUser>, PestoError> {
        let waiting_list_result: RedisResult<Option<Vec<String>>> =
            self.redis_client.lrange("waiting-list", 0, -1).await;

        let waiting_list = match waiting_list_result {
            Ok(Some(users)) => users,
            Ok(None) => Vec::new(),
            Err(e) => return Err(PestoError::RedisError(e)),
        };

        let mut users = Vec::new();
        for value in waiting_list {
            let user =
                serde_json::from_str::<HumanUser>(&value).map_err(|_| PestoError::ParseError)?;
            users.push(user);
        }

        Ok(users)
    }

    #[tracing::instrument]
    async fn remove_user(&mut self, human_user: HumanUser) -> Result<(), PestoError> {
        let users: Vec<HumanUser> = self.get_users().await?;

        // Filter out user
        let filtered_waiting_list_users = users
            .iter()
            .filter(|waiting_list_user| waiting_list_user.email != human_user.email);

        // Delete the key
        self.redis_client
            .del("waiting-list")
            .await
            .map_err(|e| PestoError::RedisError(e))?;

        // Insert the remaining users
        for value in filtered_waiting_list_users {
            let serialized_user =
                serde_json::to_string(value).map_err(|_| PestoError::ParseError)?;
            self.redis_client
                .rpush("waiting-list", serialized_user)
                .await
                .map_err(|e| PestoError::RedisError(e))?;
        }

        Ok(())
    }
}

#[derive(Clone)]
struct ApprovalService<Command: AsyncCommands>
where
    Command: Clone,
{
    pub redis_client: Command,
}

impl<Command: AsyncCommands + Clone> FromRef<ApplicationState<Command>>
    for ApprovalService<Command>
{
    fn from_ref(input: &ApplicationState<Command>) -> Self {
        input.approval_service.clone()
    }
}

impl<Command: AsyncCommands + Clone> Debug for ApprovalService<Command> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "ApprovalService")
    }
}

impl<Command: AsyncCommands + Clone> ApprovalService<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    #[tracing::instrument]
    async fn approve_user(&mut self, token_value: TokenValue) -> Result<(), PestoError> {
        if let Some(token) = token_value.token {
            let registered_user = TokenValue {
                token: Some(token.clone()),
                user_email: token_value.user_email,
                monthly_limit: token_value.monthly_limit,
                revoked: false,
            };

            let serialized_user =
                serde_json::to_string(&registered_user).map_err(|_| PestoError::ParseError)?;

            self.redis_client
                .set(token, serialized_user)
                .await
                .map_err(|e| PestoError::RedisError(e))?;

            Ok(())
        } else {
            Err(PestoError::EmptyToken)
        }
    }

    #[tracing::instrument]
    async fn revoke_user(&mut self, token_value: TokenValue) -> Result<(), PestoError> {
        let registered_user = TokenValue {
            token: token_value.token,
            user_email: token_value.user_email,
            monthly_limit: token_value.monthly_limit,
            revoked: true,
        };

        let serialized_user =
            serde_json::to_string(&registered_user).map_err(|_| PestoError::ParseError)?;

        self.redis_client
            .set(registered_user.token, serialized_user)
            .await
            .map_err(|e| PestoError::RedisError(e))?;

        Ok(())
    }

    #[tracing::instrument]
    async fn get_user_by_token(&mut self, token: String) -> Result<TokenValue, PestoError> {
        let registered_user: RedisResult<Option<String>> = self.redis_client.get(token).await;

        match registered_user {
            Ok(Some(user)) => {
                let token_value = serde_json::from_str::<TokenValue>(&user)
                    .map_err(|_| PestoError::ParseError)?;
                Ok(token_value)
            }
            Ok(None) => Err(PestoError::UserNotFound),
            Err(e) => Err(PestoError::RedisError(e)),
        }
    }
}

#[derive(Clone)]
struct TrialService<Command: AsyncCommands>
where
    Command: Clone,
{
    pub redis_client: Command,
}

impl<Command: AsyncCommands + Clone> FromRef<ApplicationState<Command>> for TrialService<Command> {
    fn from_ref(input: &ApplicationState<Command>) -> Self {
        input.trial_service.clone()
    }
}

impl<Command: AsyncCommands + Clone> Debug for TrialService<Command> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "TrialService")
    }
}

impl<Command: AsyncCommands + Clone> TrialService<Command> {
    fn new(redis_client: Command) -> Self {
        Self { redis_client }
    }

    #[tracing::instrument]
    async fn create_token(&mut self) -> Result<String, PestoError> {
        let token = format!("TRIAL-{}", self.random_string(64 - 6));
        let user_email = format!("trial-{}@pesto.teknologiumum.com", self.random_string(20));

        let registered_user = TokenValue {
            token: Some(token.clone()),
            user_email,
            monthly_limit: 10,
            revoked: false,
        };

        let serialized_user =
            serde_json::to_string(&registered_user).map_err(|_| PestoError::ParseError)?;

        self.redis_client
            .set_ex(token.clone(), serialized_user, 24 * 60 * 60)
            .await
            .map_err(|e| PestoError::RedisError(e))?;

        Ok(token)
    }

    fn random_string(&self, length: u32) -> String {
        rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(length as usize)
            .map(char::from)
            .collect()
    }
}

#[derive(Clone)]
struct MailersendClient {
    pub api_key: String,
    pub client: reqwest::Client,
}

impl<Command: AsyncCommands + Clone> FromRef<ApplicationState<Command>> for MailersendClient {
    fn from_ref(input: &ApplicationState<Command>) -> Self {
        input.mailersend_client.clone()
    }
}

impl Debug for MailersendClient {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "MailersendClient")
    }
}

#[derive(Serialize)]
struct MailersendEmailPayload {
    pub from: MailersendEmailFrom,
    pub to: Vec<MailersendEmailTo>,
    pub subject: String,
    pub text: String,
    pub html: String,
}

#[derive(Serialize)]
struct MailersendEmailFrom {
    pub email: String,
    pub name: String,
}

#[derive(Serialize)]
struct MailersendEmailTo {
    pub email: String,
    pub name: String,
}

#[derive(Debug, Clone)]
enum MailersendError {
    BadRequest(String),
    Unauthorized,
    Forbidden,
    NotFound,
    RequestTimeout,
    UnderMaintenance(String),
    UnprocessableEntity(String),
    TooManyRequest(String),
    InternalServerError(String),
    NetworkError(String),
}

impl Display for MailersendError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            MailersendError::BadRequest(e) => write!(f, "There was an error when processing your request. Please adjust your request based on the endpoint requirements and try again: {}", e),
            MailersendError::Unauthorized => write!(f, "The provided API token is invalid"),
            MailersendError::Forbidden => write!(f, "The action is denied for that account or a particular API token. Please make sure your account is allowed API access and check your API token permissions."),
            MailersendError::NotFound => write!(f, "The requested resource does not exist on the system."),
            MailersendError::RequestTimeout => write!(f, "There is an error on our system. Please contact support."),
            MailersendError::UnderMaintenance(e) => write!(f, "Service isn't available, try again later: {}", e),
            MailersendError::UnprocessableEntity(e) => write!(f, "There was a validation error found when processing the request. Please adjust it based on the endpoint requirements and try again: {}", e),
            MailersendError::TooManyRequest(e) => write!(f, "There were too many requests made to the API: {}", e),
            MailersendError::InternalServerError(e) => write!(f, "Internal Server Error: {}", e),
            MailersendError::NetworkError(e) => write!(f, "Network error: {}", e),
        }
    }
}

impl Error for MailersendError {}

impl MailersendClient {
    fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: reqwest::Client::new(),
        }
    }

    #[tracing::instrument]
    async fn send_email(
        &self,
        destination: String,
        subject: String,
        text: String,
        html: String,
    ) -> Result<(), MailersendError> {
        let payload = MailersendEmailPayload {
            from: MailersendEmailFrom {
                email: String::from("pesto@teknologiumum.com"),
                name: String::from("Pesto from Teknologi Umum"),
            },
            to: vec![MailersendEmailTo {
                email: destination,
                name: String::new(),
            }],
            subject,
            text,
            html,
        };

        let client = self
            .client
            .post("https://api.mailersend.com/v1/email")
            .header("Content-Type", "application/json")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload);

        match client.send().await {
            Ok(response) => match response.status() {
                StatusCode::OK => Ok(()),
                StatusCode::BAD_REQUEST => {
                    let error = response.text().await.unwrap_or_default();
                    Err(MailersendError::BadRequest(error))
                }
                StatusCode::UNAUTHORIZED => Err(MailersendError::Unauthorized),
                StatusCode::FORBIDDEN => Err(MailersendError::Forbidden),
                StatusCode::NOT_FOUND => Err(MailersendError::NotFound),
                StatusCode::REQUEST_TIMEOUT => Err(MailersendError::RequestTimeout),
                StatusCode::SERVICE_UNAVAILABLE => {
                    let error = response.text().await.unwrap_or_default();
                    Err(MailersendError::UnderMaintenance(error))
                }
                StatusCode::UNPROCESSABLE_ENTITY => {
                    let error = response.text().await.unwrap_or_default();
                    Err(MailersendError::UnprocessableEntity(error))
                }
                StatusCode::TOO_MANY_REQUESTS => {
                    let error = response.text().await.unwrap_or_default();
                    Err(MailersendError::TooManyRequest(error))
                }
                StatusCode::INTERNAL_SERVER_ERROR => {
                    let error = response.text().await.unwrap_or_default();
                    Err(MailersendError::InternalServerError(error))
                }
                _ => {
                    let error = response.text().await.unwrap_or_default();
                    Err(MailersendError::NetworkError(error))
                }
            },
            Err(e) => {
                sentry::capture_error(&e);
                return Err(MailersendError::NetworkError(e.to_string()));
            }
        }
    }
}

async fn healthcheck() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

#[tracing::instrument(name = "POST /api/register", fields(op = "http.server", http.request.method = "POST"))]
async fn register<Command: AsyncCommands + Clone>(
    State(mut waiting_list_service): State<WaitingListService<Command>>,
    Json(body): Json<HumanUser>,
) -> impl IntoResponse {
    let result = waiting_list_service.put_user_in_waiting_list(body).await;

    match result {
        Ok(_) => (
            StatusCode::CREATED,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Created"}"#,
        ),
        Err(PestoError::EmailAlreadyExists) => (
            StatusCode::ACCEPTED,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Accepted"}"#,
        ),
        Err(PestoError::RedisError(error)) => {
            sentry::capture_error(&error);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#,
            )
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Internal Server Error"}"#,
        ),
    }
}

#[tracing::instrument(name = "GET /api/pending", fields(op = "http.server", http.request.method = "GET"))]
async fn pending_users<Command: AsyncCommands + Clone>(
    State(mut waiting_list_service): State<WaitingListService<Command>>,
) -> impl IntoResponse {
    let result = waiting_list_service.get_users().await;

    match result {
        Ok(users) => {
            let serialized_users = match serde_json::to_string(&users) {
                Ok(serialized_users) => serialized_users,
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        [(header::CONTENT_TYPE, "application/json")],
                        r#"{"message":"Internal Server Error"}"#.to_string(),
                    )
                }
            };

            (
                StatusCode::OK,
                [(header::CONTENT_TYPE, "application/json")],
                serialized_users,
            )
        }
        Err(PestoError::RedisError(error)) => {
            sentry::capture_error(&error);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#.to_string(),
            )
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"Internal Server Error"}"#.to_string(),
        ),
    }
}

#[tracing::instrument(name = "PUT /api/approve", fields(op = "http.server", http.request.method = "PUT"))]
async fn approve_user<Command: AsyncCommands + Clone>(
    State(mut waiting_list_service): State<WaitingListService<Command>>,
    State(mut approval_service): State<ApprovalService<Command>>,
    State(mailersend_client): State<MailersendClient>,
    Json(body): Json<TokenValue>,
) -> impl IntoResponse {
    // Check if user exists on the waiting list
    let waiting_list: Vec<HumanUser> = match waiting_list_service.get_users().await {
        Ok(waiting_list) => waiting_list,
        Err(PestoError::RedisError(error)) => {
            sentry::capture_error(&error);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#,
            );
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#,
            )
        }
    };

    // Check if email exists on the waiting list
    let user: Option<&HumanUser> = waiting_list
        .iter()
        .find(|waiting_list_user| waiting_list_user.email == body.user_email);

    // XXX(reinaldy): we should refactor this hadouken pattern later
    match user {
        None => {
            return (
                StatusCode::BAD_REQUEST,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Email does not exists"}"#,
            );
        }
        Some(user) => match approval_service.approve_user(body).await {
            Ok(_) => {
                // Email does exist, but let us check if token already exists
                if let Some(token) = body.token.clone() {
                    if approval_service.get_user_by_token(token).await.is_ok() {
                        return (
                            StatusCode::BAD_REQUEST,
                            [(header::CONTENT_TYPE, "application/json")],
                            r#"{"message":"Token already exists"}"#,
                        );
                    }
                }

                // Email the user
                let _ = mailersend_client.send_email(
                        user.email.clone(),
                        "Your Pesto (the remote code execution engine) token!".to_string(),
                        format!(r#"Hello, {}! 👋

Sorry for the long wait. We've been occupied with some work outside the open source world. But, we got your registration submission for Pesto, the remote code execution engine.

Pesto users are still relatively low, so we'd love to get feedback from you. You can reply to this email, or open an issue on the GitHub repository. Feel free to request new features, report bugs, or even contribute to us, that will be so much appreciated.

Your token is:

{}

Thank you! Have a great day."#, user.name.clone(), user.email.clone()),
                        format!(r#"<b>Hello, {}! 👋</b><br><br>Sorry for the long wait. We've been occupied with some work outside the open source world. But, we got your registration submission for Pesto, the remote code execution engine.<br><br>Pesto users are still relatively low, so we'd love to get feedback from you. You can reply to this email, or open an issue on the GitHub repository. Feel free to request new features, report bugs, or even contribute to us, that will be so much appreciated.<br><br>Your token is:<br><br>{}<br><br>Thank you! Have a great day."#, user.name.clone(), user.email.clone()),
                    ).await.map_err(|error| {
                        sentry::capture_error(&error);
                        error
                    });

                match waiting_list_service.remove_user(user.clone()).await {
                    Ok(_) => (
                        StatusCode::OK,
                        [(header::CONTENT_TYPE, "application/json")],
                        r#"{"message":"OK"}"#,
                    ),
                    Err(PestoError::RedisError(error)) => {
                        sentry::capture_error(&error);
                        return (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            [(header::CONTENT_TYPE, "application/json")],
                            r#"{"message":"Internal Server Error"}"#,
                        );
                    }
                    Err(_) => {
                        return (
                            StatusCode::BAD_REQUEST,
                            [(header::CONTENT_TYPE, "application/json")],
                            r#"{"message":"User seemed to be removed from waiting list already"}"#,
                        )
                    }
                }
            }
            Err(PestoError::RedisError(error)) => {
                sentry::capture_error(&error);
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"Internal Server Error"}"#,
                );
            }
            Err(_) => {
                return (
                    StatusCode::BAD_REQUEST,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"User seemed to be approved already"}"#,
                );
            }
        },
    }
}

#[tracing::instrument(name = "PUT /api/revoke", fields(op = "http.server", http.request.method = "PUT"))]
async fn revoke_user<Command: AsyncCommands + Clone>(
    State(mut approval_service): State<ApprovalService<Command>>,
    Json(pesto_token): Json<PestoToken>,
) -> impl IntoResponse {
    let registered_user: TokenValue =
        match approval_service.get_user_by_token(pesto_token.token).await {
            Ok(registered_user) => registered_user,
            Err(PestoError::UserNotFound) => {
                return (
                    StatusCode::BAD_REQUEST,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"User does not exists"}"#,
                )
            }
            Err(PestoError::RedisError(error)) => {
                sentry::capture_error(&error);
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"Internal Server Error"}"#,
                );
            }
            Err(_) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    [(header::CONTENT_TYPE, "application/json")],
                    r#"{"message":"Internal Server Error"}"#,
                )
            }
        };

    match approval_service.revoke_user(registered_user).await {
        Ok(_) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"OK"}"#,
        ),
        Err(PestoError::RedisError(error)) => {
            sentry::capture_error(&error);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#,
            )
        }
        Err(_) => (
            StatusCode::BAD_REQUEST,
            [(header::CONTENT_TYPE, "application/json")],
            r#"{"message":"User seemed to be revoked already"}"#,
        ),
    }
}

#[tracing::instrument(name = "POST /api/trial", fields(op = "http.server", http.request.method = "POST"))]
async fn user_trial<Command: AsyncCommands + Clone>(
    State(mut trial_service): State<TrialService<Command>>,
) -> impl IntoResponse {
    match trial_service.create_token().await {
        Ok(token) => {
            let serialized_token = match serde_json::to_string(&PestoToken { token }) {
                Ok(out) => out,
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        [(header::CONTENT_TYPE, "application/json")],
                        r#"{"message":"Internal Server Error"}"#.to_string(),
                    )
                }
            };

            (
                StatusCode::OK,
                [(header::CONTENT_TYPE, "application/json")],
                serialized_token,
            )
        }
        Err(PestoError::RedisError(error)) => {
            sentry::capture_error(&error);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#.to_string(),
            );
        }
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "application/json")],
                r#"{"message":"Internal Server Error"}"#.to_string(),
            )
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
            sample_rate: 1.0,
            traces_sample_rate: 0.5,
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
            let approval_service = ApprovalService::new(redis_async_connection.clone());
            let trial_service = TrialService::new(redis_async_connection.clone());
            let waiting_list_service = WaitingListService::new(redis_async_connection);
            let mailersend_client =
                MailersendClient::new(env::var("MAILERSEND_API_KEY").unwrap_or_default());

            let application_state = ApplicationState {
                waiting_list_service,
                approval_service,
                trial_service,
                mailersend_client,
            };

            let app = Router::new()
                .route("/healthz", get(healthcheck))
                .route("/api/register", post(register))
                .route("/api/pending", get(pending_users))
                .route("/api/approve", put(approve_user))
                .route("/api/revoke", put(revoke_user))
                .route("/api/trial", post(user_trial))
                .with_state(application_state);

            let listener = TcpListener::bind(format!(
                "0.0.0.0:{}",
                env::var("PORT").unwrap_or("3000".to_string())
            ))
            .await
            .unwrap();
            axum::serve(listener, app).await.unwrap();
        });

    Ok(())
}
