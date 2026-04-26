"""Store idempotence — clé déterministe + SQLite."""

import hashlib
import sqlite3
from datetime import datetime, timezone


def build_key(*parts: str) -> str:
    raw = "|".join(parts).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


class IdempotenceStore:
    def __init__(self, path: str):
        self.conn = sqlite3.connect(path, isolation_level=None, check_same_thread=False)
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS processed (key TEXT PRIMARY KEY, processed_at TEXT)"
        )

    def is_done(self, key: str) -> bool:
        cur = self.conn.execute("SELECT 1 FROM processed WHERE key = ?", (key,))
        return cur.fetchone() is not None

    def mark_done(self, key: str) -> None:
        ts = datetime.now(tz=timezone.utc).isoformat()
        self.conn.execute(
            "INSERT OR IGNORE INTO processed (key, processed_at) VALUES (?, ?)",
            (key, ts),
        )
