#!/usr/bin/env bash

VERSION="1.18.3"

curl -LO https://go.dev/dl/go${VERSION}.linux-amd64.tar.gz
tar -C /usr/local -xzf go${VERSION}.linux-amd64.tar.gz
rm go${VERSION}.linux-amd64.tar.gz
