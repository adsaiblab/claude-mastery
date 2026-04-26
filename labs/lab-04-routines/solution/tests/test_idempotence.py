from datetime import date

from routines.lib.idempotence import IdempotenceStore, build_key


def test_build_key_is_deterministic():
    a = build_key("daily-digest", "2026-04-26")
    b = build_key("daily-digest", "2026-04-26")
    assert a == b


def test_build_key_changes_with_inputs():
    a = build_key("daily-digest", "2026-04-26")
    b = build_key("daily-digest", "2026-04-27")
    assert a != b


def test_store_idempotent_writes(tmp_path):
    db = tmp_path / "idem.db"
    store = IdempotenceStore(str(db))
    key = build_key("daily-digest", "2026-04-26")
    assert not store.is_done(key)
    store.mark_done(key)
    assert store.is_done(key)
    # Double mark_done : pas d'erreur
    store.mark_done(key)
    assert store.is_done(key)
