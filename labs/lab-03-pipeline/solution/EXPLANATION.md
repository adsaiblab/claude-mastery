# Solution — Lab 03

## Ce que le lab teste

- **Spécialisation via tools** : chaque subagent a un rôle unique, avec des tools minimaux. Un Explorer qui peut écrire = pas un Explorer, c'est un Implementer déguisé.
- **Artefacts intermédiaires** : la coordination passe par des fichiers (plan.md, verdict.json). Pas par la mémoire conversationnelle.
- **Hook Stop comme boucle qualité** : exit 2 relance Claude avec le feedback — c'est l'équivalent d'un `while score < 7`.

## Pourquoi pas un seul agent qui fait tout ?

- **Context** : chaque subagent a son propre context window, on ne pollue pas l'orchestrateur avec 50 fichiers lus.
- **Tools** : on peut donner des droits Edit/Bash au seul Implementer.
- **Lisibilité** : les artefacts (plan.md, verdict.json) servent aussi d'audit trail.

## Pièges classiques

- **Oublier `tools:` sur un subagent** → il hérite de tout, et le principe de moindre privilège s'effondre.
- **Judge avec Edit/Write** → il peut "corriger" au lieu de juger. Toujours read-only.
- **Hook Stop sans limite d'itérations** → boucle infinie potentielle. Tu peux ajouter un compteur dans un fichier `.iter` et exit 0 au-delà de N.

## Pour aller plus loin

- Exécute explorer + planner **en parallèle** (fan-out) quand la tâche est décomposable.
- Utilise `--model haiku` pour explorer (rapide, pas cher) et `--model opus` pour judger (rigoureux).
