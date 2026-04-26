"""Endpoint webhook FastAPI — trigger manuel + HMAC."""

import hmac
import hashlib
import os
from fastapi import FastAPI, Header, HTTPException, Request

from .daily_digest import run_daily_digest
from .lib.idempotence import IdempotenceStore

app = FastAPI()
SECRET = os.environ.get("WEBHOOK_SECRET", "change-me").encode()
STORE = IdempotenceStore(os.environ.get("STORE_PATH", "idempotence.db"))


def verify_signature(body: bytes, signature: str) -> bool:
    expected = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@app.post("/webhook/digest")
async def trigger_digest(request: Request, x_signature: str = Header(...)):
    raw = await request.body()
    if not verify_signature(raw, x_signature):
        raise HTTPException(status_code=401, detail="invalid signature")
    return {"status": run_daily_digest(STORE)}
