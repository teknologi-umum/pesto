#!/usr/bin/env bash

VERSION="2.16.1"

cd ~
curl -LO https://github.com/d5/tengo/releases/download/v${VERSION}/tengo_${VERSION}_linux_amd64.tar.gz
mkdir -p /opt/tengo/2.16.1
tar -C /opt/tengo/2.16.1 -xzf tengo_${VERSION}_linux_amd64.tar.gz
rm tengo_${VERSION}_linux_amd64.tar.gz
