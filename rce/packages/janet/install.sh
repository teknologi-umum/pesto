#!/usr/bin/env bash

VERSION="1.27.0"

curl -LO https://github.com/janet-lang/janet/releases/download/v${VERSION}/janet-v${VERSION}-linux-x64.tar.gz
tar -zxf janet-v${VERSION}-linux-x64.tar.gz
mkdir -p /opt/janet/
mv -v janet-v${VERSION}-linux/ /opt/janet/v${VERSION}/
rm janet-v${VERSION}-linux-x64.tar.gz
