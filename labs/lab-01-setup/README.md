# Lab 01 — First project setup

**Niveau** : 01 Fondations · **Durée** : ~45 min

## Objectif

Monter un projet Claude Code propre : un `CLAUDE.md` utile (pas trop, pas trop peu), une session nommée que tu peux reprendre, une mémoire persistante qui traverse les sessions.

## Prérequis

- `claude` CLI installé et authentifié (`claude --version`).
- `bash`, `git`, `grep`, `sed` disponibles.

## Énoncé

À partir du `starter/` fourni (un petit projet Node minimaliste), tu dois :

1. Initialiser un `CLAUDE.md` à la racine qui décrit (en 10-20 lignes max) :
   - le but du projet,
   - les conventions de code,
   - les commandes utiles (`npm run dev`, `npm test`).
2. Créer un dossier `memory/` dans `.claude/` avec un fichier d'index `MEMORY.md` et au moins une entrée typée (user, project, feedback, ou reference) dans un fichier séparé.
3. Lancer une session nommée avec `claude --name lab-01` et poser une question.
4. Fermer la session, puis la reprendre via `claude --resume` (ou `claude -c` si tu restes dans la foulée) — vérifier que Claude lit bien `CLAUDE.md` et la mémoire.

## Validation

```bash
./validate.sh
```

Tous les checks doivent passer (✓ vert).

## Hints

Consulte `hints/hint-01.md`, puis `hint-02.md`, puis `hint-03.md` en dernier recours.

## Solution

`solution/EXPLANATION.md` — à n'ouvrir qu'après avoir validé (ou vraiment bloqué).
