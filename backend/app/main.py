"""Minimal TimeCapsulor backend.

The browser runs the Vapi web call directly; this backend only learns about
calls via Vapi webhooks, then downloads each call's recordings + transcript
to local disk.
"""
import logging
from typing import Optional

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from . import config, download

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("timecapsulor")

app = FastAPI(title="TimeCapsulor backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hackathon: open. Lock down in V2.
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/vapi/webhook")
async def vapi_webhook(
    request: Request,
    background: BackgroundTasks,
    x_vapi_secret: Optional[str] = Header(default=None),
):
    if config.VAPI_WEBHOOK_SECRET and x_vapi_secret != config.VAPI_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="invalid webhook secret")

    body = await request.json()
    message = body.get("message") or {}
    mtype = message.get("type")
    call_id = (message.get("call") or {}).get("id")

    if mtype == "status-update":
        log.info("call %s status=%s", call_id, message.get("status"))
    elif mtype == "end-of-call-report":
        log.info("call %s ended (%s) -> downloading", call_id, message.get("endedReason"))
        background.add_task(download.process_end_of_call, message)

    return {"received": True}


@app.get("/sessions")
def list_sessions():
    return download.list_sessions()


@app.get("/sessions/{call_id}")
def get_session(call_id: str):
    data = download.get_session(call_id)
    if not data:
        raise HTTPException(status_code=404, detail="session not found")
    return data


@app.get("/sessions/{call_id}/files/{name}")
def get_file(call_id: str, name: str):
    if "/" in name or "\\" in name or ".." in name:
        raise HTTPException(status_code=404, detail="not found")
    path = config.SESSIONS_DIR / call_id / name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="not found")
    return FileResponse(path)
