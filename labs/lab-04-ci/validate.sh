#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"
WF="$WORK/.github/workflows/claude-review.yml"

echo "Lab 04 — Claude in CI"
echo "====================="

check_file "work/ existe" "$WORK/README.md"
check_file "Workflow claude-review.yml présent" "$WF"

if [ -f "$WF" ]; then
  if command -v yamllint >/dev/null 2>&1; then
    check "YAML valide (yamllint)" "yamllint -d relaxed '$WF'"
  fi

  check_contains "Trigger pull_request configuré" "$WF" 'pull_request'
  check_contains "Secret ANTHROPIC_API_KEY référencé" "$WF" 'ANTHROPIC_API_KEY'
  check_contains "Step Claude ou action claude-code-action" "$WF" '(anthropics/claude-code-action|claude-agent-sdk|claude +-p)'
  check_contains "Post comment sur la PR" "$WF" '(gh pr comment|actions/github-script|peter-evans/create-or-update-comment)'
  check_contains "Gate sur score < seuil" "$WF" '(score|threshold)'
  check_contains "Bloque merge (exit 1 conditionnel ou required check)" "$WF" '(exit 1|failure\(\))'
fi

report
