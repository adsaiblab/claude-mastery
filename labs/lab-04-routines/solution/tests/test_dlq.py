import json

from routines.lib.dlq import push_dlq


def test_dlq_appends_jsonl(tmp_path):
    path = tmp_path / "dlq.jsonl"
    push_dlq(str(path), {"event": "a", "error": "boom"})
    push_dlq(str(path), {"event": "b", "error": "kaboom"})

    lines = path.read_text().strip().split("\n")
    assert len(lines) == 2
    assert json.loads(lines[0])["event"] == "a"
    assert json.loads(lines[1])["event"] == "b"
