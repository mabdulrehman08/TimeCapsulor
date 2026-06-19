# Requirements Document

## Introduction

TimeCapsulor is an AI-powered time capsule web application that enables users to preserve a meaningful version of themselves through long-form video recording, real voice capture, and guided conversation with an AI facilitator. Users can later revisit and interact with their past self in a personal and emotionally resonant way — watching the original recording, reading an AI-generated summary, and optionally hearing AI-generated responses spoken back in their own cloned voice.

This document covers the MVP scope for a 4-hour hackathon, prioritizing a working end-to-end flow. The team splits into frontend (React, UI/UX) and backend+ML (Vapi, Nebius, Inforge).

---

## Glossary

- **Capsule**: A saved time capsule record containing video, audio, transcript, AI summary, extracted memories, and optionally a voice clone profile.
- **Session**: An active recording interaction between the User and the AI_Facilitator, from start to save.
- **AI_Facilitator**: The AI-driven conversational agent (powered by Vapi) that guides the user through reflective prompts during a Session.
- **Recorder**: The frontend component responsible for capturing webcam video and microphone audio during a Session.
- **Transcriber**: The backend service (powered by Nebius) that converts recorded audio into a text transcript.
- **Summarizer**: The backend service (powered by Nebius) that generates a structured summary and extracts themes and memories from the transcript.
- **Voice_Cloner**: The ML pipeline component (running on local GPU via Inforge) that builds a cloned voice profile from captured audio.
- **Voice_Synthesizer**: The component that generates spoken audio using the cloned voice profile.
- **Capsule_Store**: The backend storage layer (Inforge) that persists all Capsule artifacts.
- **Capsule_Viewer**: The frontend component that allows the user to reopen and interact with a saved Capsule.
- **AI_Companion**: The AI agent the user interacts with when reopening a Capsule, grounded in that Capsule's saved transcript and summary.
- **User**: The human using the TimeCapsulor application.

---

## Requirements

### Requirement 1: Start a Recording Session

**User Story:** As a User, I want to start a new time capsule session so that I can begin capturing my current self.

#### Acceptance Criteria

1. WHEN the User opens the app and navigates to the Create Capsule screen, THE Recorder SHALL request permission to access the User's webcam and microphone before enabling the "Start Session" action.
2. IF the User denies webcam or microphone permission, THEN THE Recorder SHALL display an error message stating that both camera and microphone access are required, and SHALL disable the "Start Session" action until permission is granted.
3. IF the browser is unable to initialize the webcam or microphone after permission is granted, THEN THE Recorder SHALL display a specific error message identifying which device failed to initialize and SHALL NOT start the Session.
4. WHEN the User clicks the "Create Capsule" action, THE Recorder SHALL initialize a live webcam preview and begin capturing audio and video simultaneously.
5. WHEN a Session starts, THE AI_Facilitator SHALL send an opening prompt to the User within 3 seconds of the Session beginning.
6. THE Recorder SHALL support continuous recording sessions of up to 60 minutes without interruption.
7. WHEN the recording duration reaches 60 minutes, THE Recorder SHALL display a visible warning to the User and SHALL provide an option to end and save the Session or continue recording.
8. WHILE a Session is active, THE Recorder SHALL display a visible recording indicator (e.g., a pulsing red dot) and an elapsed time counter updated at least every second.

---

### Requirement 2: AI Facilitator Conversation

**User Story:** As a User, I want to be guided by an AI facilitator during my session so that the conversation feels personal, reflective, and emotionally meaningful.

#### Acceptance Criteria

1. WHEN a Session starts, THE AI_Facilitator SHALL deliver an opening prompt that introduces the purpose of the session and invites the User to begin, before asking any reflective question.
2. THE AI_Facilitator SHALL ask at least one reflective prompt for each of the following five themes, for a minimum of 5 prompts across a Session: current emotional state, recent accomplishments, current fears or anxieties, goals and hopes, and a message to the future self.
3. WHEN the User's voice input ends or a text response is submitted, THE AI_Facilitator SHALL generate a follow-up question within 5 seconds.
4. THE AI_Facilitator SHALL maintain conversational context across all turns within a single Session, such that each follow-up question explicitly incorporates a topic, subject, or detail previously named by the User.
5. WHILE the Session is active, THE AI_Facilitator SHALL display each prompt as on-screen text in addition to any voice delivery, so the User can read and reflect.
6. IF the User is silent for more than 30 seconds, THEN THE AI_Facilitator SHALL deliver a re-prompt that acknowledges the pause and rephrases or reframes the question rather than repeating it verbatim.
7. THE AI_Facilitator SHALL be powered by Vapi for voice interaction and shall use Nebius for language model inference.
8. WHEN the AI_Facilitator has received a User response for all five required themes, THE AI_Facilitator SHALL deliver a closing prompt inviting the User to add any final thoughts before ending the Session.

