#!/usr/bin/env bash

if [[ ! -d "/opt/erlang/25/" ]]; then
  source ../erlang-25/install.sh
fi

cd ~
mkdir -p /opt/elixir/1.14/
curl -LO https://github.com/elixir-lang/elixir/releases/download/v1.14.1/elixir-otp-25.zip
unzip elixir-otp-25.zip -d /opt/elixir/1.14/
rm elixir-otp-25.zip
