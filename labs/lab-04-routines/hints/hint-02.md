# Hint 02 — Lab 04 alt

## Backoff exponentiel + jitter

**Sans jitter** : si 1000 clients retry simultanément après un blackout, ils se synchronisent. Le service revient sous une vague identique → retombe. Thundering herd.

**Avec jitter** : chaque client attend une durée légèrement différente, lissant la charge.

## Formule

```
delay = min(max_delay, base_delay * 2**attempt) + random.uniform(0, base_delay)
```

ou la variante **full jitter** (souvent meilleure) :

```
delay = random.uniform(0, min(max_delay, base_delay * 2**attempt))
```

## Squelette du décorateur

```python
import functools, random, time
from typing import Callable

def retry(max_attempts=3, base_delay=0.5, max_delay=10.0):
    def decorator(fn: Callable):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            last_exc = None
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    if attempt + 1 == max_attempts:
                        break
                    delay = min(max_delay, base_delay * (2 ** attempt))
                    delay += random.uniform(0, base_delay)
                    time.sleep(delay)
            raise last_exc
        return wrapper
    return decorator
```

## Tests

Pour tester rapidement, passe `base_delay=0.0` — pas de vraie attente, mais le compteur d'appels reste vérifiable.
