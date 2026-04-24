# Lab 05 — Co-work sur projet réel

**Niveau** : 05 Expert · **Durée** : ~120 min

## Objectif

Exécuter un cycle complet **UltraPlan → UltraReview → Implement → Judge** sur un module existant, et comparer la qualité vs une approche "one-shot".

## Prérequis

- `claude` CLI + un projet à toi (tu peux utiliser `starter/` comme module d'exercice).
- Patience : ce lab est long et itératif.

## Énoncé

À partir du module fourni (`starter/module-sample/`) :

1. **Baseline one-shot** : demande à Claude d'implémenter la feature demandée en une seule conversation. Sauvegarde le résultat dans `work/baseline/`.
2. **UltraPlan** : sous-agent dédié qui produit `plan.md` structuré (hypothèses, étapes, risques, critères).
3. **UltraReview** : sous-agent challenger qui critique le plan et produit `plan.v2.md`.
4. **Implement** : sous-agent qui exécute `plan.v2.md` figé. Sauvegarde dans `work/cycle/`.
5. **Judge** : évalue baseline vs cycle sur 5 critères (correction, lisibilité, testabilité, extensibilité, alignement spec) → `verdict.json`.
6. Rédige `work/diff.md` comparant les deux versions.

## Validation

```bash
./validate.sh
```

Le cycle doit **scorer plus haut que la baseline**. Sinon, le lab n'est pas validé — re-itère.
