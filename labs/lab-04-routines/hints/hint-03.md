# Hint 03 — Lab 04 alt (quasi-solution)

## HMAC : `compare_digest` obligatoire

Comparer deux signatures avec `==` est vulnérable au **timing attack** : Python s'arrête au premier byte différent, leakant la position. `hmac.compare_digest` compare en temps constant.

```python
import hmac, hashlib

def verify_signature(body: bytes, signature: str) -> bool:
    expected = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## DLQ append-only

```python
import json
from pathlib import Path

def push_dlq(path: str, payload):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a") as f:
        f.write(json.dumps(payload, sort_keys=True) + "\n")
```

`sort_keys=True` rend les lignes diffables. `parents=True` évite de planter si le dossier n'existe pas.

## Orchestration `run_daily_digest`

```python
def run_daily_digest(store, today=None, generate=None, dlq_path="dlq.jsonl"):
    today = today or date.today()
    generate = generate or _real_generate
    key = build_key("daily-digest", today.isoformat())
    if store.is_done(key):
        return "skipped"

    @retry(max_attempts=3, base_delay=0.0)
    def _try():
        return generate()

    try:
        _try()
    except Exception as e:
        push_dlq(dlq_path, {"event": "daily-digest", "date": today.isoformat(), "error": str(e)})
        return "dlq"

    store.mark_done(key)
    return "ok"
```

## Test webhook : signature

Côté test, il faut **calculer la même signature** que le serveur attend :

```python
import hmac, hashlib
def sign(body: bytes, secret: bytes) -> str:
    return hmac.new(secret, body, hashlib.sha256).hexdigest()
```

Si tu vois 401 systématique, c'est que le `body` envoyé par `httpx`/TestClient diffère légèrement (whitespace, ordre clés JSON). Calcule la signature sur le **bytes exact** que tu vas envoyer.
