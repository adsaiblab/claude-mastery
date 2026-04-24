#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"

echo "Lab 03 — Pipeline multi-agent"
echo "============================="

check_file "work/ existe (setup.sh lancé ?)" "$WORK/README.md"

for agent in explorer planner implementer tester judge; do
  f="$WORK/.claude/agents/$agent.md"
  check_file "Subagent $agent.md présent" "$f"
  check_contains "$agent a un frontmatter name" "$f" '^name:'
  check_contains "$agent a un frontmatter description" "$f" '^description:'
  check_contains "$agent déclare ses tools" "$f" '^tools:'
done

# Tools : explorer et judge doivent être read-only
if [ -f "$WORK/.claude/agents/explorer.md" ]; then
  if grep -Eq '^tools:.*\b(Edit|Write|Bash)\b' "$WORK/.claude/agents/explorer.md"; then
    cm_fail "explorer a des tools d'écriture — il doit être read-only" ""
  else
    cm_pass "explorer est bien read-only"
  fi
fi

check_file "Slash-command /pipeline présente" "$WORK/.claude/commands/pipeline.md"
check_contains "/pipeline mentionne les 5 subagents" "$WORK/.claude/commands/pipeline.md" '(explorer|planner|implementer|tester|judge)'

check_file "Hook stop-if-low-score.sh présent" "$WORK/.claude/hooks/stop-if-low-score.sh"
check_executable "Hook exécutable" "$WORK/.claude/hooks/stop-if-low-score.sh"
check_contains "settings.json enregistre le hook Stop" "$WORK/.claude/settings.json" '"Stop"'

report
