#!/usr/bin/env bash

cd ~

curl -LO https://download.oracle.com/java/17/archive/jdk-17.0.6_linux-x64_bin.tar.gz
tar -zxf jdk-17.0.6_linux-x64_bin.tar.gz
mkdir -p /opt/java/
mv -v jdk-17.0.6/ /opt/java/17/
rm -rf jdk-17.0.6_linux-x64_bin.tar.gz
