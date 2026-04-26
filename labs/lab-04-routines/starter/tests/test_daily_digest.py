import json
from datetime import date

from routines.daily_digest import run_daily_digest
from routines.lib.idempotence import IdempotenceStore


def test_run_ok(tmp_path):
    store = IdempotenceStore(str(tmp_path / "idem.db"))
    dlq = str(tmp_path / "dlq.jsonl")
    result = run_daily_digest(
        store=store,
        today=date(2026, 4, 26),
        generate=lambda: "digest content",
        dlq_path=dlq,
    )
    assert result == "ok"


def test_run_skipped_second_call(tmp_path):
    store = IdempotenceStore(str(tmp_path / "idem.db"))
    dlq = str(tmp_path / "dlq.jsonl")
    today = date(2026, 4, 26)
    assert run_daily_digest(store, today, lambda: "x", dlq) == "ok"
    assert run_daily_digest(store, today, lambda: "x", dlq) == "skipped"


def test_run_pushes_dlq_on_persistent_failure(tmp_path):
    store = IdempotenceStore(str(tmp_path / "idem.db"))
    dlq = str(tmp_path / "dlq.jsonl")

    def boom():
        raise RuntimeError("upstream down")

    result = run_daily_digest(store, date(2026, 4, 26), boom, dlq)
    assert result == "dlq"

    lines = (tmp_path / "dlq.jsonl").read_text().strip().split("\n")
    assert len(lines) == 1
    payload = json.loads(lines[0])
    assert payload["event"] == "daily-digest"
    assert "upstream down" in payload["error"]
