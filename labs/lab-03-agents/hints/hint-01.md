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

## Comment vérifier que le fan-out a bien eu lieu en parallèle

Trois indices concrets :

1. **Timing wall-clock** : un seul service prend ~30 s à auditer ; trois en parallèle prennent ~30-35 s. Si tu mesures 90 s, c'est du séquentiel.
2. **Logs Claude Code** : les Agent calls parallèles apparaissent groupés dans la transcript (un seul tool-call message émet N agents). Trois messages distincts qui défilent à la suite = série.
3. **Ordre de complétion non-déterministe** : `audit/billing.md` peut apparaître avant `audit/auth.md` même si auth est cité en premier dans la commande. C'est un signal que le fan-out fonctionne — chaque agent termine quand il termine.

## Limites pratiques du fan-out

- **Quota tokens parallèle** : chaque Agent ouvre une fenêtre indépendante. Lancer 50 auditors d'un coup peut saturer le compte API. Cap raisonnable : 5-10 en même temps, batch au-delà.
- **Timeout par agent** : un auditor qui boucle bloque le `aggregator` qui attend tout le monde. Mets un budget explicite dans le prompt de l'auditor (« si tu dépasses 5 min, abandonne et écris ce que tu as »).
- **Coût mémoire context du main** : le main reçoit les `final_message` de chaque sous-agent. À 10 KB par auditor × 50, le main hérite de 500 KB de synthèse. L'`aggregator` est précisément là pour absorber ce flux et produire un seul rapport.

## Détection automatique des services

Si tu veux que la commande s'adapte à n'importe quel monorepo (et pas juste 3 services hardcodés) : utilise un `Bash(ls:*)` autorisé pour lister `services/*`, puis pour chaque ligne génère un `Agent()`.

```markdown
---
description: Audit fan-out — auto-détection des services
allowed-tools: Read, Glob, Bash(ls:*)
---

1. Liste les services : `ls services/`
2. Pour chaque entrée, lance un Agent auditor en parallèle (un seul message, N tool calls).
3. Une fois tous les `audit/<name>.md` produits, lance Agent aggregator.
```

Avec cette forme, la même commande marche pour 3 services comme pour 30.

## Agrégation après le fan-out

Le main attend la fin des N auditors (Claude Code les attend automatiquement avant de continuer), puis tu déclenches l'`Agent: aggregator` qui lit `audit/*.md`.

L'aggregator n'a **pas** besoin d'être en parallèle — c'est par définition un fan-in séquentiel : un seul agent qui lit toutes les sorties. C'est la forme normale d'un map-reduce : map en parallèle, reduce en série.
