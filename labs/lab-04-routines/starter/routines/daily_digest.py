"""Routine cron : digest quotidien des PRs du repo.

Comportement attendu :

1. Construire la clé d'idempotence à partir de la date du jour.
2. Si is_done(key) → log + return.
3. Sinon : générer le digest (mock pour le lab) avec @retry.
4. Si retry échoue : push_dlq + log + return.
5. Si succès : mark_done(key) + log.

Pour les tests : la fonction principale doit être appelable avec injection
de dépendances (store, today, generate_fn, dlq_path).
"""

from datetime import date
from typing import Callable, Optional

from .lib.dlq import push_dlq
from .lib.idempotence import IdempotenceStore, build_key
from .lib.retry import retry


def run_daily_digest(
    store: IdempotenceStore,
    today: Optional[date] = None,
    generate: Optional[Callable[[], str]] = None,
    dlq_path: str = "dlq.jsonl",
) -> str:
    """TODO — implémenter le flow décrit ci-dessus.

    Retourne :
    - "skipped" si déjà fait,
    - "ok" si succès,
    - "dlq" si échec définitif.
    """
    raise NotImplementedError


if __name__ == "__main__":
    store = IdempotenceStore("idempotence.db")
    print(run_daily_digest(store))
