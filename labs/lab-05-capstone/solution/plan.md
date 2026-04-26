# Plan

## Étapes

1. **Recensement** — lister les 6 niveaux + 6 labs, extraire 1 résumé/page (30 min)
2. **Fan-out auditeurs** — 4 subagents parallèles (cohérence pédagogique, qualité Quiz, densité Situation, navigation cross-niveau) — durée estimée : 1h30
3. **Synthèse** — aggregator merge les 4 rapports avec priorisation P0/P1/P2 — durée estimée : 45 min
4. **Filtrage transverse** — re-passe pour identifier les ≥ 3 risques transverses — durée estimée : 30 min
5. **Mise en forme finale** — `audit-report.md` 2 pages max — durée estimée : 45 min

## Points de check

- **Après étape 2** : ai-je au moins 12 risques bruts (avant filtrage) ?
  Si < 8, mes auditeurs sont trop cléments — je relance avec un prompt plus dur.
- **Après étape 3** : la priorisation P0/P1/P2 a-t-elle un P0 ? Si tout est P1,
  je n'ai pas vraiment priorisé — je revois.

## Critères de sortie anticipée

- Si après l'étape 2 j'ai déjà 8 risques excellents → je saute l'étape 4 et je vais en 5.
- Si l'aggregator (étape 3) tourne en rond > 15 min → je fais la synthèse à la main.
- Si je trouve un bug bloquant dans le build → arrêt + issue séparée, capstone pivote en mode « audit partiel ».

## Outils Claude que je vais utiliser

- 4 subagents `auditor-*` (read-only, Sonnet) avec scopes différents (pédago, quiz, situation, nav)
- 1 subagent `aggregator` (Opus, full tools) pour la synthèse
- Hook PreToolUse `guard-readonly.sh` (héritage du Lab 03 alt) pour empêcher les auditeurs d'écrire ailleurs que dans `audit/`
- Slash command `/audit-all` pour lancer le fan-out d'un coup
