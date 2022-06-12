#!/usr/bin/env bash

apt-get install -y libedit-dev cmake
curl -LO https://github.com/fabianishere/brainfuck/archive/refs/tags/2.7.3.tar.gz
tar -zxf 2.7.3.tar.gz
mkdir -p brainfuck-2.7.3/build
cd brainfuck-2.7.3/build
cmake ..
make -j $(nproc)
make install -j $(nproc)
cd ..
rm -rf 2.7.3.tar.gz brainfuck-2.7.3
