# TimeCapsulor V1 Bootstrap

## Goal

Build the minimum possible V1 for a 4-hour hackathon using Next.js and TypeScript.

In V1, the user talks directly with Vapi in the browser. At the same time, the browser records webcam video and microphone audio. When the session ends, we save the recording locally and store a tiny session record in a local database.

This version is about proving one real loop:

1. start a capsule
2. talk to Vapi
3. record the session
4. save it locally
5. replay it later

## Step 1: Vapi Web Quickstart

Use the Vapi Web quickstart as the first integration step:

- Docs: https://docs.vapi.ai/quickstart/web
- Install the Web SDK: `npm install @vapi-ai/web`
- Initialize Vapi in the browser with the public key
- Start a call with the assistant ID
- Listen for transcript and lifecycle events so we can save metadata

Minimum browser-side shape:

```ts
import Vapi from "@vapi-ai/web";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);

vapi.on("message", (message) => {
  if (message.type === "transcript") {
    console.log(message);
  }
});

vapi.on("call-start", () => {
  console.log("call started");
});

vapi.on("call-end", () => {
  console.log("call ended");
});
```

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Vapi Web SDK
- Browser MediaRecorder API
- Minimal local persistence

## Scope

### Must have

- home page
- session page
- live Vapi conversation
- webcam + mic recording in browser
- save recorded video locally
- save session metadata locally
- capsules list page
- capsule detail page with video playback

### Do not build in V1

- auth
- cloud storage
- voice cloning
- AI summary pipeline
- future unlock scheduling
- "talk to your past self" mode

## Minimum App Flow

### `/`

- app title
- one-line description
- `Start Capsule` button
- `View Capsules` button

### `/session`

- webcam preview
- start/end session controls
- Vapi call state
- timer
- record with `MediaRecorder`
- when session ends:
  - stop Vapi
  - stop recording
  - upload video blob
  - create session record

### `/capsules`

- list saved sessions

### `/capsules/[id]`

- video player
- created date
- duration
- transcript if available from Vapi events

## Persistence

Keep this brutally simple for V1.

### Recommended storage

- video files: local folder such as `public/uploads/`
- session metadata: `data/sessions.json`

Each session can look like this:

```ts
export type CapsuleSession = {
  id: string;
  createdAt: string;
  title: string;
  videoUrl: string;
  durationSec?: number;
  transcript?: string;
  vapiSessionId?: string;
};
```

This is enough for a hackathon demo. No need for Prisma unless setup is already free.

## Suggested Folder Structure

```txt
src/
  app/
    page.tsx
    session/page.tsx
    capsules/page.tsx
    capsules/[id]/page.tsx
    api/
      sessions/route.ts
      sessions/[id]/route.ts
      upload/route.ts
  components/
    webcam-recorder.tsx
    vapi-panel.tsx
    capsule-list.tsx
  lib/
    storage.ts
    types.ts
public/
  uploads/
data/
  sessions.json
```

## API Shape

### `POST /api/upload`

Accept recorded video blob and save it locally.

Returns:

```json
{
  "videoUrl": "/uploads/example.webm"
}
```

### `POST /api/sessions`

Create a session record after upload finishes.

Request:

```json
{
  "title": "Capsule - 2026-06-19",
  "videoUrl": "/uploads/example.webm",
  "durationSec": 320,
  "transcript": "..."
}
```

### `GET /api/sessions`

Return all saved sessions.

### `GET /api/sessions/[id]`

Return one saved session.

## Build Order

1. scaffold Next.js + TypeScript + Tailwind
2. add Vapi Web SDK using the quickstart
3. build session page
4. add webcam/mic recording with MediaRecorder
5. add upload endpoint
6. add session metadata endpoint
7. add capsules list page
8. add capsule detail playback page

## Env Vars

```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
```

## Definition of Done

V1 is done when we can:

1. open the app
2. start a session
3. talk directly with Vapi
4. record webcam video during the conversation
5. end the session
6. save the video locally
7. save a session record locally
8. open the saved capsule and replay it

## Notes for Yoda

- Keep the local database minimal.
- Prefer JSON metadata over a real DB for speed.
- Treat Vapi as the real-time conversation engine.
- Treat recording + storage as the main product proof.
- Make the happy path work first before any polish.
