"""Download Vapi call recordings to a local folder per session.

Minimal V1: everything lives on local disk under DATA_DIR/sessions/<call_id>/.
No database. Swap for real storage in V2.
"""
from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from urllib.parse import urlparse

import httpx

from . import config

log = logging.getLogger("timecapsulor")

VAPI_API = "https://api.vapi.ai"


def _session_dir(call_id: str) -> Path:
    d = config.SESSIONS_DIR / call_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def _recording(artifact: dict) -> dict:
    return (artifact or {}).get("recording") or {}


def _urls(recording: dict) -> dict:
    """Map our names -> Vapi recording URLs (any may be missing)."""
    mono = recording.get("mono") or {}
    return {
        "user_audio": mono.get("customerUrl"),        # clean user-only track
        "assistant_audio": mono.get("assistantUrl"),  # AI voice (optional)
        "video": recording.get("videoUrl"),           # needs AWS S3 in Vapi
    }


def _ext(url: str, default: str) -> str:
    return Path(urlparse(url).path).suffix or default


def _usable(url) -> bool:
    """Fetchable URL: present and not an 'undefined' placeholder. Vapi emits
    '.../undefined' for an artifact (usually video) that wasn't captured."""
    return bool(url) and "undefined" not in url


def _download(url: str, dest: Path) -> bool:
    try:
        with httpx.stream("GET", url, timeout=120, follow_redirects=True) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                for chunk in r.iter_bytes():
                    f.write(chunk)
        return True
    except Exception as e:  # noqa: BLE001 - log and retry on a later attempt
        log.warning("download failed %s: %s", url, e)
        dest.unlink(missing_ok=True)
        return False


def _fetch_call(call_id: str) -> dict:
    """Pull the latest call object from Vapi (to wait for slow video URLs)."""
    if not config.VAPI_API_KEY or not call_id:
        return {}
    try:
        r = httpx.get(
            f"{VAPI_API}/call/{call_id}",
            headers={"Authorization": f"Bearer {config.VAPI_API_KEY}"},
            timeout=30,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:  # noqa: BLE001
        log.warning("fetch call %s failed: %s", call_id, e)
        return {}


def process_end_of_call(message: dict) -> None:
    """Save transcript + download recordings for one finished call."""
    call = message.get("call") or {}
    call_id = call.get("id") or "unknown"
    d = _session_dir(call_id)
    log.info("processing call %s -> %s", call_id, d)

    # 1) transcript + role-tagged messages (AI-turn context)
    (d / "transcript.json").write_text(
        json.dumps(
            {
                "transcript": message.get("transcript"),
                "messages": message.get("messages")
                or (message.get("artifact") or {}).get("messages"),
            },
            indent=2,
            ensure_ascii=False,
        )
    )

    # 2) download recordings. Retry only for usable URLs that fail transiently,
    #    and stop as soon as every usable URL is saved — so a call without video
    #    (or a failed call) doesn't sit in a pointless retry loop.
    artifact = message.get("artifact") or {}
    defaults = {"user_audio": ".wav", "assistant_audio": ".wav", "video": ".mp4"}
    saved: dict[str, str] = {}

    for attempt in range(1, 5):
        urls = _urls(_recording(artifact))
        for name, default_ext in defaults.items():
            if name in saved or not _usable(urls.get(name)):
                continue
            filename = f"{name}{_ext(urls[name], default_ext)}"
            if _download(urls[name], d / filename):
                saved[name] = filename
                log.info("call %s: saved %s", call_id, filename)

        urls = _urls(_recording(artifact))
        pending = [n for n in defaults if n not in saved and _usable(urls.get(n))]
        if not pending:
            break

        time.sleep(min(3 * attempt, 10))
        fresh = _fetch_call(call_id)
        if fresh:
            artifact = fresh.get("artifact") or artifact

    if "user_audio" not in saved:
        log.warning("call %s: no user audio (call may have captured no customer audio)", call_id)
    if "video" not in saved:
        log.info("call %s: no video for this call", call_id)

    # 3) tiny per-session index
    (d / "session.json").write_text(
        json.dumps(
            {
                "callId": call_id,
                "startedAt": message.get("startedAt"),
                "endedAt": message.get("endedAt"),
                "endedReason": message.get("endedReason"),
                "durationSeconds": message.get("durationSeconds"),
                "files": saved,
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    log.info("call %s: done, files=%s", call_id, list(saved))


def list_sessions() -> list[dict]:
    out: list[dict] = []
    if not config.SESSIONS_DIR.exists():
        return out
    for d in sorted(config.SESSIONS_DIR.iterdir()):
        meta = d / "session.json"
        if meta.is_file():
            try:
                out.append(json.loads(meta.read_text()))
            except Exception:  # noqa: BLE001
                continue
    return out


def get_session(call_id: str) -> dict | None:
    meta = config.SESSIONS_DIR / call_id / "session.json"
    if meta.is_file():
        try:
            return json.loads(meta.read_text())
        except Exception:  # noqa: BLE001
            return None
    return None
