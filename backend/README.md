# TimeCapsulor backend

Minimal FastAPI service that receives **Vapi** web-call webhooks and downloads
each finished call's recordings to local disk. No database — V1 keeps everything
under `data/sessions/<call_id>/`.

## What it saves

For every call, in `data/sessions/<call_id>/`:

| File | Source (Vapi `artifact.recording`) | Purpose |
|------|------------------------------------|---------|
| `user_audio.*` | `mono.customerUrl` | **user voice only** — for ElevenLabs cloning |
| `assistant_audio.*` | `mono.assistantUrl` | AI voice (optional) |
| `video.*` | `videoUrl` | the capsule video |
| `transcript.json` | `transcript` + `messages` | role-tagged conversation context |
| `session.json` | call metadata | index for the API |

> ⚠️ **Video needs AWS S3.** Vapi only writes video to a configured **AWS S3**
> bucket (not GCP / R2 / Vapi default). Enable *Video Recording* **and** set
> Cloud Providers → AWS S3 in the Vapi dashboard, or `videoUrl` will be empty.
> Audio works without any storage setup.

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.template .env      # then fill in VAPI_API_KEY
```

## Run

```bash
cd backend
source .venv/bin/activate          # activate backend/.venv (skip if already active)
uvicorn app.main:app --reload --port 8000
```

## Connect Vapi to this server

The browser talks to Vapi directly; the backend only learns about calls via webhooks.

1. Expose your local server (Vapi CLI):
   ```bash
   vapi listen --forward-to localhost:8000/vapi/webhook
   ```
   (or use ngrok and point it at `/vapi/webhook`)
2. In the Vapi dashboard, set the assistant **Server URL** to that public URL and
   enable server messages **status-update** and **end-of-call-report**.
3. Make sure **Audio Recording** (and **Video Recording** + AWS S3) are enabled.

## API

- `POST /vapi/webhook` — Vapi events (call start/end + recording report)
- `GET  /sessions` — list saved sessions
- `GET  /sessions/{call_id}` — one session's metadata
- `GET  /sessions/{call_id}/files/{name}` — download a saved file (e.g. `video.mp4`)
- `GET  /health` — liveness check

## V2 (later)

- Persist to a real DB / object storage instead of local disk
- ElevenLabs voice-clone API from `user_audio` (V1 = upload it manually)
- Transcription / summaries / companion chat
