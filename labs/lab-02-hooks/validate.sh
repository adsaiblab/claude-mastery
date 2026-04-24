#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"
SETTINGS="$WORK/.claude/settings.json"
PUSH_HOOK="$WORK/.claude/hooks/validate-push.sh"
FMT_HOOK="$WORK/.claude/hooks/format-file.sh"

echo "Lab 02 — Hooks pipeline"
echo "======================="

check_file "work/ existe (setup.sh lancé ?)" "$WORK/package.json"
check_file ".claude/settings.json présent" "$SETTINGS"

if [ -f "$SETTINGS" ]; then
  if command -v jq >/dev/null 2>&1; then
    check "settings.json est un JSON valide" "jq empty '$SETTINGS'"
    check "hook PreToolUse défini" "jq -e '.hooks.PreToolUse // empty | length > 0' '$SETTINGS'"
    check "hook PostToolUse défini" "jq -e '.hooks.PostToolUse // empty | length > 0' '$SETTINGS'"
  else
    check_contains "PreToolUse mentionné dans settings" "$SETTINGS" 'PreToolUse'
    check_contains "PostToolUse mentionné dans settings" "$SETTINGS" 'PostToolUse'
  fi
fi

check_file "Hook validate-push.sh présent" "$PUSH_HOOK"
check_executable "validate-push.sh exécutable" "$PUSH_HOOK"
check_file "Hook format-file.sh présent" "$FMT_HOOK"
check_executable "format-file.sh exécutable" "$FMT_HOOK"

# Scénario 1 : push vers main → doit exit != 0
if [ -x "$PUSH_HOOK" ]; then
  payload_main='{"tool_name":"Bash","tool_input":{"command":"git push origin main"}}'
  out=$(echo "$payload_main" | "$PUSH_HOOK" 2>&1); rc=$?
  if [ "$rc" -ne 0 ]; then
    cm_pass "Push vers main → hook bloque (exit $rc)"
  else
    cm_fail "Push vers main devrait être bloqué" "hook a retourné exit 0 : $out"
  fi

  # Scénario 2 : push vers feature/* → doit exit 0
  payload_feat='{"tool_name":"Bash","tool_input":{"command":"git push origin feature/lab-02"}}'
  out=$(echo "$payload_feat" | "$PUSH_HOOK" 2>&1); rc=$?
  if [ "$rc" -eq 0 ]; then
    cm_pass "Push vers feature/* → hook autorise (exit 0)"
  else
    cm_fail "Push vers feature/* devrait passer" "hook a retourné exit $rc : $out"
  fi

  # Scénario 3 : autre commande → doit exit 0
  payload_other='{"tool_name":"Bash","tool_input":{"command":"ls -la"}}'
  out=$(echo "$payload_other" | "$PUSH_HOOK" 2>&1); rc=$?
  if [ "$rc" -eq 0 ]; then
    cm_pass "Commande non-push → hook ignore (exit 0)"
  else
    cm_fail "Commande non-push devrait passer" "hook a retourné exit $rc : $out"
  fi
fi

report
