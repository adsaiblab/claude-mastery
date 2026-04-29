#!/usr/bin/env bash
# PostToolUse hook : reformate le fichier que Claude vient d'éditer.
#
# Reçoit un payload JSON sur stdin :
#   { "tool_name": "Edit"|"Write", "tool_input": { "file_path": "..." }, ... }
#
# Convention :
#   - exit 0 silencieux : succès ou rien à faire
#   - exit 1 : avertissement (on n'interrompt rien — c'est un PostToolUse)
#
# Stratégie : on dispatche selon l'extension. On ne plante jamais Claude
# si le formatter n'est pas installé — on log et on sort 0.

set -u

payload=$(cat)
file_path=$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
  exit 0
fi

case "$file_path" in
  *.js|*.mjs|*.cjs|*.ts|*.tsx|*.json|*.md|*.mdx|*.css)
    if command -v prettier >/dev/null 2>&1; then
      prettier --write --log-level=warn "$file_path" >/dev/null 2>&1 || true
    fi
    ;;
  *.py)
    if command -v ruff >/dev/null 2>&1; then
      ruff format "$file_path" >/dev/null 2>&1 || true
    elif command -v black >/dev/null 2>&1; then
      black --quiet "$file_path" >/dev/null 2>&1 || true
    fi
    ;;
  *.sh)
    if command -v shfmt >/dev/null 2>&1; then
      shfmt -w "$file_path" >/dev/null 2>&1 || true
    fi
    ;;
  *)
    # extension non gérée — pas d'erreur, on ne fait rien
    ;;
esac

exit 0
