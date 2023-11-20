#!/usr/bin/env bash

MINOR="1.9"
VERSION="1.9.4"

cd ~
curl -LO https://julialang-s3.julialang.org/bin/linux/x64/${MINOR}/julia-${VERSION}-linux-x86_64.tar.gz
tar zxvf julia-${VERSION}-linux-x86_64.tar.gz
mv -v julia-${VERSION} julia
mkdir -p /opt/julia/
mv -v julia /opt/julia/1.9
rm julia-${VERSION}-linux-x86_64.tar.gz
