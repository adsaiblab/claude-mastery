# Retrospective

## Ce qui a marché

- **Le fan-out 4 auditeurs en parallèle** — la première Agent call qui retourne
  est arrivée en 4 min, les 4 ont fini en 8 min. Sans fan-out, j'aurais mis 30
  min séquentiel. C'est exactement le pattern du Lab 03 alt, posé sur un cas réel.
- **Le hook `guard-readonly.sh` réutilisé** — j'ai juste copié celui du Lab 03 alt
  dans `.claude/hooks/`. Quand auditor-quiz a essayé d'éditer un MDX, blocage net.
  Defense-in-depth réelle, pas théorique.
- **Le critère de sortie anticipée à l'étape 4** — j'avais 11 risques solides à
  16:42, j'ai sauté le filtrage explicite. 30 min économisées sans perte de
  qualité.

## Ce qui a foiré

- **J'ai sous-estimé l'étape 1 de 100%** — prévu 30 min, réel 26 min.
  OK ça c'est pas un fail. Mais l'étape 5 prévue 45 min, réelle 32 min — j'ai
  été trop conservateur partout en early steps. Pattern habituel.
- **L'aggregator Sonnet a peiné sur 11 risques** — j'aurais dû partir Opus
  d'office pour la synthèse. J'ai perdu 15 min à comprendre pourquoi il
  reprenait toujours les 5 mêmes risques.
- **Pas de pre-mortem** — je n'ai pas écrit « qu'est-ce qui pourrait foirer »
  avant de lancer. Du coup je n'ai pas vu venir le problème de l'auditor-quiz
  qui voulait éditer.

## À retenir

- Quand je lance un fan-out d'auditeurs, je dis **explicitement** dans chaque
  prompt « ne modifie aucun fichier sauf `audit/<scope>.md` ». La liste blanche
  dans `tools:` ne suffit pas — Claude essaie quand même et le hook bloque,
  ce qui pollue le log. Mieux : prompt clair + tools réduits + hook (3 couches).
- Quand l'aggregator doit synthétiser ≥ 8 entrées hétérogènes, **je pars
  Opus directement**. Sonnet décroche systématiquement au-delà. +$0.30 vaut
  les 20 min sauvées.
- Quand j'audite mon propre repo, je **fixe un budget court** (4h max).
  La tentation d'auditer à fond est énorme, et l'ROI s'effondre passé le
  premier tour de risques.
- Avant de lancer un capstone, **je note 2 modes d'échec possibles** dans
  `plan.md`. Le pre-mortem prend 5 min et m'aurait évité 15 min de friction
  aujourd'hui.

## Comparaison budget vs réel

| Étape                  | Estimé | Réel | Delta |
|------------------------|--------|------|-------|
| 1 — Recensement        | 30 min | 26 min | -4 min |
| 2 — Fan-out auditeurs  | 1h30   | 1h33 | +3 min |
| 3 — Synthèse           | 45 min | 34 min | -11 min (sauté un sous-step) |
| 4 — Filtrage transverse| 30 min | 0 min | -30 min (sortie anticipée) |
| 5 — Mise en forme      | 45 min | 32 min | -13 min |

**Total : 4h estimé / 3h05 réel.** Sous budget de presque 1h. Soit j'ai
été pessimiste sur 3 étapes, soit j'ai eu de la chance sur le fan-out.

## Ce que je referais identique

- Fan-out 4 auditeurs avec scopes orthogonaux (pas de chevauchement majeur).
- Hook `guard-readonly.sh` posé d'office pour tout audit.
- Critère de sortie anticipée écrit dans `plan.md` **avant** de commencer.

## Ce que je changerais demain matin

- Pre-mortem 5 min avant le fan-out (« quels sont les 2 modes d'échec ? »).
- Aggregator en Opus directement (pas de tentative Sonnet).
- Section « Risques transverses » dans le rapport généré directement par
  l'aggregator, pas en post-traitement humain.
