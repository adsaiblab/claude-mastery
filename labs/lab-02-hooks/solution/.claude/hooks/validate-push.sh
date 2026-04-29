#!/usr/bin/env bash
# PreToolUse hook : intercepte les Bash et bloque tout push direct vers main.
#
# Reçoit un payload JSON sur stdin :
#   { "tool_name": "Bash", "tool_input": { "command": "git push origin main" }, ... }
#
# Convention :
#   - exit 0 → autorise
#   - exit != 0 (typiquement 2) → bloque, le stderr remonte à Claude
#
# Stratégie : on n'analyse que les Bash. On laisse passer toute commande non-push.
# Pour les `git push`, on autorise feature/*, hotfix/*, fix/*, dev — on refuse main et master.

set -u

payload=$(cat)

# Lecture sans dépendance externe : on extrait command via grep/sed.
# (En prod on utiliserait jq, mais le hook doit fonctionner sans dépendance.)
tool_name=$(printf '%s' "$payload" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
command=$(printf '%s' "$payload" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

# Pas un Bash → on ne se mêle pas
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# Pas un git push → on ne se mêle pas
case "$command" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

# Push vers main/master → on bloque.
# On accepte les variantes: `git push`, `git push origin`, `git push origin main`, etc.
if echo "$command" | grep -Eq '(^|[[:space:]])(main|master)([[:space:]]|$)'; then
  echo "Push direct vers main/master refusé. Crée une branche feature/* et passe par une PR." >&2
  exit 2
fi

# `git push` sans arg → potentiellement risqué selon push.default ; on refuse aussi.
if echo "$command" | grep -Eq '^[[:space:]]*git[[:space:]]+push[[:space:]]*$'; then
  echo "Push sans cible explicite refusé — précise la branche (git push origin feature/...)." >&2
  exit 2
fi

# Sinon (feature/*, fix/*, autre branche explicite) → autorisé
exit 0
