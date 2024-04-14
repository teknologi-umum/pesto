FROM rust:1.77-bookworm AS builder

WORKDIR /app

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl ca-certificates wget

COPY --from=builder /app/target/release/auth /usr/local/bin/auth

CMD ["/usr/local/bin/auth"]