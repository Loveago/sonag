#!/usr/bin/env bash
set -e
PW="${SUDO_PW:-Loverboy888@}"
echo "$PW" | sudo -S service postgresql start
echo "$PW" | sudo -S -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
ALTER USER postgres WITH PASSWORD 'postgres';
SELECT 'CREATE DATABASE learnify' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='learnify')\gexec
SQL
echo "OK: postgres running, db learnify ready"
pg_isready -h 127.0.0.1 -p 5432 || true
