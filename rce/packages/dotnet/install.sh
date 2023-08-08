#!/usr/bin/env bash

VERSION="6.0.300"

apt-get install -y --no-install-recommends \
    libc6 \
    libgcc1 \
    libgssapi-krb5-2 \
    libicu67 \
    libssl1.1 \
    libstdc++6 \
    zlib1g
cd ~
curl -LO https://download.visualstudio.microsoft.com/download/pr/dc930bff-ef3d-4f6f-8799-6eb60390f5b4/1efee2a8ea0180c94aff8f15eb3af981/dotnet-sdk-6.0.300-linux-x64.tar.gz
mkdir -p /opt/dotnet/6.0.300
tar -zxf dotnet-sdk-6.0.300-linux-x64.tar.gz -C /opt/dotnet/6.0.300
rm -rf dotnet-sdk-6.0.300-linux-x64.tar.gz


