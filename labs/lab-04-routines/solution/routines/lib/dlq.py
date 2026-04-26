"""DLQ append-only en JSONL."""

import json
from pathlib import Path
from typing import Mapping


def push_dlq(path: str, payload: Mapping) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a") as f:
        f.write(json.dumps(dict(payload), sort_keys=True) + "\n")
