#!/usr/bin/env bash

VERSION="3.2.1"
MINOR="3.2"

cd ~
curl -LO https://cache.ruby-lang.org/pub/ruby/${MINOR}/ruby-${VERSION}.tar.gz
tar -zxf ruby-${VERSION}.tar.gz
cd ruby-${VERSION}
mkdir -p /opt/ruby/${MINOR}
./configure --prefix=/opt/ruby/$MINOR --disable-install-doc
make -j $(nproc)
make install -j $(nproc)
cd ..
rm -rf ruby-${VERSION}.tar.gz ruby-${VERSION}
