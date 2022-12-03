#!/usr/bin/env bash

cd ~

curl -LO https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz
tar -zxf jdk-17_linux-x64_bin.tar.gz
mkdir -p /opt/java/
mv -v jdk-17.0.5/ /opt/java/17/
rm -rf jdk-17_linux-x64_bin.tar.gz
