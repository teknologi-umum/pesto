#!/usr/bin/env bash

VERSION="5.4.4"

cd ~
curl -LO https://www.lua.org/ftp/lua-${VERSION}.tar.gz
tar zxf lua-${VERSION}.tar.gz
cd lua-${VERSION}
make
make install -j $(nproc)
cd ~
rm -rf lua-${VERSION} lua-${VERSION}.tar.gz

