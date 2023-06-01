#!/usr/bin/env bash

if [ -d "/opt/gcc/12.2.0/" ]; then
  exit 0
fi

apt-get install -y libc6-dev dpkg-dev

cd ~

curl -LO https://github.com/gcc-mirror/gcc/archive/refs/tags/releases/gcc-12.2.0.tar.gz
tar -zxf gcc-12.2.0.tar.gz
cd gcc-releases-gcc-12.2.0
./contrib/download_prerequisites

mkdir -p /opt/gcc/12.2.0

cd ..
mkdir build
cd build
../gcc-releases-gcc-12.2.0/configure -v --build=x86_64-linux-gnu --host=x86_64-linux-gnu --target=x86_64-linux-gnu --prefix=/opt/gcc/12.2.0 --disable-checking --enable-stage1-checking --enable-languages=c,c++,fortran --disable-multilib

make -j $(nproc)
make install-strip -j $(nproc)

cd ..

rm -rf build gcc*
