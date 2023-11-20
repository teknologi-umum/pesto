#!/usr/bin/env bash

mkdir -p /opt/bun/1.0.13
curl -LO https://github.com/oven-sh/bun/releases/download/bun-v1.0.13/bun-linux-x64.zip
unzip bun-linux-x64.zip
mv bun-linux-x64/bun /opt/bun/1.0.13/bun
rm -rf bun-linux-x64.zip bun-linux-x64
