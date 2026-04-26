---
description: Audit fan-out de tous les services du monorepo
allowed-tools: Read, Glob, Bash(ls:*)
---

Audit complet du monorepo en parallèle (pattern fan-out).

Services ciblés : auth, billing, notif (sous `services/*`).

## Étape 1 — fan-out

Lance **simultanément** un subagent auditor par service. Le même message doit contenir trois Agent calls parallèles (pas en série) :

- Agent auditor → service `auth` → produit `audit/auth.md`
- Agent auditor → service `billing` → produit `audit/billing.md`
- Agent auditor → service `notif` → produit `audit/notif.md`

## Étape 2 — fan-in

Quand les trois `audit/<service>.md` existent, lance Agent aggregator. Il lit tous les rapports et produit `audit-report.md` à la racine.

## Vérification finale

Affiche les scores extraits du rapport final. Ne modifie aucun code source.
