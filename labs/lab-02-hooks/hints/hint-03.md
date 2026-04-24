# Hint 03 — Lab 02 (quasi-solution)

## `.claude/hooks/validate-push.sh`

```bash
#!/usr/bin/env bash
set -u
payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')

# On ne filtre que les git push
case "$cmd" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

# Détecte si la cible est main ou master
if echo "$cmd" | grep -Eq 'git push( +[-a-z]+)* +\S+ +(main|master)\b' \
   || echo "$cmd" | grep -Eq 'git push( +[-a-z]+)* +(main|master)\b'; then
  echo "✗ Push vers main/master interdit. Passe par une PR depuis une branche feature/*." >&2
  exit 2
fi

exit 0
```

## `.claude/hooks/format-file.sh`

```bash
#!/usr/bin/env bash
set -u
payload=$(cat)
file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_input.path // ""')
[ -z "$file" ] && exit 0
[ ! -f "$file" ] && exit 0

case "$file" in
  *.js|*.ts|*.tsx|*.jsx|*.json|*.md)
    command -v prettier >/dev/null && prettier --write "$file" >/dev/null 2>&1 ;;
  *.py)
    command -v black >/dev/null && black -q "$file" >/dev/null 2>&1 ;;
esac

exit 0
```

N'oublie pas : `chmod +x .claude/hooks/*.sh`.
