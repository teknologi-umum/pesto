#!/usr/bin/env bash

cd ~

apt-get update
apt-get install -y build-essential libz-dev zlib1g-dev

mkdir -p /opt/java

curl -LO https://github.com/graalvm/graalvm-ce-builds/releases/download/vm-22.1.0/graalvm-ce-java11-linux-amd64-22.1.0.tar.gz
tar -zxf graalvm-ce-java11-linux-amd64-22.1.0.tar.gz -C /opt/

mv -v /opt/graalvm-ce-java11-22.1.0/* /opt/java/
rm -rf /opt/graalvm-ce-java11-22.1.0 graalvm-ce-java11-linux-amd64-22.1.0.tar.gz

export JAVA_HOME=/opt/java
export PATH=${PATH}:${JAVA_HOME}/bin

/opt/java/bin/gu install native-image
