"""Routine cron : digest quotidien des PRs du repo."""

from datetime import date
from typing import Callable, Optional

from .lib.dlq import push_dlq
from .lib.idempotence import IdempotenceStore, build_key
from .lib.retry import retry


def _real_generate() -> str:
    return "digest généré"


def run_daily_digest(
    store: IdempotenceStore,
    today: Optional[date] = None,
    generate: Optional[Callable[[], str]] = None,
    dlq_path: str = "dlq.jsonl",
) -> str:
    today = today or date.today()
    generate = generate or _real_generate
    key = build_key("daily-digest", today.isoformat())

    if store.is_done(key):
        return "skipped"

    @retry(max_attempts=3, base_delay=0.0)
    def _try() -> str:
        return generate()

    try:
        _try()
    except Exception as exc:
        push_dlq(
            dlq_path,
            {
                "event": "daily-digest",
                "date": today.isoformat(),
                "error": str(exc),
            },
        )
        return "dlq"

    store.mark_done(key)
    return "ok"


if __name__ == "__main__":
    store = IdempotenceStore("idempotence.db")
    print(run_daily_digest(store))
