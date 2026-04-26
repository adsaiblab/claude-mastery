---
description: Audit fan-out de tous les services du monorepo
allowed-tools: Read, Glob, Bash(ls:*)
---

TODO : décris ici l'orchestration.

Indications :

1. Lister `services/*` (ou hardcoder auth, billing, notif).
2. Dispatcher **en parallèle** un subagent `auditor` par service.
3. Une fois les 3 rapports produits, déléguer à `aggregator` pour le merge final.

Astuce : un même message peut contenir plusieurs `Agent()` — ils s'exécutent en parallèle.
