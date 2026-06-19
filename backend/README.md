# Backend

This folder is reserved for the non-user-facing TimeCapsulor backend.

## Expected responsibilities

- session upload endpoints
- local video and metadata storage
- transcript and processing pipeline
- capsule retrieval APIs
- later summary, memory, and voice features

## Suggested starting shape

```txt
backend/
  app/
  README.md
  requirements.txt
  .env.example
```

## Notes

Frontend should call into this folder's API surface. Backend should stay independent from the browser UI layer.