---

### Requirement 3: Save the Capsule

**User Story:** As a User, I want my completed session to be saved with all relevant artifacts so that I can return to it in the future.

#### Acceptance Criteria

1. WHEN the User ends a Session, THE Recorder SHALL finalize and package the recorded video file in MP4 or WebM format.
2. WHEN the User ends a Session, THE Recorder SHALL finalize and package the audio file as a separate artifact in WAV or MP3 format for use by the Transcriber and Voice_Cloner.
3. WHEN the Session ends, THE Transcriber SHALL generate a text transcript from the audio file using Nebius speech-to-text, capturing all spoken words with speaker-attributed segments where possible.
4. WHEN the Transcriber completes the transcript, THE Summarizer SHALL generate a structured AI summary that includes: a narrative summary paragraph, a list of extracted themes (minimum 3), and a list of key memories or direct quotes from the User (minimum 2).
5. WHEN the Session ends, THE Capsule_Store SHALL create a Capsule record immediately, assigning a unique identifier (UUID) and a creation timestamp, and persist all available artifacts as they complete.
6. IF the Transcriber does not return a result within 120 seconds, OR IF the Summarizer does not return a result within 120 seconds, THEN THE Capsule_Store SHALL mark that artifact's status as "pending" and still persist the Capsule with all successfully generated artifacts.
7. IF any artifact (transcript, summary) fails to generate, THEN THE Capsule_Store SHALL still save the Capsule with the successfully generated artifacts and mark the failed artifacts as "failed".
8. WHEN a Capsule record is created, THE Capsule_Store SHALL assign a default title in the format "Capsule — [creation date]" if the User has not provided a custom title.
9. WHEN a Capsule is saved successfully, THE system SHALL display a confirmation to the User showing the Capsule title and creation date.

---

### Requirement 4: Capsule Library and Reopen

**User Story:** As a User, I want to see all my saved capsules and reopen them so that I can revisit my past self.

#### Acceptance Criteria

1. THE Capsule_Viewer SHALL display a list of all saved Capsules, showing the Capsule title, creation date, and recording duration in minutes and seconds. IF no Capsules exist, THE Capsule_Viewer SHALL display an empty-state message prompting the User to create their first Capsule.
2. WHEN the User selects a Capsule from the list, THE Capsule_Viewer SHALL present the original recorded video with at minimum the following playback controls: play/pause, seek bar, and volume control.
3. WHEN the User opens a Capsule whose status is "ready", THE Capsule_Viewer SHALL display the transcript and the AI summary in a readable, scrollable format alongside the video. IF the transcript or summary status is "pending" or "failed", THE Capsule_Viewer SHALL display the processing status for each missing artifact rather than an empty section.
4. WHEN the User opens a Capsule whose status is "ready", THE Capsule_Viewer SHALL offer an option to interact with the AI_Companion. IF the Capsule status is "processing", THE Capsule_Viewer SHALL display the processing state and SHALL NOT offer the AI_Companion interaction.
5. WHEN the User sends a message to the AI_Companion, THE AI_Companion SHALL respond using only the context from that Capsule's transcript and summary, without referencing information from other Capsules, within 10 seconds.
6. IF the video file for a Capsule is unavailable or fails to load, THEN THE Capsule_Viewer SHALL display an error message for the video section and SHALL still render all other available artifacts (transcript, summary, AI_Companion).
7. IF the AI_Companion receives a question for which the Capsule's transcript and summary contain no relevant context, THEN THE AI_Companion SHALL respond indicating that the information was not found in the Capsule, rather than generating a fabricated answer.

---

### Requirement 5: Voice Cloning Pipeline

**User Story:** As a User, I want my real voice to be captured and used to create a cloned voice profile so that future AI responses can be heard in my own voice.

#### Acceptance Criteria

1. WHEN the Recorder has finalized the audio file after a Session ends, THE Voice_Cloner SHALL use that audio file to attempt building a cloned voice profile for the User.
2. THE Voice_Cloner SHALL be implemented using the local GPU via the Inforge pipeline to generate the voice profile.
3. WHEN the cloned voice profile is created, THE Capsule_Store SHALL persist the voice profile as part of the Capsule record.
4. WHEN the AI_Companion generates a text response for a Capsule that has a voice profile, THE Voice_Synthesizer SHALL synthesize that response as audio using the cloned voice profile. IF Voice_Synthesizer synthesis fails, THE system SHALL display the AI_Companion response as text only.
5. WHERE the Voice_Cloner pipeline is not fully operational within the hackathon time constraint, THE system SHALL play a pre-generated audio sample produced from the session audio when the User triggers a voice playback action, as a proof-of-concept demonstration.
6. IF voice profile generation fails, THEN THE system SHALL still save the Capsule and fall back to text-only responses for AI_Companion interactions, without blocking the User.
7. THE Voice_Cloner SHALL measure the total duration of detected speech segments (excluding silence and non-speech noise) in the audio file and SHALL only attempt profile generation if that duration is at least 60 seconds.
8. IF the session audio contains fewer than 60 seconds of detected speech, THEN THE Voice_Cloner SHALL skip profile generation, mark the voice profile status as "insufficient audio" in the Capsule record, and notify the User after the Session ends.

