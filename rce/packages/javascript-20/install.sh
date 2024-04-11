#!/usr/bin/env bash

VERSION="20.9.0"

cd ~
curl -LO https://nodejs.org/dist/v${VERSION}/node-v${VERSION}-linux-x64.tar.gz
tar -zxf node-v${VERSION}-linux-x64.tar.gz

mkdir --parents --verbose /opt/node/${VERSION}/

mv -v node-v${VERSION}-linux-x64/* /opt/node/${VERSION}/

rm -rf node-v${VERSION}-linux-x64 node-v${VERSION}-linux-x64.tar.gz
