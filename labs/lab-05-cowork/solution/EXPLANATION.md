# Solution — Lab 05

## Ce que le lab teste

- **Faire la baseline avant tout** — un cycle qui ne bat pas son témoin n'a rien prouvé.
- **UltraReview ≠ polish** — review = challenge. Les hypothèses fausses s'attaquent ici, pas à l'implémentation.
- **Plan figé pendant implement** — si l'implementer diverge du plan, c'est le plan qu'il faut renforcer la prochaine fois, pas laisser l'implementer improviser.

## Pourquoi le cycle bat la baseline

Trois raisons typiques :
1. Le one-shot oublie des edge-cases (fuite mémoire, fenêtre glissante réelle vs fixe).
2. Le one-shot "sur-ingénieure" ou "sous-ingénieure" — le plan explicite le scope.
3. Les tests arrivent après coup dans le one-shot. Dans le cycle, les critères de test sont dans `plan.v2.md` dès le départ.

## Pièges

- **Plan trop abstrait** → l'implementer doit interpréter, la qualité du cycle retombe au niveau baseline.
- **UltraReview qui approuve sans challenger** → `plan.v2.md` ≈ `plan.md`, cycle inutile.
- **Judge qui note au feeling** → critères chiffrés obligatoires, cf. template hint-03.

## Pour aller plus loin

- Factorise le cycle en slash-command `/ultrapipe` pour le réutiliser sur d'autres modules.
- Ajoute une boucle : si cycle ne bat pas baseline de +1 point, re-itère plan.v3.md automatiquement via hook Stop.
