# Hint 01 — Lab 03 alt

## Fan-out via plusieurs Agent() dans un même message

Dans Claude Code, **plusieurs `Agent()` dans le même tool-call message s'exécutent en parallèle**. C'est le mécanisme de fan-out.

Ta slash-command `/audit-all` doit produire un message qui appelle :

```
[Agent: auditor sur services/auth]
[Agent: auditor sur services/billing]
[Agent: auditor sur services/notif]
```

Si tu chaînes les `Agent()` sur des messages différents, tu perds le parallélisme — tu refais du séquentiel cher.

## Détection des services

Si tu veux que la commande s'adapte à n'importe quel monorepo (et pas juste 3 services hardcodés) : utilise un `Bash(ls:*)` autorisé pour lister `services/*`, puis pour chaque ligne génère un `Agent()`.

## Agrégation après le fan-out

Le main attend la fin des 3 auditors (Claude Code les attend automatiquement avant de continuer), puis tu déclenches l'`Agent: aggregator` qui lit `audit/*.md`.
