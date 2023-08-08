#!/usr/bin/env bash

VERSION="1.27.0"

cd ~
curl -LO https://github.com/janet-lang/janet/archive/refs/tags/v${VERSION}.tar.gz
tar -zxf v${VERSION}.tar.gz
cd janet-${VERSION}/
make dist -j $(nproc)
mkdir -p /opt/janet
mv -v build/janet-dist/ /opt/janet/v${VERSION}
make clean
cd ..
rm -rf v${VERSION}.tar.gz janet-${VERSION}/


