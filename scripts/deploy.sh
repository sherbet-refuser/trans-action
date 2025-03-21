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
