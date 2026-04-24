# Solution — Lab 01

> **À lire après avoir validé** (ou vraiment bloqué après les 3 hints).

## Ce que le lab teste

Trois réflexes fondamentaux :

1. **CLAUDE.md = contrat** — pas une description, un contrat que Claude lit à chaque démarrage. Tu mets les contraintes (conventions, outils, commandes). Pas le README.
2. **Mémoire typée** — `MEMORY.md` n'est qu'un index. La vraie mémoire est dans des fichiers séparés typés (`user`, `feedback`, `project`, `reference`). Ça survit entre sessions.
3. **Sessions nommées** — `--name` + `--resume` = tu peux fermer ton terminal sans perdre ton fil.

## Pourquoi ne pas tout mettre dans CLAUDE.md ?

`CLAUDE.md` charge à **chaque** session — coût tokens fixe. La mémoire charge à la demande. Règle : si la règle est universelle pour le projet → CLAUDE.md. Si c'est spécifique à toi / un incident / un pattern passé → mémoire.

## Pièges classiques

- `CLAUDE.md` qui duplique le `README.md` → bruit de context.
- `MEMORY.md` qui contient la mémoire elle-même (au lieu d'être un index) → grossit jusqu'à dépasser 200 lignes et être tronqué.
- Session non nommée → impossible à retrouver proprement.

## Pour aller plus loin

- Ajoute un champ `when_to_use` dans ton frontmatter de mémoire — ça aide Claude à décider quand la recharger.
- Lance `/compact` avant de fermer une grosse session.
