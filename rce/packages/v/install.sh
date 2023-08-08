#!/usr/bin/env bash

VERSION=0.3

cd ~
curl -LO https://github.com/vlang/v/releases/download/${VERSION}/v_linux.zip
unzip v_linux.zip
mkdir -p /opt/v/
mv -v v /opt/v/0.3
rm v_linux.zip
