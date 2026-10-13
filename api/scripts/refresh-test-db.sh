#!/usr/bin/env bash
# Clones the live `novette` database into `novette_test` for the PHPUnit suite.
# Usage: sudo bash scripts/refresh-test-db.sh
set -euo pipefail
SRC="${1:-novette}"
DST="${2:-novette_test}"
mysql -e "DROP DATABASE IF EXISTS \`$DST\`; CREATE DATABASE \`$DST\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON \`$DST\`.* TO 'novette'@'localhost';"
mysqldump --single-transaction "$SRC" | mysql "$DST"
echo "Cloned $SRC -> $DST"
