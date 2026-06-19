# TimeCapsulor Demo

## One-line pitch

TimeCapsulor is an AI-guided memory capsule that records a real conversation with Vapi, captures webcam video, and saves that moment so you can revisit it later.

## Short pitch

Instead of saving only a photo or a clip, TimeCapsulor preserves a conversation. You talk directly with an AI facilitator through Vapi while the browser records your voice and video. That session becomes a replayable time capsule.

## Demo goal

Show that we can:

1. start a live session
2. talk directly with Vapi
3. record webcam video during the session
4. save the session as a capsule
5. reopen the capsule later

## Demo flow

### 1. Home

Open the homepage and say:

> TimeCapsulor is a browser-based time capsule where a person records a real conversation with AI, not just a static message.

Point out:

- `Start Capsule`
- `View Capsules`

### 2. Session page

Go to `/session` and say:

> This is the live session experience. The user talks directly with Vapi here while the browser handles webcam and microphone capture.

Point out:

- Vapi configuration
- session page structure
- recording handoff responsibilities

### 3. What happens during the session

Say:

> During the conversation, Vapi acts as the real-time voice layer. At the same time, the browser records the user’s video and audio. When the session ends, that recording gets saved locally as a capsule.

### 4. Capsules page

Go to `/capsules` and say:

> Once a session is saved, it appears in the capsule library, where the user can browse previous memories and reopen them later.

### 5. Capsule detail

Go to `/capsules/[id]` and say:

> This page becomes the replay experience. In V1 it will show the saved recording, transcript, and session metadata for a single capsule.

## Why it matters

Use one of these lines:

- This is not just storage, it is preserved conversation.
- We are saving voice, face, and reflection together in one artifact.
- The emotional value is that you are revisiting a real moment, not just reading a note.

## Sponsor mapping

- **Vapi**: live voice conversation layer
- **Nebius**: later transcription, summaries, and memory processing
- **Inforge**: later GPU-heavy features like voice cloning or backend processing

## What is real in V1

- Next.js frontend structure
- Vapi integration path
- session flow shape
- capsule browsing structure

## What comes next

- real Vapi call controls
- MediaRecorder integration
- local upload/save endpoint
- replayable saved recordings

## Closing line

> TimeCapsulor turns a live AI conversation into a memory you can come back to later.
