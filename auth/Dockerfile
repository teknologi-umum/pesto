FROM golang:1.21.1-bookworm AS builder

WORKDIR /app

COPY . .

RUN go build -o pesto_auth .

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y curl ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .

COPY --from=builder /app/pesto_auth .

ENV PORT=3000

EXPOSE ${PORT}

CMD [ "./pesto_auth" ]