#!/usr/bin/env bash

VERSION="18.12.1"

curl -LO https://nodejs.org/dist/v${VERSION}/node-v${VERSION}-linux-x64.tar.gz
tar -zxf node-v${VERSION}-linux-x64.tar.gz

cd node-v${VERSION}-linux-x64

mkdir --parents --verbose /opt/node/${VERSION}/bin \
    /opt/node/${VERSION}/include /opt/node/${VERSION}/lib  \
    /opt/node/${VERSION}/share/doc /opt/node/${VERSION}/share/man

mv -v bin/* /opt/node/${VERSION}/bin/
mv -v include/* /opt/node/${VERSION}/include/
mv -v lib/* /opt/node/${VERSION}/lib/
mv -v share/doc/* /opt/node/${VERSION}/share/doc/
mv -v share/man/* /opt/node/${VERSION}/share/man/
mv -v share/* /opt/node/${VERSION}/share/

cd ..

rm -rf node-v${VERSION}-linux-x64 node-v${VERSION}-linux-x64.tar.gz
