"""Décorateur retry avec backoff exponentiel + jitter."""

import functools
import random
import time
from typing import Callable


def retry(max_attempts: int = 3, base_delay: float = 0.5, max_delay: float = 10.0):
    def decorator(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            last_exc: Exception | None = None
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except Exception as exc:
                    last_exc = exc
                    if attempt + 1 == max_attempts:
                        break
                    delay = min(max_delay, base_delay * (2 ** attempt))
                    delay += random.uniform(0, base_delay)
                    if delay > 0:
                        time.sleep(delay)
            assert last_exc is not None
            raise last_exc

        return wrapper

    return decorator
