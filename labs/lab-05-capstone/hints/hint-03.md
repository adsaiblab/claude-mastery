# Hint 03 — Retrospective utile (pas du journal)

## La rétro qui ne sert à rien

```markdown
## Ce qui a marché
- Claude a bien généré les tests
- C'était cool

## Ce qui a foiré
- J'ai perdu du temps
- Pas top

## À retenir
- Faire mieux la prochaine fois
```

Tu ne ressortiras **rien** de ça dans 3 semaines. C'est du
journal — pas une rétro.

## La rétro qui marche : décisions futures

Une bonne rétro produit des **règles d'action** que tu réutilises.
Format : *« Quand TRIGGER, je ferai/éviterai ACTION »*.

```markdown
## À retenir

- Quand je commence un audit fan-out sur un repo > 30 modules,
  je split en deux sessions plutôt qu'une seule (l'aggregator
  perd le fil au-delà).

- Quand Claude propose 3 architectures différentes en 10 min,
  c'est que mon contexte initial est flou — je m'arrête,
  je réécris la mission, je relance.

- Quand j'utilise un subagent custom avec `tools: [Read, Grep]`
  je n'oublie plus d'enlever Edit/Write — c'est arrivé 2 fois,
  je crée un template qui force la liste blanche.
```

Chaque ligne est exploitable **demain matin** sur un autre projet.

## La rétro de calibration

Le tableau **estimé vs réel** dans `retrospective.md` est crucial. Tu
vas découvrir :

- Tu sous-estimes systématiquement les étapes « setup ».
- Tu surestimes ce que Claude fait en one-shot sans cycle.
- Tu oublies le temps de relecture des diffs.

Ces biais sont **stables** — note-les. La prochaine fois tu multiplies
ton estimé par le delta moyen et tu seras 80% précis.

## Ce qui a foiré : sois précis

Pas « j'ai perdu du temps », mais :

> *« J'ai perdu 45 min à essayer de faire fonctionner le hook Stop sur
>   un agent qui n'écrivait pas dans `verdict.md` parce que j'avais
>   oublié de mettre `tools: [Write]` dans le frontmatter. La prochaine
>   fois, je teste l'agent avec `claude --agent <nom> "ping"` avant
>   de brancher le hook. »*

Concret = réutilisable. Vague = perdu.

## Le check de la 6ᵉ semaine

Si tu reviens sur ta retro dans 6 semaines, est-ce qu'elle te resert ?

- Les 3 décisions « Quand X, je Y » → oui.
- Le tableau estimé/réel → oui (calibration).
- « C'était cool / pas top » → non.

Filtre tout ce qui n'a pas de valeur 6 semaines après.
