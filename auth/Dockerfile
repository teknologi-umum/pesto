FROM golang:1.20.1-bookworm AS builder

WORKDIR /app

COPY . .

RUN go build -o pesto_auth .

FROM debian:bookworm

WORKDIR /app

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl ca-certificates

COPY --from=builder /app/pesto_auth .

ENV PORT=3000

EXPOSE ${PORT}

CMD [ "./pesto_auth" ]