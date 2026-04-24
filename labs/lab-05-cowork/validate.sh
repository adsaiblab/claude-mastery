#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"

echo "Lab 05 — Co-work sur projet réel"
echo "================================"

check_file "work/ existe (setup.sh lancé ?)" "$WORK/spec.md"
check_file "Baseline one-shot produite" "$WORK/baseline/module-sample/README.md"
check_file "Plan initial (UltraPlan)" "$WORK/plan.md"
check_file "Plan reviewé (UltraReview)" "$WORK/plan.v2.md"
check_file "Implémentation du cycle" "$WORK/cycle/module-sample/README.md"
check_file "verdict.json produit" "$WORK/verdict.json"
check_file "diff.md comparatif rédigé" "$WORK/diff.md"

if [ -f "$WORK/verdict.json" ]; then
  if command -v jq >/dev/null 2>&1; then
    check "verdict.json est du JSON valide" "jq empty '$WORK/verdict.json'"
    baseline=$(jq -r '.baseline.score // 0' "$WORK/verdict.json" 2>/dev/null || echo 0)
    cycle=$(jq -r '.cycle.score // 0' "$WORK/verdict.json" 2>/dev/null || echo 0)
    if awk "BEGIN{exit !($cycle > $baseline)}"; then
      cm_pass "Cycle ($cycle) score plus haut que baseline ($baseline)"
    else
      cm_fail "Cycle ($cycle) ne bat pas la baseline ($baseline)" "re-itère UltraPlan/UltraReview"
    fi
  fi
fi

# diff.md doit être non trivial
if [ -f "$WORK/diff.md" ]; then
  lines=$(grep -cv '^\s*$' "$WORK/diff.md" || true)
  if [ "$lines" -ge 15 ]; then
    cm_pass "diff.md substantiel ($lines lignes)"
  else
    cm_fail "diff.md trop court ($lines lignes)" "développe l'analyse comparative"
  fi
fi

report
