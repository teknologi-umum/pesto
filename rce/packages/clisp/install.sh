#!/usr/bin/env bash

cd ~
curl -LO http://prdownloads.sourceforge.net/sbcl/sbcl-2.2.7-x86-64-linux-binary.tar.bz2
tar -xf sbcl-2.2.7-x86-64-linux-binary.tar.bz2
cd sbcl-2.2.7-x86-64-linux
mkdir -p /opt/sbcl/
INSTALL_ROOT=/opt/sbcl/2.2.7 ./install.sh
cd ~
rm -rf sbcl-2.2.7-x86-64-linux-binary.tar.bz2 sbcl-2.2.7-x86-64-linux
