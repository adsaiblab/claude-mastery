# Solution — Lab 03 alt (Fan-out audit)

## Ce que le lab teste

- **Fan-out** : N subagents indépendants en parallèle, pas en série. Tu as 3 services → 3 Agent calls dans le même message.
- **Fan-in** : un subagent agrégateur consomme les artefacts produits et synthétise.
- **Defense-in-depth** : restreindre les `tools:` ne suffit pas, un hook PreToolUse côté infra applique un garde-fou orthogonal.
- **Sortie déterministe** : score numérique extractible (regex `Score: N/10`) — l'aggregator peut trier sans LLM.

## Pourquoi pas un seul agent qui audite les 3 services en série ?

- **Context** : un seul agent qui lit 3 services charge ~3× plus dans sa fenêtre. Un fan-out → chaque auditor a sa fenêtre clean.
- **Latence** : 3 audits en parallèle ≈ durée d'un seul.
- **Coût** : à priori égal, mais les fenêtres séparées permettent de descendre les auditors en `model: haiku` sans pénaliser l'aggregator (qui reste sur `sonnet` ou `opus`).
- **Isolement** : si l'un dérive (essaie d'écrire), il ne contamine pas les autres.

## Pourquoi PreToolUse même avec `tools:` restreint ?

| Risque | Restreindre tools | Hook PreToolUse |
|--------|-------------------|-----------------|
| Auditor essaie Edit | bloqué (tool absent) | redondant mais OK |
| Nouveau subagent ajouté sans rigueur | non bloqué | bloqué |
| Bug Claude Code propose Write malgré la restriction | non bloqué | bloqué |
| Audit-trail des tentatives d'écriture | absent | log via stderr |

Le hook est **defense-in-depth**. Il intercepte l'écriture **après** la résolution des tools, donc même un subagent mal configuré reste contenu.

## Pièges classiques

- **Fan-out faux** : enchaîner les `Agent()` sur des messages séparés → c'est du séquentiel. La parallélisation arrive quand on bat plusieurs `Agent()` dans un seul message.
- **Aggregator avec Bash** : il pourrait lancer des scripts. Ici on ne donne que `Read, Write` — son seul job est de produire un rapport.
- **Glob `audit/*.md` permissif** : un service nommé `..` ou `audit/../etc` casse l'invariant. Le hook utilise `case "$file_path" in audit/*)` qui n'autorise que les chemins commençant **strictement** par `audit/`.
- **Stocker le résultat dans le repo** : `audit/` doit être gitignoré pour que les rapports ne polluent pas le diff.

## Pour aller plus loin

- **Mode `--changed-only`** : utiliser `git diff --name-only` pour ne lancer un auditor que sur les services modifiés depuis le dernier commit. Sur un monorepo de 50 services, on passe de 50 audits à 2-3.
- **Cascade de modèles** : auditors en `haiku` (factuel, rapide), aggregator en `sonnet` (synthèse). Économie typique 60-70%.
- **Streaming** : produire un placeholder dans `audit/<service>.md` avant le fan-out, pour que l'utilisateur voie la progression en temps réel.

## Voir aussi

- [Pattern Fan-out](/architecture-patterns/fan-out/)
- [Hooks référence — PreToolUse](/reference/hooks-events/)
- Lab 03 (pipeline séquentiel) — comparer avec ce variant fan-out
