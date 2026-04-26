# Lab 05 alt — Capstone (repo perso, freeform)

Lab final du parcours, **format capstone**. Tu sors du sandbox : tu poses
Claude Code sur ton vrai repo et tu livres une mission que **toi** tu as
scopée.

## Format

Pas de starter à compléter. Tu choisis un des 4 archétypes :

1. **Audit & rapport** — fan-out auditeurs sur ton repo
2. **Refactor guidé** — cycle UltraPlan/UltraReview sur un module pénible
3. **Agent custom** — subagent spécialisé pour une tâche récurrente
4. **Routine automatisée** — cron/webhook avec idempotence + DLQ

Tu remplis 4 fichiers Markdown :

```
work/
├── mission.md          ← repo cible, archétype, critères de succès
├── plan.md             ← étapes, budget temps, checks
├── session-log.md      ← journal des commandes + prompts
└── retrospective.md    ← marché / foiré / à retenir
```

## Démarrer

```bash
./setup.sh
cd work/
# Remplis mission.md d'abord. Puis plan.md.
# Puis tu lances Claude Code sur ton repo perso.
# Au fur et à mesure, tu remplis session-log.md.
# À la fin, retrospective.md.
```

## Valider

```bash
./validate.sh
```

Vérifie la **structure** des livrables, pas la correctness du code.

## Voir aussi

- [`solution/EXPLANATION.md`](solution/EXPLANATION.md) — capstone exemple ("Audit & rapport" sur claude-mastery lui-même)
- `hints/hint-01.md` — scoper la mission
- `hints/hint-02.md` — quand s'arrêter
- `hints/hint-03.md` — retrospective utile
