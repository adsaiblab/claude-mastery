# Hint 02 — Savoir quand s'arrêter

## Le bug du « encore 30 minutes »

Sans critère explicite, tu rentres dans la boucle :

> « Encore 30 min et c'est nickel. »  
> *2h plus tard*  
> « Encore 30 min. »

Le capstone n'est pas un bench de productivité. C'est un exercice de
**discipline d'arrêt**.

## Trois critères de sortie anticipée

Dans `plan.md`, écris au moins 2 conditions qui te font **arrêter avant
la fin du budget** :

```markdown
## Critères de sortie anticipée

- Si après l'étape 2 le rapport contient déjà ≥ 8 risques utiles → arrêt + retro.
- Si Claude tourne en rond sur le même fichier > 20 min → arrêt + pivot.
- Si je découvre un risque P0 que je n'avais pas vu → arrêt + ouvre une issue, capstone à part.
```

Le 3ᵉ est important : si tu trouves quelque chose qui dépasse le scope,
tu **n'absorbes pas** dans le capstone courant.

## Le check des 50%

À 50% du budget temps, **arrête-toi 5 min** et réponds honnêtement :

1. Suis-je en avance, à l'heure, ou en retard sur le plan ?
2. Mes 3 critères de succès sont-ils encore atteignables en 50% restant ?
3. Si non — qu'est-ce que je sacrifie pour atterrir ?

Si tu ne peux pas répondre à (3), tu es en train de mentir à toi-même.
Coupe le critère le moins important et continue.

## Stop conditions techniques

Quelques signaux que **Claude n'est pas le bon outil** sur cette tâche :

- Tu écris plus de prompts que Claude n'écrit de code.
- Claude propose 3 solutions différentes au même problème en 10 min.
- Tu corriges plus que tu ne valides.
- La fenêtre de contexte est compactée et tu as perdu le fil 2 fois.

Dans ces cas : **note-le dans `session-log.md` comme dérapage** et
soit tu pivotes (autre archétype, autre angle), soit tu arrêtes.
C'est aussi une livraison valide — un capstone qui conclut « cet
archétype ne marche pas pour ce type de repo » est utile.

## Le piège du « presque fini »

Si à la fin du budget tu es à 90% — **arrête quand même**. Note dans la
retro « il manquait X ». Le 10% restant prend toujours 50% du temps.
Et le but du capstone est l'apprentissage de calibration, pas la
livraison parfaite.
