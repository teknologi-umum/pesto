#!/usr/bin/env bash

cd ~

curl -LO https://www.sqlite.org/2022/sqlite-autoconf-3390400.tar.gz
tar -zxf sqlite-autoconf-3390400.tar.gz

cd sqlite-autoconf-3390400

mkdir -p /opt/sqlite3
./configure --prefix=/opt/sqlite3

LIBDIR=/opt/sqlite3/lib

export LD_RUN_PATH=$LD_RUN_PATH:$LIBDIR
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LIBDIR

make -j $(nproc)
ldconfig
make install -j $(nproc)

cd ..

rm -rf sqlite-autoconf-3390400.tar.gz sqlite-autoconf-3390400

cat <<EOF > /opt/sqlite3/exec_sqlite3
#!/usr/bin/bash

/opt/sqlite3/bin/sqlite3 < \$1
EOF

chmod +x /opt/sqlite3/exec_sqlite3
