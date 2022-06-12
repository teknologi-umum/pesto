#!/usr/bin/env bash

VERSION="3.1.2"
MINOR="3.1"

curl -LO https://cache.ruby-lang.org/pub/ruby/${MINOR}/ruby-${VERSION}.tar.gz
tar -zxf ruby-${VERSION}.tar.gz
cd ruby-${VERSION}
./configure
make
make install
cd ..
rm -rf ruby-${VERSION}.tar.gz ruby-${VERSION}
