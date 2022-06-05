#!/usr/bin/env bash

apt-get install -y apt-transport-https lsb-release ca-certificates curl

curl -LO https://packages.sury.org/php/apt.gpg

mv -v apt.gpg /etc/apt/trusted.gpg.d/php.gpg

sh -c 'echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list'

apt-get update -y

apt-get install -y php8.1
