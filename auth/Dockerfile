FROM golang:1.18.3-bullseye AS builder

WORKDIR /app

COPY . .

RUN go build -o pesto_auth .

FROM debian:bullseye

WORKDIR /app

COPY --from=builder /app/pesto_auth .

EXPOSE ${PORT}

CMD [ "./pesto_auth" ]