# Solution — Lab 04 alt (routines)

## Idempotence : pourquoi SQLite et pas un dict

Un `dict` en mémoire perd tout au prochain redémarrage. La routine doit être
idempotente **à travers les redémarrages**, sinon un crash après `generate()`
mais avant `mark_done()` → digest envoyé deux fois le lendemain.

SQLite donne :
- persistance disque,
- `INSERT OR IGNORE` atomique → pas de race entre deux runs concurrents,
- aucun service externe à provisionner.

Pour de la prod multi-instances on remplacerait par Postgres ou Redis (avec
`SET NX`), mais pour une routine cron mono-process, SQLite suffit.

La clé est `sha256("daily-digest|2026-04-26")` — déterministe, jamais
dépendante de `time.time()` ou d'un UUID. Si tu utilises un timestamp, tu
n'es pas idempotent : tu es juste « unique par run ».

## Retry : backoff exponentiel + jitter

Formule :

```
delay = min(max_delay, base_delay * 2 ** attempt) + uniform(0, base_delay)
```

- **Exponentiel** : si l'API distante est saturée, espacer les retries lui
  laisse le temps de se remettre. Linéaire (1s, 2s, 3s) reste agressif.
- **Jitter** (le `uniform(0, base_delay)`) : sans lui, 1000 clients qui
  retry à la même seconde se retapent dans la gueule au même moment →
  *thundering herd*. Le jitter étale les retries sur une fenêtre.
- **Cap** : `max_delay` évite qu'à l'attempt 10 on attende 17 minutes.

`max_attempts=3` est volontaire : au-delà, c'est probablement une erreur
permanente (mauvais secret, schéma changé) — on push en DLQ et on alerte.

## DLQ : JSONL append-only

Format :

```jsonl
{"date": "2026-04-26", "error": "timeout", "event": "daily-digest"}
{"date": "2026-04-27", "error": "401", "event": "daily-digest"}
```

- **JSONL** (un objet par ligne) : `tail -f`, `grep`, `jq` marchent
  directement. Pas besoin de parser un array géant.
- **Append-only** : aucun risque de corrompre les lignes précédentes si on
  crash en plein write. `with open(..., "a")` est atomique pour des writes
  < 4KB sur la plupart des FS.
- **`sort_keys=True`** : les diffs entre deux DLQ deviennent lisibles.

Pour la prod tu remplacerais par une vraie queue (SQS, RabbitMQ DLX). Mais
pour démarrer, un fichier JSONL versionné dans un volume Docker fait le
boulot et reste auditable.

## HMAC : `compare_digest` obligatoire

```python
return hmac.compare_digest(expected, signature)
```

Pas `==`. Python s'arrête au premier byte différent → un attaquant peut
mesurer le temps de réponse et reconstruire la signature byte par byte
(timing attack). `compare_digest` compare en temps constant.

Le secret vit dans `os.environ` — jamais dans le code, jamais dans Git.

## Cron : la subtilité du `cd`

```cron
0 6 * * * cd /opt/routines && /opt/routines/.venv/bin/python -m routines.daily_digest
```

Sans le `cd`, le `idempotence.db` est créé dans `/` (cwd de cron). Le
lendemain, cron repart de `/`, ne voit pas la base de la veille → pas
idempotent. Le `cd` ancre le cwd ; le path explicite vers `.venv/bin/python`
évite de dépendre du `PATH` de cron (souvent minimal).

## Tests : pourquoi `monkeypatch` + `importlib.reload`

`webhook.py` lit `WEBHOOK_SECRET` au moment de l'import. Si le test set
l'env var **après** l'import, le module a déjà capturé l'ancienne valeur.
`importlib.reload(webhook)` force la relecture avec le nouveau secret.

Alternative plus propre : ne pas lire l'env au top-level, mais dans une
factory `create_app()`. Pour ce lab on garde le pattern « simple module »
— juste, faut comprendre la nuance.
