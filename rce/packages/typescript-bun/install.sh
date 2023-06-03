#!/usr/bin/env bash

mkdir -p /opt/bun/0.6.5
curl -LO https://github.com/oven-sh/bun/releases/download/bun-v0.6.5/bun-linux-x64.zip
unzip bun-linux-x64.zip
mv bun-linux-x64/bun /opt/bun/0.6.5/bun
rm -rf bun-linux-x64.zip bun-linux-x64
