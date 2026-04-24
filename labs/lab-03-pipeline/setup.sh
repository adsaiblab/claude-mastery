#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$ROOT/work"
rm -rf "$WORK"
cp -R "$ROOT/starter" "$WORK"
echo "✓ Setup OK. Travaille dans : $WORK"
