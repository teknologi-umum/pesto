#!/usr/bin/env bash

cd ~
apt-get install -y libedit-dev
curl -LO https://github.com/fabianishere/brainfuck/archive/refs/tags/2.7.3.tar.gz
tar -zxf 2.7.3.tar.gz
mkdir -p brainfuck-2.7.3/build
mkdir -p /opt/brainfuck/2.7.3
cd brainfuck-2.7.3/build
cmake ..
make -j $(nproc)
make DESTDIR=/opt/brainfuck/2.7.3 install -j $(nproc)
cd ../..
rm -rf 2.7.3.tar.gz brainfuck-2.7.3
