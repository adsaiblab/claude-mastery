# Solution — Lab 02

> **À lire après validation**.

## Ce que le lab teste

- **Payload stdin** : les hooks reçoivent du JSON, pas des args CLI.
- **Exit 2 sémantique** : c'est le **seul** code qui bloque l'outil avec un feedback à Claude. Exit 0 = OK, autre = warning ignoré.
- **Matcher large, filtre fin** : `matcher: "Bash"` attrape tout, le script décide si c'est un `git push` ou non. Ne pas mettre la logique métier dans le matcher.

## Pourquoi `exit 2` et pas un autre code ?

Convention Claude Code : `2` = "refus explicite, renvoie stderr à l'agent". Les autres codes deviennent des warnings silencieux — pire que rien, car Claude ne saura pas pourquoi son action a échoué.

## Pièges classiques

- **Oublier `chmod +x`** → hook ignoré sans erreur visible.
- **Matcher regex trop restrictif** (ex : `git push.*main`) → ne s'applique que si le match est exact sur `tool_name`, donc ça ne marche pas.
- **Formatter qui plante silencieusement** → toujours `2>&1` vers `/dev/null` et `exit 0` quoi qu'il arrive dans le format-file, sinon on bloque les Edit légitimes.
- **Hooks dans `~/.claude/settings.json`** → ils s'appliquent à **tous** les projets. Préfère `.claude/settings.json` local au projet.

## Pour aller plus loin

- Ajoute un hook `Stop` qui relance le pipeline si des tests cassent (cf. lab-03).
- Exporte la liste des branches protégées dans une variable d'env — plus maintenable que hardcode `main|master`.
