#!/usr/bin/env bash

VERSION="16.15.0"

cd ~
curl -LO https://nodejs.org/dist/v16.15.0/node-v${VERSION}-linux-x64.tar.gz
tar -zxf node-v${VERSION}-linux-x64.tar.gz

mkdir --parents --verbose /opt/node/${VERSION}/

mv -v node-v${VERSION}-linux-x64/* /opt/node/${VERSION}/

rm -rf node-v${VERSION}-linux-x64 node-v${VERSION}-linux-x64.tar.gz
