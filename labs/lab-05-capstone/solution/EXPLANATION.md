# Solution — Lab 05 alt (capstone)

Cette solution est un **capstone réel** posé sur le repo `claude-mastery`
lui-même, archétype « Audit & rapport ». L'objectif n'est pas d'être un
modèle universel — chaque archétype produit un capstone différent — mais
de montrer **à quoi ressemble une livraison freeform validée**.

## Pourquoi cet archétype et ce repo

`claude-mastery` venait d'atteindre un point de maturité (Sessions 1-8
livrées) sans relecture transverse. C'est le moment classique où un audit
externe a le plus de valeur : les angles morts du dev se sont accumulés,
mais le contenu est encore corrigible avant de figer la v1.

J'aurais pu prendre un autre archétype :

- **Refactor guidé** sur un module pénible : je n'avais pas de module
  pénible isolé — toute la complexité est éclatée dans le contenu MDX,
  pas dans le code.
- **Agent custom** : possible, mais j'en ai déjà 4 dans le repo (Lab 03 alt) —
  un 5ᵉ aurait été redondant.
- **Routine automatisée** : pas de besoin récurrent côté ce repo — c'est
  du contenu, pas un service.

L'archétype suit le **besoin du repo**, pas l'envie d'utiliser un pattern.

## Ce que la rétro a vraiment révélé

Trois choses non triviales que je n'aurais pas trouvées sans formaliser :

1. **Je sous-estime systématiquement les étapes en début de capstone.**
   Sur 5 étapes, 3 ont fini sous l'estimé. Pas par hasard — par habitude
   de gonfler le buffer initial. La calibration future : multiplier mes
   estimés par 0.7 pour les 2 premières étapes.

2. **Le hook `guard-readonly.sh` est devenu un actif réutilisable.**
   Posé pour le Lab 03 alt, copié ici en 30 secondes, il a payé son
   coût d'écriture en bloquant un dérapage réel. C'est exactement ce
   qui justifie la discipline de capitaliser les setups `.claude/`
   dans un repo de référence.

3. **Le pre-mortem manqué.** 5 minutes négligées en début ont coûté
   15 minutes de friction à 15:20. C'est le genre de leçon qui ne sort
   que si on tient un `session-log.md` honnête avec les heures.

## Pourquoi le validate.sh ne juge pas le code

Un capstone open-ended ne peut pas avoir de check binaire sur le livrable
réel — chaque archétype produit un output différent (rapport, PR, agent,
routine). Le validate vérifie donc **la structure de la livraison** :
les 4 fichiers existent, sont substantiels, et contiennent les sections
qui rendent une retro réutilisable.

C'est volontairement faible. Tu peux passer le validate avec des fichiers
remplis n'importe comment. Le vrai juge, c'est **toi dans 6 semaines** :
est-ce que ta retro te ressert ? Si oui, capstone réussi.

## Reproduire ce capstone

Si tu veux refaire celui-ci tel quel :

```bash
cd labs/lab-05-capstone && ./setup.sh
cp solution/{mission,plan}.md work/        # copie le scope
# Adapte mission.md à TON repo
# Lance Claude Code avec un setup .claude/ équivalent au Lab 03 alt
# Logge dans session-log.md au fur et à mesure
# Débriefe dans retrospective.md
./validate.sh
```

Mais **prends-toi un autre archétype** la fois suivante. Faire deux audits
de suite n'apprend rien — tu veux varier pour calibrer ton instinct sur
plusieurs patterns.
