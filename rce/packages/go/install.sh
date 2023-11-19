#!/usr/bin/env bash

VERSION="1.21.4"

cd ~
curl -LO https://go.dev/dl/go${VERSION}.linux-amd64.tar.gz
mkdir -p /opt/go/1.21
tar -C /opt/go/1.21 -xzf go${VERSION}.linux-amd64.tar.gz
rm go${VERSION}.linux-amd64.tar.gz
