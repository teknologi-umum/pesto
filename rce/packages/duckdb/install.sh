#!/usr/bin/env bash

cd ~

curl -LO https://github.com/duckdb/duckdb/releases/download/v1.0.0/duckdb_cli-linux-amd64.zip

unzip duckdb_cli-linux-amd64.zip

rm duckdb_cli-linux-amd64.zip

mkdir -p /opt/duckdb/bin

mv -v duckdb /opt/duckdb/bin/duckdb

echo "DuckDB installation finished"
