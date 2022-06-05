#!/usr/bin/env bash

VERSION="3.10.2"

cd /tmp
# Acquire the Python tar.gz file from the source repository
curl -LO https://www.python.org/ftp/python/${VERSION}/Python-${VERSION}.tgz
tar -zxf Python-${VERSION}.tgz
cd Python-${VERSION}
./configure \
  --prefix=/opt/python/${VERSION} \
  --enable-shared \
  LDFLAGS=-Wl,-rpath=/opt/python/${VERSION}/lib,--disable-new-dtags
make -j $(nproc)
make install

cd /tmp
rm Python-${VERSION}.tgz
rm -rf Python-${VERSION}

