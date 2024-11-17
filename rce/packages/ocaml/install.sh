#!/usr/bin/env bash

set -e

VERSION="2.1.5"
export OPAMROOT=/opt/ocaml/${VERSION}

mkdir -p /opt/ocaml/${VERSION}
cd /opt/ocaml/${VERSION}
echo "PWD: $PWD"

echo "Bootstrapping opam"

curl -L -o install-core.sh https://raw.githubusercontent.com/ocaml/opam/master/shell/install.sh
bash ./install-core.sh --version ${VERSION} <<EOF
/opt/ocaml/${VERSION}

EOF

echo "Initializing opam"

/opt/ocaml/${VERSION}/opam init <<EOF
Y

EOF

rm install-core.sh