---

### Requirement 6: Frontend UI/UX — Emotional Design

**User Story:** As a User, I want the app to feel emotionally warm and personal so that the experience of creating and revisiting a capsule is meaningful and not clinical.

#### Acceptance Criteria

1. THE system SHALL present a consistent visual theme across the Create Capsule, Session Recording, Capsule Library, and Capsule Viewer screens, using a defined warm color palette, typography, and UI component style applied uniformly across all four screens.
2. WHILE recording is active, THE Recorder SHALL display the live webcam feed at a minimum width of 50% of the viewport, with the AI_Facilitator prompts visible on the same screen without requiring the User to scroll.
3. WHEN a Capsule is saved, THE system SHALL display a save confirmation message for a minimum of 3 seconds that reflects the emotional significance of the action (for example: "Your capsule is sealed. Your future self will thank you.").
4. WHEN the User opens a Capsule, THE Capsule_Viewer SHALL present the summary artifact using at least one of the following visual treatments: sepia tone overlay, soft vignette, or a letter-style layout. This treatment SHALL be applied consistently and SHALL NOT be absent.
5. THE system SHALL be fully functional on Chrome 110+, Firefox 110+, Edge 110+, and Safari 16+ on desktop without requiring any installation, app download, or login for MVP demonstration purposes.
6. ALL screen-to-screen navigation transitions SHALL complete within 200–400ms using a consistent animation (e.g., fade or slide).

---

### Requirement 7: Backend Orchestration and API Layer

**User Story:** As a developer (Yoda), I want a clean backend API and orchestration layer so that the frontend can integrate reliably against defined contracts.

#### Acceptance Criteria

1. THE backend SHALL expose REST endpoints for the following stateless operations: start session, end session, retrieve capsule list, and retrieve capsule by ID. THE backend SHALL expose a WebSocket endpoint for streaming AI_Companion messages.
2. WHEN the frontend sends an end-session request with the recorded audio and video blobs, THE backend SHALL accept multipart file uploads up to 2 GB in size and SHALL respond with a 413 status and an error message if the upload exceeds that limit.
3. WHEN the backend receives a valid end-session request, THE backend SHALL respond immediately with the Capsule ID and a status of "processing", before the Transcriber, Summarizer, or Voice_Cloner pipelines begin.
4. THE backend SHALL run the Transcriber, Summarizer, and Voice_Cloner pipeline steps asynchronously after receiving the session files, so the User is not blocked waiting for processing.
5. WHEN a pipeline step completes, THE backend SHALL update the corresponding artifact status field in the Capsule record. WHEN all artifact statuses are either "ready" or "failed", THE backend SHALL update the top-level Capsule status to "ready" or "partial-ready" respectively.
6. WHEN a pipeline step sets a Capsule artifact status to "failed", THE backend SHALL record an error code and message for that artifact in the Capsule record, accessible via the retrieve-capsule-by-ID endpoint. The Capsule record's top-level status SHALL NOT remain "processing" indefinitely; IF all pipeline steps have completed or failed, THE backend SHALL resolve the status.
7. WHEN the frontend requests a Capsule by ID that does not exist, THE backend SHALL respond with a 404 status and an error message. WHEN the frontend submits an upload with an unsupported file format, THE backend SHALL respond with a 422 status and SHALL NOT create a Capsule record.
8. THE backend SHALL be deployable via Inforge and SHALL use Nebius for all inference tasks (transcription, summarization, language model).

---

### Requirement 8: Session State and Reliability

**User Story:** As a User, I want my session to be resilient to interruptions so that I don't lose my recording if something goes wrong.

#### Acceptance Criteria

1. WHILE a Session is active, THE Recorder SHALL buffer recorded media locally in the browser using the MediaRecorder API to protect against network interruptions.
2. IF the browser tab loses focus or the network connection is interrupted during recording, THEN THE Recorder SHALL continue buffering locally and SHALL NOT stop the recording.
3. WHEN the User explicitly ends the Session, THE Recorder SHALL initiate the upload of the buffered media to the backend.
4. IF the upload attempt fails, THEN THE Recorder SHALL automatically retry the upload up to 3 times, waiting 5 seconds between each attempt.
5. IF the upload fails after 3 retry attempts, THEN THE system SHALL offer the User the option to download the video and audio files locally so that the recording is not lost.
6. WHEN a Session is in progress, THE system SHALL display a browser confirmation dialog requiring explicit confirmation before the User navigates away from the page, closes the tab, or refreshes the page, to prevent accidental session loss.
