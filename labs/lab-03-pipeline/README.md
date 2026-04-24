# Lab 03 — Pipeline multi-agent

**Niveau** : 03 Multi-agents · **Durée** : ~90 min

## Objectif

Enchaîner 5 subagents spécialisés — **Explorer → Planner → Implementer → Tester → Judge** — pilotés par une slash-command `/pipeline`, avec un hook `Stop` qui relance si le score qualité du Judge est < 7.

## Prérequis

- `claude` CLI.
- `jq`.

## Énoncé

À partir du `starter/` :

1. Compléter les 5 fichiers `.claude/agents/*.md` (frontmatter + prompt).
2. Contraindre leurs tools (Explorer : read-only ; Implementer : Edit/Write/Bash ; Tester : Bash ; Judge : read-only).
3. Écrire `.claude/commands/pipeline.md` qui chaîne les 5 subagents via `@-mentions`.
4. Écrire `.claude/hooks/stop-if-low-score.sh` qui relit `judge-verdict.json` et relance si score < 7.
5. Tester sur le repo de démo fourni.

## Validation

```bash
./validate.sh
```
