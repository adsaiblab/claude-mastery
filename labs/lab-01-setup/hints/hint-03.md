# Hint 03 — Lab 01 (quasi-solution)

## CLAUDE.md minimal

```markdown
# Lab 01 — Starter

Petit module Node qui expose `greet(name)` et son test.

## Conventions
- ESM uniquement (`"type": "module"`).
- Tests via `node:test` + `node:assert/strict`. Aucune dépendance tierce.
- Nommage en anglais, messages utilisateur en français.

## Commandes
- `npm run dev` — lance `src/index.js`.
- `npm test` — exécute les tests.
```

## .claude/memory/project_context.md

```markdown
---
name: Contexte projet
description: Stack et contraintes du lab-01
type: project
---

Projet pédagogique pour apprendre CLAUDE.md + memory.
Contrainte : pas de dépendance npm, Node 20+.
```

## .claude/memory/MEMORY.md

```markdown
- [Contexte projet](project_context.md) — Node 20+, ESM, zéro dépendance.
```

## Lancement

```bash
cd work/
claude --name lab-01
# > "Résume en 3 points ce que tu as lu dans CLAUDE.md et la mémoire."
# Ctrl+D pour quitter
claude --resume       # reprends la session et vérifie qu'elle persiste
```
