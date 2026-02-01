# Spec Initialization: Whisper Groq Integration

## Source

Roadmap Task 7.4: Backend: Whisper integration (Groq API)

## Raw Idea

Integrate OpenAI Whisper via Groq API for voice note transcription in the Mamirri physiotherapy app. This is part of Week 7: Media & Dictation milestone.

## Context from Roadmap

- **Week 7 Items:**
  - 7.1 Backend: Media upload endpoint (validation, MinIO) ✅
  - 7.2 Frontend: Camera capture component ✅
  - 7.3 Frontend: Photo gallery per session ✅
  - **7.4 Backend: Whisper integration (Groq API)** ← THIS SPEC
  - 7.5 Frontend: Voice recorder button + transcription
  - 7.6 Wire Pacientes: onVoiceDictation, onCaptureHuella, onCaptureVideo
  - 7.7 Test: Dictate medical terms, verify accuracy

## Milestone Goal

**Milestone 3:** "I can take photos and dictate notes"

## Product Context

From mission.md:

- **Smart Voice Transcription:** Converts natural, unstructured clinical dictation into structured data fields (Name, Symptoms, History) automatically.
- Zero-UI "Tunnel" interface designed for hands-free operation during therapy sessions
- Privacy-first approach with anonymization before sending to LLMs

## Tech Stack Context

From tech-stack.md:

- **Transcription:** OpenAI Whisper API (whisper-large-v3 using Groq service)
- **Backend:** NestJS with TypeScript
- **Storage:** S3 Compatible (MinIO)
- **Database:** PostgreSQL with Prisma ORM

## Existing Implementation

Voice notes are already being:

1. Uploaded via `POST /media/evaluations/:id/voice-notes` and `POST /media/sessions/:id/voice-notes`
2. Stored in MinIO with paths like `voice-notes/{entityType}/{entityId}/`
3. Saved to database as JSON array in `Evaluation.voiceNotes` and `TreatmentSession.voiceNotes`
4. Structure: `{ audioUrl: string, transcription: null, durationSeconds: number }`

The `transcription` field is currently a **placeholder (null)** waiting for Whisper integration.

## Initialization Date

2026-01-19
