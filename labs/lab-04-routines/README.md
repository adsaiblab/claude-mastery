# Lab 04 alt — Routines (cron + webhook + DLQ)

**Niveau** : 04 Production · **Durée** : ~90 min · **Variant** du Lab 04

## Objectif

Livrer une routine production-grade qui combine :

- **Cron quotidien** (`daily_digest.py`) avec idempotence par date.
- **Endpoint webhook** (`webhook.py`, FastAPI) avec HMAC.
- **lib/idempotence.py** — clé déterministe, store SQLite.
- **lib/retry.py** — `@retry` + backoff exponentiel + jitter.
- **lib/dlq.py** — push JSONL après échec persistant.
- **tests/** — pytest qui couvre les 4 patterns.

## Prérequis

- Python 3.11+.
- `pytest`, `fastapi`, `httpx` (installés via `requirements.txt`).

## Énoncé

À partir du `starter/` :

1. Compléter `lib/idempotence.py` (clé + store SQLite + `mark_done`/`is_done`).
2. Compléter `lib/retry.py` (décorateur retry + backoff exponentiel + jitter).
3. Compléter `lib/dlq.py` (append JSONL).
4. Compléter `daily_digest.py` (orchestre les 3 lib).
5. Compléter `webhook.py` (FastAPI + verify HMAC).
6. Faire passer `tests/`.

## Validation

```bash
./setup.sh
cd work/
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ..
./validate.sh
```

## Pourquoi ce lab ?

Le module **routines** du niveau 04 décrit ces patterns. Le lab les fait **incarner dans du code** —
si tu peux écrire ces 4 lib de tête, tu sais déployer une routine sans surprise. Si tu sèches,
tu reviens à la doc.
