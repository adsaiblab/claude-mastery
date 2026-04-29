# Solution — Lab 03 alt (Fan-out audit)

## Ce que le lab teste

- **Fan-out** : N subagents indépendants en parallèle, pas en série. Tu as 3 services → 3 Agent calls dans le même message.
- **Fan-in** : un subagent agrégateur consomme les artefacts produits et synthétise.
- **Defense-in-depth** : restreindre les `tools:` ne suffit pas, un hook PreToolUse côté infra applique un garde-fou orthogonal.
- **Sortie déterministe** : score numérique extractible (regex `Score: N/10`) — l'aggregator peut trier sans LLM.

## Pourquoi pas un seul agent qui audite les 3 services en série ?

- **Context** : un seul agent qui lit 3 services charge ~3× plus dans sa fenêtre. Un fan-out → chaque auditor a sa fenêtre clean. Sur un repo réel (50+ modules), un agent monolithique ne tient tout simplement pas dans le context.
- **Latence** : 3 audits en parallèle ≈ durée d'un seul. Pour 10 services, le gain wall-clock est massif (≈ 10×).
- **Coût brut** : à priori égal côté tokens. Mais voir « cascade de modèles » plus bas.
- **Isolement** : si l'un dérive (essaie d'écrire), il ne contamine pas les autres. Le hook PreToolUse arrête l'agent fautif sans tuer les autres.

## Pourquoi PreToolUse même avec `tools:` restreint ?

| Risque | Restreindre `tools:` | Hook PreToolUse |
|--------|----------------------|-----------------|
| Auditor essaie Edit | bloqué (tool absent) | redondant mais OK |
| Nouveau subagent ajouté sans rigueur | non bloqué | bloqué |
| Bug Claude Code propose Write malgré la restriction | non bloqué | bloqué |
| Audit-trail des tentatives d'écriture | absent | log via stderr |

Le hook est **defense-in-depth**. Il intercepte l'écriture **après** la résolution des tools, donc même un subagent mal configuré reste contenu. C'est une sécurité côté infrastructure (configuration projet), pas côté modèle (configuration agent).

## Cascade de modèles : économie 60-70%

Le pattern fan-out se prête bien à une cascade :

| Rôle | Modèle | Pourquoi |
|------|--------|----------|
| auditor (N×) | `haiku` | Tâche factuelle bornée (lire un service, classer 0-10). Pas besoin de raisonnement long. |
| aggregator (1×) | `sonnet` ou `opus` | Synthèse transverse — repérer les concerns récurrents demande plus de jugement. |

Sur un audit de 10 services :
- **Tout sonnet** : 10 × $0.X (audits) + 1 × $0.Y (synthèse) ≈ $11.X
- **Cascade** : 10 × $0.0X (audits haiku, 5× moins cher) + 1 × $0.Y ≈ $4
- **Économie** : ~60-70%, pour une qualité d'audit comparable (ce sont des checks mécaniques).

Tu déclares le modèle dans le frontmatter du subagent :

```markdown
---
name: auditor
model: haiku
tools: Read, Grep, Glob
---
```

## Détection automatique des services

Hardcoder `auth, billing, notif` dans la slash-command marche pour ce lab, mais pas pour un monorepo qui évolue. Pattern adaptatif :

```markdown
---
description: Audit fan-out auto-détecté
allowed-tools: Read, Glob, Bash(ls:*)
---

1. Liste les services : `ls services/`
2. Pour chaque entrée, lance un Agent auditor en parallèle.
3. Une fois tous les `audit/<name>.md` produits, lance Agent aggregator.
```

Le `allowed-tools: Bash(ls:*)` autorise uniquement `ls` (pas `rm`, pas `curl`) — principe du moindre privilège côté slash-command.

## Mode `--changed-only`

Sur un monorepo de 50 services, tout auditer à chaque commit est gaspillé. Variante :

```bash
git diff --name-only HEAD~1 | grep '^services/' | cut -d/ -f1-2 | sort -u
```

Ne lance un auditor que sur les services touchés depuis le dernier commit. Sur un monorepo typique, on passe de 50 audits à 2-3 par push. L'aggregator peut comparer avec l'`audit-report.md` précédent (versionné) pour signaler les **régressions de score** spécifiquement.

## Pièges classiques

- **Fan-out faux** : enchaîner les `Agent()` sur des messages séparés → c'est du séquentiel. La parallélisation arrive quand on bat plusieurs `Agent()` dans un seul message tool-call. Vérification : timing wall-clock — N audits parallèles ≈ durée d'un seul, pas N×.
- **Aggregator avec Bash** : il pourrait lancer des scripts. Ici on ne donne que `Read, Write` — son seul job est de produire un rapport.
- **Glob `audit/*.md` permissif** : un service nommé `..` ou `audit/../etc` casse l'invariant. Le hook utilise `case "$file_path" in audit/*)` qui n'autorise que les chemins commençant **strictement** par `audit/`. Pas `audit/../etc`.
- **Stocker le résultat dans le repo** : `audit/` doit être gitignoré pour que les rapports ne polluent pas le diff. Ce qu'on commit, c'est `audit-report.md` (la synthèse), pas les rapports bruts.
- **Auditor qui écrit ailleurs malgré tout** : impossible si `tools: Read, Grep, Glob` sont les seuls déclarés. Mais si quelqu'un ajoute `Write` "juste pour debug", le hook PreToolUse rattrape — c'est le job de defense-in-depth.

## Debugging — comment savoir si quelque chose foire

1. **Aucun fichier dans `audit/`** : vérifier que l'auditor a `Write` dans ses tools (sinon il ne peut rien produire). Lire les logs stderr du hook — peut-être qu'il bloque la sortie. Note : le sujet du lab veut que `audit/` soit autorisé, donc `case audit/*) exit 0`.
2. **Rapport vide / incohérent** : le format de sortie n'est pas respecté. Renforcer la spec dans le prompt de l'auditor — donner un template strict avec `Score: N/10`. L'aggregator peut alors extraire par regex.
3. **Aggregator bloqué** : un auditor a planté ou tournée trop longtemps. Mettre un budget explicite dans le prompt auditor (« si > 5 min, écris ce que tu as et termine »).
4. **Scores aberrants** : auditor sur-pénalise. Calibrer en fournissant 2-3 exemples (« code parfait = 9-10 ; secret en dur = -3 points »). Pour un audit reproductible, fournir une rubrique précise.

## Pour aller plus loin

- **Streaming UI** : produire un placeholder `audit/<service>.md` avec « audit en cours » avant le fan-out, pour que l'utilisateur voie la progression sur le système de fichiers.
- **Audit incrémental** : versionner `audit-report.md`. À chaque run, l'aggregator compare avec le précédent et signale spécifiquement les **régressions** (score qui baisse). Permet de bloquer un PR qui dégrade un service.
- **Multi-langage** : un même `auditor` peut être paramétré pour JS, Python, Go via une variable dans le frontmatter. La cascade haiku/sonnet reste valable.
- **Aggregator en deux passes** : pass 1 = synthèse transverse ; pass 2 = priorisation actionnable (« quel risque attaquer en premier ? »). Permet à un humain d'arriver et de lire d'abord les actions plutôt que les scores bruts.

## Voir aussi

- [Pattern Fan-out](/architecture-patterns/fan-out/)
- [Hooks référence — PreToolUse](/reference/hooks-events/)
- [Subagents — frontmatter complet](/03-multi-agents/subagents/)
- Lab 03 (pipeline séquentiel) — comparer avec ce variant fan-out
