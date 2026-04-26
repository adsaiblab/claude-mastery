# Hint 03 — Lab 03 alt (quasi-solution)

## `.claude/hooks/guard-readonly.sh`

```bash
#!/usr/bin/env bash
set -u
payload=$(cat)
tool_name=$(echo "$payload" | jq -r '.tool_name // ""')
case "$tool_name" in
  Edit|Write) ;;
  *) exit 0 ;;
esac
file_path=$(echo "$payload" | jq -r '.tool_input.file_path // ""')
case "$file_path" in
  audit/*) exit 0 ;;
  *)
    echo "guard-readonly: écriture refusée hors audit/ (cible: $file_path)" >&2
    exit 2
    ;;
esac
```

## `.claude/agents/auditor.md`

```markdown
---
name: auditor
description: Audit a single service in services/<name>/. Read-only. Produces audit/<name>.md.
tools: Read, Grep, Glob
model: sonnet
---
Tu reçois un service ciblé en argument. Lis exclusivement ce service.
Sortie attendue dans `audit/<service>.md` :

# Audit — <service>
Score: N/10
## Top 3 risques
- ...
## 3 quick wins
- ...

Reste factuel, cite ligne:colonne quand possible.
```

## `.claude/agents/aggregator.md`

```markdown
---
name: aggregator
description: Use after auditors to merge audit/*.md into audit-report.md.
tools: Read, Write
model: sonnet
---
Lis tous les fichiers `audit/*.md`.
Produis `audit-report.md` :

| Service | Score | Top risque |
|---------|-------|-----------|
| ... | ... | ... |

## Concerns transverses
- ...

Trie par score croissant (les pires en haut).
```

## `.claude/commands/audit-all.md`

```markdown
---
description: Audit fan-out de tous les services
allowed-tools: Read, Glob, Bash(ls:*)
---

Audit de tous les services en parallèle.

Étapes :
1. Lance simultanément (parallèle, fan-out) :
   - Agent auditor → service auth
   - Agent auditor → service billing
   - Agent auditor → service notif
2. Une fois les 3 audit/<service>.md produits, lance Agent aggregator pour générer audit-report.md.
```
