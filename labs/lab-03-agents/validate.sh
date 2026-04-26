#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"

echo "Lab 03 alt — Fan-out audit multi-modules"
echo "========================================"

check_file "work/ existe (setup.sh lancé ?)" "$WORK/README.md"

# Subagents présents avec frontmatter
for agent in auditor aggregator; do
  f="$WORK/.claude/agents/$agent.md"
  check_file "Subagent $agent.md présent" "$f"
  check_contains "$agent a un frontmatter name" "$f" '^name:'
  check_contains "$agent a un frontmatter description" "$f" '^description:'
  check_contains "$agent déclare ses tools" "$f" '^tools:'
done

# auditor doit être strictement read-only
if [ -f "$WORK/.claude/agents/auditor.md" ]; then
  if grep -Eq '^tools:.*\b(Edit|Write|Bash)\b' "$WORK/.claude/agents/auditor.md"; then
    cm_fail "auditor a des tools d'écriture/exécution — il doit être read-only" ""
  else
    cm_pass "auditor est bien read-only (pas Edit/Write/Bash)"
  fi
fi

# aggregator a Write mais pas Bash
if [ -f "$WORK/.claude/agents/aggregator.md" ]; then
  if grep -Eq '^tools:.*\bWrite\b' "$WORK/.claude/agents/aggregator.md"; then
    cm_pass "aggregator déclare Write"
  else
    cm_fail "aggregator doit pouvoir écrire (Write)" ""
  fi
  if grep -Eq '^tools:.*\bBash\b' "$WORK/.claude/agents/aggregator.md"; then
    cm_fail "aggregator ne doit pas avoir Bash (juste écrire le rapport)" ""
  else
    cm_pass "aggregator n'a pas Bash"
  fi
fi

# Slash-command audit-all
CMD="$WORK/.claude/commands/audit-all.md"
check_file "Slash-command /audit-all présente" "$CMD"
check_contains "/audit-all mentionne auditor" "$CMD" '(auditor|@auditor)'
check_contains "/audit-all mentionne aggregator" "$CMD" '(aggregator|@aggregator)'
check_contains "/audit-all mentionne les services à auditer" "$CMD" '(auth|billing|notif|services/)'
check_contains "/audit-all évoque la parallélisation (fan-out)" "$CMD" '([Pp]arall|fan-?out|simultan|en même temps)'

# Hook PreToolUse garde-fou
HOOK="$WORK/.claude/hooks/guard-readonly.sh"
check_file "Hook guard-readonly.sh présent" "$HOOK"
check_executable "Hook exécutable" "$HOOK"
check_contains "Hook lit le payload JSON (jq ou stdin)" "$HOOK" '(jq|tool_input|file_path)'
check_contains "Hook autorise audit/" "$HOOK" 'audit/'
check_contains "Hook utilise exit 2 pour bloquer" "$HOOK" 'exit 2'

# settings.json
S="$WORK/.claude/settings.json"
check_file "settings.json présent" "$S"
check_contains "settings.json déclare PreToolUse" "$S" '"PreToolUse"'
check_contains "settings.json référence guard-readonly.sh" "$S" 'guard-readonly\.sh'

# Garde-fou actif : simulation d'un appel hostile
if [ -x "$HOOK" ]; then
  hostile='{"tool_name":"Write","tool_input":{"file_path":"services/auth/hack.txt","content":"x"}}'
  if echo "$hostile" | "$HOOK" >/dev/null 2>&1; then
    cm_fail "Hook laisse passer une écriture hors audit/ — garde-fou inactif" ""
  else
    cm_pass "Hook bloque bien une écriture hostile hors audit/"
  fi
  benign='{"tool_name":"Write","tool_input":{"file_path":"audit/auth.md","content":"x"}}'
  if echo "$benign" | "$HOOK" >/dev/null 2>&1; then
    cm_pass "Hook laisse passer une écriture légitime dans audit/"
  else
    cm_fail "Hook bloque une écriture légitime dans audit/" ""
  fi
fi

# Structure de services à auditer
for svc in auth billing notif; do
  check_file "Service $svc présent (cible d'audit)" "$WORK/services/$svc/index.js"
done

report
