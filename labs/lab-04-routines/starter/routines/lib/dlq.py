"""DLQ append-only en JSONL.

API attendue :

    push_dlq("dlq.jsonl", {"event": "daily-digest", "date": "2026-04-26", "error": "..."})

Chaque appel ajoute UNE ligne JSON à la fin du fichier.
Le format JSONL doit rester lisible si le fichier est concaténé/rotaté.
"""

import json
from pathlib import Path
from typing import Mapping


def push_dlq(path: str, payload: Mapping) -> None:
    """TODO — append la payload sérialisée en JSON sur une seule ligne."""
    raise NotImplementedError
