# Hint 03 — Lab 03 (quasi-solution)

## `.claude/hooks/stop-if-low-score.sh`

```bash
#!/usr/bin/env bash
set -u
VERDICT="judge-verdict.json"
[ ! -f "$VERDICT" ] && exit 0
score=$(jq -r '.score // 0' "$VERDICT")
verdict=$(jq -r '.verdict // "fail"' "$VERDICT")
if [ "$verdict" = "pass" ] && [ "${score%.*}" -ge 7 ]; then
  exit 0
fi
comments=$(jq -r '.comments[]? // empty' "$VERDICT" | head -n 5)
cat >&2 <<EOF
Score $score / 10 (verdict: $verdict) — en-dessous du seuil de qualité.
Commentaires du judge :
$comments

Relance une itération en corrigeant les points ci-dessus.
EOF
exit 2
```

Dans `settings.json` :

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": ".claude/hooks/stop-if-low-score.sh" }] }
    ]
  }
}
```

## `.claude/commands/pipeline.md` (corps)

```markdown
Objectif : $ARGUMENTS

1. @explorer — cartographie le code, produis un résumé dans explorer-report.md.
2. @planner — lis explorer-report.md et produis plan.md (Objectif, Étapes, Risques, Critères).
3. @implementer — exécute plan.md. Ne modifie pas le plan.
4. @tester — lance `npm test`, écris test-report.md.
5. @judge — lis plan.md + test-report.md + le diff git, écris judge-verdict.json.

Ne passe à l'étape suivante que si la précédente a produit son artefact.
```
