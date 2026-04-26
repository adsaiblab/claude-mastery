#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORK="$ROOT/work"
rm -rf "$WORK"
cp -R "$ROOT/starter" "$WORK"
echo "✓ Setup OK. Travaille dans : $WORK"
echo ""
echo "Étape 1 — édite work/mission.md (5 min)"
echo "Étape 2 — édite work/plan.md (10 min)"
echo "Étape 3 — exécute la mission sur ton vrai repo, log dans session-log.md"
echo "Étape 4 — débriefe dans retrospective.md"
echo ""
echo "Quand prêt : ./validate.sh"
