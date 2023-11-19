#!/usr/bin/env bash

VERSION="3.12.0"

cd /tmp
# Acquire the Python tar.gz file from the source repository
curl -LO https://www.python.org/ftp/python/${VERSION}/Python-${VERSION}.tgz
tar -zxf Python-${VERSION}.tgz
mkdir -p /opt/python/${VERSION}
cd Python-${VERSION}
./configure \
  --prefix=/opt/python/${VERSION} \
  --enable-shared \
  LDFLAGS=-Wl,-rpath=/opt/python/${VERSION}/lib,--disable-new-dtags
make -j $(nproc)
make install -j $(nproc)

cd /tmp
rm -rf Python-${VERSION}*

