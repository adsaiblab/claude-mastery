# Lab 02 — Hooks pipeline

**Niveau** : 02 CLI Mastery · **Durée** : ~60 min

## Objectif

Mettre en place deux hooks :

1. **PreToolUse** — bloque tout `git push` vers `main` / `master`, laisse passer vers `feature/*`.
2. **PostToolUse** — auto-formate avec `prettier` (JS/TS/JSON/MD) ou `black` (Python) après `Edit` ou `Write`.

## Prérequis

- `claude` CLI installé.
- `jq` pour parser les payloads de hook.
- `prettier` et `black` disponibles (ou adaptés à ton env).

## Énoncé

À partir du `starter/` :

1. Définir les hooks `PreToolUse` et `PostToolUse` dans `.claude/settings.json`.
2. Créer `.claude/hooks/validate-push.sh` (exécutable).
3. Le hook doit lire le `tool_input` depuis stdin, extraire la commande, détecter `git push` vers main, et retourner **exit 2** avec un message sur stderr (qui sera renvoyé à Claude).
4. Créer `.claude/hooks/format-file.sh` qui formate automatiquement les fichiers édités selon leur extension.
5. Tester les 2 scénarios (push bloqué vs push autorisé).

## Validation

```bash
./validate.sh
```

## Hints

Consulte `hints/hint-01.md`, puis `hint-02.md`, puis `hint-03.md`.

## Solution

`solution/EXPLANATION.md`.
