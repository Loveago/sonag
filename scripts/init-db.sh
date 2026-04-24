#!/usr/bin/env bash
set -e
PW="${SUDO_PW:-Loverboy888@}"
# Cache sudo credentials first, then run multiple sudo without prompts
echo "$PW" | sudo -S -v
sudo -u postgres psql -p 5433 -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
if ! sudo -u postgres psql -p 5433 -tAc "SELECT 1 FROM pg_database WHERE datname='learnify'" | grep -q 1; then
  sudo -u postgres psql -p 5433 -c "CREATE DATABASE learnify;"
  echo "Database learnify created"
else
  echo "Database learnify already exists"
fi
echo "DB ready on port 5433"
