#!/usr/bin/env bash

VERSION="1.18.3"

curl -LO https://go.dev/dl/go${VERSION}.linux-amd64.tar.gz
tar -C /opt/go/1.18 -xzf go${VERSION}.linux-amd64.tar.gz
rm go${VERSION}.linux-amd64.tar.gz
