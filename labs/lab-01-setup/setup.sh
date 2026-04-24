#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$ROOT/work"

echo "→ Préparation de $WORK (rm -rf + copie depuis starter/)"
rm -rf "$WORK"
cp -R "$ROOT/starter" "$WORK"
mkdir -p "$WORK/.claude"

cat <<EOF
✓ Setup terminé.

Travaille dans : $WORK
Quand tu as fini : $ROOT/validate.sh
EOF
