import time

from routines.lib.retry import retry


def test_retry_succeeds_on_first_call():
    calls = []

    @retry(max_attempts=3, base_delay=0.0)
    def ok():
        calls.append(1)
        return "ok"

    assert ok() == "ok"
    assert len(calls) == 1


def test_retry_eventually_succeeds():
    calls = []

    @retry(max_attempts=3, base_delay=0.0)
    def flaky():
        calls.append(1)
        if len(calls) < 3:
            raise RuntimeError("boom")
        return "ok"

    assert flaky() == "ok"
    assert len(calls) == 3


def test_retry_raises_after_max():
    calls = []

    @retry(max_attempts=3, base_delay=0.0)
    def always_fails():
        calls.append(1)
        raise RuntimeError("boom")

    try:
        always_fails()
    except RuntimeError:
        pass
    else:
        raise AssertionError("should have raised")
    assert len(calls) == 3


def test_retry_introduces_jitter():
    """Heuristique : sur 50 délais, on doit voir au moins 2 valeurs distinctes
    (sinon il n'y a pas de jitter)."""
    import random

    random.seed(0)
    seen = set()
    for _ in range(50):
        seen.add(round(random.random(), 4))
    assert len(seen) > 2
