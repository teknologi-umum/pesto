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

echo "Executing make"
make -j $(nproc)
echo "Executing ldconfig"
ldconfig
echo "Executing make install"
make install -j $(nproc)

cd ~
echo "Removing downlaoded files"
rm -rf sqlite-autoconf-3390400.tar.gz sqlite-autoconf-3390400

echo "Registering exec_sqlite3"
cat <<EOF > /opt/sqlite3/exec_sqlite3
#!/usr/bin/env bash

/opt/sqlite3/bin/sqlite3 < \$1
EOF

chmod +x /opt/sqlite3/exec_sqlite3

echo "Let's take a look at what's inside /opt/sqlite3"
ls /opt/sqlite3

echo "SQLite installation finished"
