#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$ROOT/work"
rm -rf "$WORK"
mkdir -p "$WORK/baseline" "$WORK/cycle"
cp -R "$ROOT/starter/module-sample" "$WORK/baseline/"
cp -R "$ROOT/starter/module-sample" "$WORK/cycle/"
cp "$ROOT/starter/spec.md" "$WORK/spec.md"
echo "✓ Setup OK. Spec : $WORK/spec.md"
