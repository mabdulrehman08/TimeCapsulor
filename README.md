# TimeCapsulor

TimeCapsulor is a hackathon MVP for recording a live conversation with Vapi while capturing webcam video in the browser, then saving that session as a replayable time capsule.

## Repo structure

```txt
TimeCapsulor/
  frontend/   # Next.js browser app
  backend/    # API, storage, processing
  docs/       # product and build docs
  DEMO.md     # pitch and demo script
```

## Ownership split

### Frontend

Lives in `frontend/` and owns:

- Next.js + TypeScript app
- Vapi browser integration
- webcam and mic capture
- upload flow to backend
- capsule browsing and playback UI

### Backend

Lives in `backend/` and owns:

- upload endpoints
- local storage and database
- transcript and session processing
- later summary, memory, and voice features

## Current status

- repo is now clearly split into frontend and backend
- frontend has the minimum bootstrap files
- backend has a starter stub so work can begin independently
- docs remain in `docs/timecapsulor/`

## Docs

- [Demo Script](C:/Users/muham/timecapu/TimeCapsulor/DEMO.md)
- [Bootstrap V1](C:/Users/muham/timecapu/TimeCapsulor/docs/timecapsulor/bootstrap-v1.md)
- [Design](C:/Users/muham/timecapu/TimeCapsulor/docs/timecapsulor/design.md)
- [Requirements](C:/Users/muham/timecapu/TimeCapsulor/docs/timecapsulor/requirements.md)
- [Tasks](C:/Users/muham/timecapu/TimeCapsulor/docs/timecapsulor/tasks.md)
