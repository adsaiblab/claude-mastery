import hashlib
import hmac
import os

import pytest


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("WEBHOOK_SECRET", "test-secret")
    monkeypatch.setenv("STORE_PATH", str(tmp_path / "idem.db"))
    # Re-import to pick up env vars
    import importlib

    from routines import webhook as wh

    importlib.reload(wh)
    from fastapi.testclient import TestClient

    return TestClient(wh.app)


def _sign(body: bytes, secret: bytes) -> str:
    return hmac.new(secret, body, hashlib.sha256).hexdigest()


def test_webhook_rejects_invalid_signature(client):
    r = client.post(
        "/webhook/digest",
        content=b'{"date":"2026-04-26"}',
        headers={"X-Signature": "deadbeef"},
    )
    assert r.status_code == 401


def test_webhook_accepts_valid_signature(client):
    body = b'{"date":"2026-04-26"}'
    sig = _sign(body, b"test-secret")
    r = client.post(
        "/webhook/digest",
        content=body,
        headers={"X-Signature": sig},
    )
    assert r.status_code == 200
    assert r.json()["status"] in ("ok", "skipped", "dlq")
