#!/usr/bin/env bash

VERSION="3.1.2"
MINOR="3.1"

curl -LO https://cache.ruby-lang.org/pub/ruby/${MINOR}/ruby-${VERSION}.tar.gz
tar -zxf ruby-${VERSION}.tar.gz
cd ruby-${VERSION}
mkdir -p /opt/ruby/3.1
./configure --prefix=/opt/ruby/3.1
make -j $(nproc)
make install -j $(nproc)
cd ..
rm -rf ruby-${VERSION}.tar.gz ruby-${VERSION}
