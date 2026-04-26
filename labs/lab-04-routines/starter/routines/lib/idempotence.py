"""Store idempotence — clé déterministe + SQLite.

API attendue :

    store = IdempotenceStore("idempotence.db")
    key = build_key("daily-digest", "2026-04-26")
    if store.is_done(key):
        return  # déjà traité, no-op
    ...
    store.mark_done(key)
"""

import hashlib
import sqlite3
from typing import Optional


def build_key(*parts: str) -> str:
    """TODO — produire un hash déterministe à partir des parts.

    Exigences :
    - Stable : mêmes parts → même clé.
    - Pas de timestamp ou random.
    - sha256 hex digest sur les parts join('|').
    """
    raise NotImplementedError


class IdempotenceStore:
    """TODO — store SQLite append-only.

    Exigences :
    - Table `processed(key TEXT PRIMARY KEY, processed_at TEXT)`.
    - is_done(key) -> bool.
    - mark_done(key) -> None  (no-op si déjà présent).
    """

    def __init__(self, path: str):
        raise NotImplementedError

    def is_done(self, key: str) -> bool:
        raise NotImplementedError

    def mark_done(self, key: str) -> None:
        raise NotImplementedError
