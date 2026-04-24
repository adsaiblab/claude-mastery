#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"

echo "Lab 01 — First project setup"
echo "============================="

check_file "work/ existe (as-tu lancé setup.sh ?)" "$WORK/package.json"
check_file "CLAUDE.md présent à la racine du projet" "$WORK/CLAUDE.md"
check_contains "CLAUDE.md mentionne les commandes npm" "$WORK/CLAUDE.md" "npm (run|test|install)"
check_contains "CLAUDE.md décrit les conventions" "$WORK/CLAUDE.md" "(convention|style|règle|rule)"

# Taille raisonnable : > 5 lignes non vides, < 80 lignes
if [ -f "$WORK/CLAUDE.md" ]; then
  lines=$(grep -cv '^\s*$' "$WORK/CLAUDE.md" || true)
  if [ "$lines" -ge 5 ] && [ "$lines" -le 80 ]; then
    cm_pass "CLAUDE.md a une taille raisonnable ($lines lignes non vides, cible 5-80)"
  else
    cm_fail "CLAUDE.md trop court ou trop long" "$lines lignes non vides — vise 5-80"
  fi
fi

check_file "Dossier .claude/memory/ créé" "$WORK/.claude/memory/MEMORY.md"
# Au moins un autre fichier .md dans memory/ en plus de MEMORY.md
if [ -d "$WORK/.claude/memory" ]; then
  count=$(find "$WORK/.claude/memory" -maxdepth 1 -name '*.md' ! -name 'MEMORY.md' | wc -l | tr -d ' ')
  if [ "$count" -ge 1 ]; then
    cm_pass "Au moins un fichier de mémoire typée présent (en plus de MEMORY.md)"
  else
    cm_fail "Aucun fichier de mémoire typée dans .claude/memory/" "attendu : user/feedback/project/reference"
  fi
fi

# MEMORY.md doit pointer vers le(s) fichier(s)
check_contains "MEMORY.md référence au moins un fichier memory typé" "$WORK/.claude/memory/MEMORY.md" '\]\([^)]+\.md\)'

# Session reprenable (présence de projects/ ou logs dans ~/.claude)
if [ -d "$HOME/.claude/projects" ]; then
  cm_pass "~/.claude/projects/ existe (sessions Claude trouvées)"
else
  cm_fail "~/.claude/projects/ absent" "lance 'claude --name lab-01' au moins une fois dans $WORK"
fi

report
