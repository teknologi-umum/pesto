#!/usr/bin/env bash

if [[ -d "/opt/erlang/25" ]]; then
  exit 0
fi

cd ~
apt-get install -y ncurses-bin libncurses-dev
curl -LO https://github.com/erlang/otp/releases/download/OTP-25.1.2/otp_src_25.1.2.tar.gz
tar -zxf otp_src_25.1.2.tar.gz
mkdir -p /opt/erlang/25/
cd otp_src_25.1.2
export ERL_TOP=`pwd`
./configure --prefix=/opt/erlang/25
make -j $(nproc)
make install -j $(nproc)
cd ~
rm -rf otp_src_25.1.2 otp_src_25.1.2.tar.gz
