# Hint 01 — Lab 04 alt

## Construire une clé d'idempotence

Une clé d'idempotence doit être :

- **Déterministe** : mêmes inputs → même clé. Pas de timestamp ni de uuid4.
- **Suffisamment spécifique** pour ne pas confondre 2 events distincts.
- **Suffisamment générale** pour reconnaître un retry du même event.

Pour la routine `daily-digest`, la clé est `(routine_name, date_du_jour)`.
Pour un webhook quelconque, ce serait `(event_type, business_id, optional_subject)`.

## Implémentation

```python
import hashlib

def build_key(*parts: str) -> str:
    raw = "|".join(parts).encode()
    return hashlib.sha256(raw).hexdigest()
```

## Pourquoi pas un set en mémoire ?

Un dict ou set Python perd tout au redémarrage du process. Si la routine crash après l'envoi mais avant le `mark_done`, au reboot elle rejoue → double envoi.

SQLite donne :
- Persistance (fichier).
- Atomicité (transaction `INSERT OR IGNORE`).
- Pas de daemon à gérer (vs Redis).

```python
import sqlite3

class IdempotenceStore:
    def __init__(self, path):
        self.conn = sqlite3.connect(path)
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS processed (key TEXT PRIMARY KEY, processed_at TEXT)"
        )
```
