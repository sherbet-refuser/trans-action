#!/bin/bash
set -e

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <user@remote_host>"
  exit 1
fi

REMOTE="$1"

# Sync project files (excluding git and node_modules)
rsync \
    -avz \
    --exclude 'backend/db' \
    --exclude 'node_modules' \
    --delete-after \
    ./ \
    "$REMOTE:~/trans-action"

# Connect to remote host, take down running services and then run docker-compose.
ssh "$REMOTE" <<EOF
  set -e
  cd trans-action
  ./scripts/backup_database.sh
  ./scripts/migrateDb.cjs
  docker compose down
  docker compose build
  NODE_ENV=production docker compose up --detach
  sleep 5
  docker compose top
EOF
