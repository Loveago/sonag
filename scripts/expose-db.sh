#!/usr/bin/env bash
set -e
PW="${SUDO_PW:-Loverboy888@}"
echo "$PW" | sudo -S -v

CONF=/etc/postgresql/16/main/postgresql.conf
HBA=/etc/postgresql/16/main/pg_hba.conf

# Listen on all interfaces
sudo sed -i "s/^#\?listen_addresses.*/listen_addresses = '*'/" "$CONF"
# Allow password auth from any host (dev only)
if ! sudo grep -q "host all all 0.0.0.0/0 md5" "$HBA"; then
  echo "host all all 0.0.0.0/0 md5" | sudo tee -a "$HBA" >/dev/null
fi
sudo service postgresql restart
# Wait for readiness
for i in $(seq 1 30); do
  if pg_isready -h 127.0.0.1 -p 5433 >/dev/null 2>&1; then
    echo "OK: postgres listening on *:5433"
    exit 0
  fi
  sleep 2
done
echo "Timed out waiting for postgres"; exit 1
