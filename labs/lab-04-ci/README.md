# Lab 04 — Claude in CI

**Niveau** : 04 Production · **Durée** : ~75 min

## Objectif

Déployer un GitHub Action qui review chaque PR avec Claude, poste un commentaire formaté avec score 0-10, et bloque le merge si score < 7.

## Prérequis

- Compte GitHub + repo perso pour tester.
- Secret `ANTHROPIC_API_KEY` dans le repo.
- `act` pour exécuter localement (optionnel mais recommandé).
- `yamllint` pour la validation.

## Énoncé

À partir du `starter/` (workflow YAML incomplet + PR de démo) :

1. Compléter `.github/workflows/claude-review.yml` (trigger `pull_request`, checkout, step Claude).
2. Écrire un prompt de review structuré qui renvoie du JSON (`{score, summary, comments[]}`).
3. Parser la sortie et poster un commentaire de PR formaté.
4. Activer un required check qui échoue si `score < 7`.
5. Tester via `act` ou sur une vraie PR.

## Validation

```bash
./validate.sh
```
