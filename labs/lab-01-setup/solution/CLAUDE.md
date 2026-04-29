# Lab 01 — `greet` library

Petite lib Node.js qui exporte une fonction `greet(name)`. Sert de cobaye à la
mise en place de Claude Code sur un projet greenfield.

## Stack

- Node.js ESM (`"type": "module"`)
- Tests via `node --test` (pas de runner externe).

## Commandes

- `npm run dev` — exécute `src/index.js`.
- `npm test` — lance la suite `node --test src/*.test.js`.
- `npm install` à la première ouverture (aucune dépendance externe pour le moment).

## Conventions de code

- **Style** : 2 espaces, pas de point-virgule terminal optionnel — on les écrit.
- **Règle** : toute fonction exportée a un test dans `*.test.js` à côté.
- **Convention** : pas de `console.log` dans les fonctions exportées ; logger uniquement dans le bloc `import.meta.url === ...` du module principal.
- **Commits** : préfixe conventional (`feat:`, `fix:`, `chore:`, `test:`).

## Garde-fous Claude

- Ne pas toucher `package.json` sans demande explicite (lockfile sensible).
- Pour toute nouvelle fonction, créer le test avant l'implémentation.
- Si un test échoue, lire le diff complet avant de proposer un patch.
