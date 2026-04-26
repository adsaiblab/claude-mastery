# Lab 03 alt — Fan-out audit multi-modules

**Niveau** : 03 Multi-agents · **Durée** : ~75 min · **Variant** du Lab 03

## Objectif

Auditer 3 services indépendants d'un monorepo en **parallèle** via fan-out, puis agréger.

Subagents :

- `auditor` (Read/Grep/Glob, strictement read-only) — produit `audit/<service>.md`
- `aggregator` (Read + Write contraint) — produit `audit-report.md` final

Une slash-command `/audit-all` orchestre :

1. Détection des services (`services/*`).
2. **Fan-out** : un `auditor` par service, en parallèle.
3. **Fan-in** : `aggregator` lit les rapports et fusionne.

Un hook `PreToolUse` empêche tout `auditor` qui dévierait d'écrire hors `audit/`.

## Prérequis

- `claude` CLI.
- `jq`.

## Énoncé

À partir du `starter/` :

1. Compléter `.claude/agents/auditor.md` (frontmatter strict + prompt court).
2. Compléter `.claude/agents/aggregator.md`.
3. Écrire `.claude/commands/audit-all.md` qui dispatche les 3 auditors **en parallèle**.
4. Écrire `.claude/hooks/guard-readonly.sh` qui bloque les écritures hors `audit/`.
5. Déclarer le hook `PreToolUse` dans `.claude/settings.json`.

## Validation

```bash
./setup.sh
./validate.sh
```

## Pourquoi fan-out plutôt que pipeline ?

- Le Lab 03 principal pipeline est **séquentiel** : Explorer → Planner → Implementer → Tester → Judge. Chaque étape dépend de la précédente.
- Ici, les 3 audits sont **indépendants**. La parallélisation divise la latence par N et **isole** la consommation de tokens dans chaque sous-fenêtre.
- C'est le pattern qu'utilisent les outils qui auditent des repos de 100+ modules sans saturer le context.
