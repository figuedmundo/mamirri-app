# Specification: Whisper Groq Integration

## Goal

Integrate OpenAI Whisper via Groq API to automatically transcribe voice notes uploaded during clinical sessions, enabling hands-free dictation of clinical observations in Spanish.

## User Stories

- As a physiotherapist, I want my voice notes automatically transcribed so that I can dictate observations without typing during patient sessions
- As a physiotherapist, I want failed transcriptions to be retried automatically so that I don't lose important clinical notes due to temporary network issues

## Specific Requirements

**TranscriptionService (Groq API Wrapper)**

- Create new `TranscriptionModule` in `apps/server/src/modules/transcription/`
- Use official `groq-sdk` npm package for TypeScript integration
- Wrap Groq audio transcription API with configurable timeout (default 5 seconds)
- Configure via `GROQ_API_KEY` environment variable using NestJS ConfigService
- Use model `whisper-large-v3` for maximum medical terminology accuracy
- Always specify `language: "es"` (Spanish) for improved accuracy and latency

**Medical Vocabulary Prompt**

- Include curated physiotherapy prompt with common Spanish medical terms
- Store prompt in `constants/prompts.ts` for maintainability
- Terms include: fascitis plantar, escoliosis, lumbalgia, cervicalgia, ciática, hernia discal, tendinitis, contractura muscular, escala EVA, índice de Barthel

**Hybrid Sync/Async Processing**

- On voice note upload, attempt synchronous transcription with 5-second timeout
- If successful within timeout, save with `transcriptionStatus: 'completed'`
- If timeout or error, save with `transcriptionStatus: 'pending'` for async retry
- Implement cron job (`@nestjs/schedule`) running every 30 seconds to process pending items
- Require adding `ScheduleModule.forRoot()` to AppModule imports

**VoiceNote Interface Extension**

- Extend existing VoiceNote JSON structure with new fields
- Add `transcriptionStatus`: enum of `'pending' | 'processing' | 'completed' | 'failed'`
- Add `transcriptionError`: optional string to store error message on permanent failure
- Add `retryCount`: number tracking retry attempts (max 5)
- Existing fields remain: `audioUrl`, `transcription`, `durationSeconds`

**Error Handling and Retry Logic**

- Implement exponential backoff: 1s, 2s, 4s, 8s, 16s between retries
- Maximum 5 retry attempts before marking as `failed`
- Respect `Retry-After` header on HTTP 429 rate limit errors
- Store descriptive error message in `transcriptionError` field on permanent failure
- Log all transcription attempts and failures using NestJS Logger

**Integration with MediaService**

- Modify `MediaService.uploadVoiceNote()` to trigger transcription after file upload
- Update both `Evaluation.voiceNotes` and `TreatmentSession.voiceNotes` JSON arrays
- Maintain existing ownership verification (therapist isolation)
- Return voice note with transcription status in upload response

**Unit Tests**

- Mock Groq SDK for unit tests following `storage.service.spec.ts` pattern
- Test successful transcription flow
- Test timeout handling and status update
- Test retry logic with exponential backoff
- Test max retry limit and failure state

## Visual Design

No visual assets provided. This is a backend-only feature. Frontend UI for voice recorder and transcription display is covered in roadmap task 7.5.

## Existing Code to Leverage

**StorageService Pattern (`modules/storage/storage.service.ts`)**

- Follow same pattern for external API wrapper service
- Use `Logger` for structured logging
- Implement `onModuleInit` for initialization/validation if needed
- Handle errors with specific NestJS exception types

**Storage Config Pattern (`config/storage.config.ts`)**

- Create `transcription.config.ts` following same exported function pattern
- Return configuration object from environment variables
- Provide sensible defaults for local development

**MediaService Integration (`modules/media/media.service.ts`)**

- Integration point is `uploadVoiceNote()` method at line 104
- Currently saves `transcription: null` - this is where to trigger TranscriptionService
- Follow same ownership verification pattern for any new methods
- Use same Prisma JSON update pattern (`push` for arrays)

**StorageService Tests (`storage.service.spec.ts`)**

- Follow same Jest mocking pattern for external dependencies
- Mock SDK at module level with `jest.mock()`
- Create test fixtures for valid/invalid inputs
- Test happy path, error cases, and edge cases

**SessionPhotoService Pattern (`services/session-photo.service.ts`)**

- Good example of service that orchestrates storage + database operations
- Follow same constructor injection pattern (PrismaService, StorageService)
- Graceful error handling with try-catch and logging

## Out of Scope

- Frontend voice recorder UI component (roadmap task 7.5)
- Frontend transcription display and status indicators (roadmap task 7.5)
- Structured data extraction from transcriptions (Part 2: AI Infrastructure)
- Real-time streaming transcription during recording
- Multi-language support beyond Spanish
- Offline transcription capability
- Translation of transcriptions to English
- Manual transcription editing UI
- Transcription search across all voice notes
- Separate Transcription database entity (use existing JSON field)
