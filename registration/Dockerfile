FROM rust:1.81-bookworm AS builder

WORKDIR /app

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openssl ca-certificates wget

COPY --from=builder /app/target/release/registration /usr/local/bin/registration

CMD ["/usr/local/bin/registration"]