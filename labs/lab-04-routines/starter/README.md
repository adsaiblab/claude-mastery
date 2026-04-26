# Routines — starter

Squelette à compléter. Voir `README.md` du lab parent pour l'énoncé complet.

```
routines/
├── daily_digest.py       ← entrypoint cron
├── webhook.py            ← FastAPI endpoint
└── lib/
    ├── idempotence.py    ← clé + store SQLite
    ├── retry.py          ← backoff exponentiel + jitter
    └── dlq.py            ← JSONL append
tests/                    ← pytest
crontab.example
requirements.txt
```
