#!/usr/bin/env bash
# Daily Postgres backup: dumps to server/backups/, keeps 14 days.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/../backups" && pwd)"
mkdir -p "$DIR"
FILE="$DIR/aurelian-$(date +%Y%m%d-%H%M%S).sql.gz"
docker exec aurelian-pg pg_dump -U aurelian aurelian | gzip > "$FILE"
find "$DIR" -name 'aurelian-*.sql.gz' -mtime +14 -delete
echo "Backed up to $FILE"
