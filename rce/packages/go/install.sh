#!/usr/bin/env bash

VERSION="1.20.2"

curl -LO https://go.dev/dl/go${VERSION}.linux-amd64.tar.gz
mkdir -p /opt/go/1.20
tar -C /opt/go/1.20 -xzf go${VERSION}.linux-amd64.tar.gz
rm go${VERSION}.linux-amd64.tar.gz
