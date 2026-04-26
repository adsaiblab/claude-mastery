"""Décorateur retry avec backoff exponentiel + jitter.

API attendue :

    @retry(max_attempts=3, base_delay=0.5, max_delay=10.0)
    def call_external():
        ...

À chaque échec : attendre `min(max_delay, base_delay * 2**attempt + random_jitter)`.
"""

import random
import time
from typing import Callable


def retry(max_attempts: int = 3, base_delay: float = 0.5, max_delay: float = 10.0):
    """TODO — implémenter le décorateur."""

    def decorator(fn: Callable) -> Callable:
        raise NotImplementedError

    return decorator
