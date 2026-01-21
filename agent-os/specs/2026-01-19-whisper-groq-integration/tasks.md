# Task Breakdown: Whisper Groq Integration

## Overview

Total Tasks: 18 sub-tasks across 4 task groups

**Estimated Total Effort:** 8 hours

## Task List

### Infrastructure Layer

#### Task Group 1: Configuration & Dependencies

**Dependencies:** None

- [x] 1.0 Complete infrastructure setup
  - [x] 1.1 Install required dependencies
    - Add `groq-sdk` package: `pnpm --filter server add groq-sdk`
    - Add `@nestjs/schedule` package: `pnpm --filter server add @nestjs/schedule`
    - Verify packages in `package.json`
  - [x] 1.2 Create transcription configuration
    - Create `apps/server/src/config/transcription.config.ts`
    - Follow pattern from `storage.config.ts`
    - Export function returning `{ apiKey, model, language, timeout, maxRetries }`
    - Use `GROQ_API_KEY` environment variable
    - Defaults: model=`whisper-large-v3`, language=`es`, timeout=`5000`, maxRetries=`5`
  - [x] 1.3 Create medical vocabulary prompt constant
    - Create `apps/server/src/modules/transcription/constants/prompts.ts`
    - Export `PHYSIO_TRANSCRIPTION_PROMPT` with Spanish medical terminology
    - Include: fascitis plantar, escoliosis, lumbalgia, cervicalgia, ciática, hernia discal, tendinitis, contractura muscular, escala EVA, índice de Barthel, goniometría
  - [x] 1.4 Update environment configuration
    - Add `GROQ_API_KEY` to `.env.example`
    - Document in existing env setup instructions
  - [x] 1.5 Register ScheduleModule in AppModule
    - Import `ScheduleModule` from `@nestjs/schedule`
    - Add `ScheduleModule.forRoot()` to AppModule imports array

**Acceptance Criteria:**

- Dependencies installed and listed in package.json
- Configuration file exports valid config object
- Medical prompt constant is exportable
- `.env.example` updated with new variable
- ScheduleModule registered in AppModule

---

### Service Layer

#### Task Group 2: TranscriptionService Implementation

**Dependencies:** Task Group 1

- [x] 2.0 Complete TranscriptionService
  - [x] 2.1 Write 4-6 focused tests for TranscriptionService
    - Follow `storage.service.spec.ts` pattern
    - Mock `groq-sdk` at module level with `jest.mock('groq-sdk')`
    - Test 1: Successful transcription returns text
    - Test 2: Timeout throws appropriate error
    - Test 3: Rate limit (429) triggers retry logic
    - Test 4: Max retries exceeded marks as failed
    - Test 5: API error stores error message
    - Test 6: Calculates correct exponential backoff delay
  - [x] 2.2 Create TranscriptionModule structure
    - Create folder `apps/server/src/modules/transcription/`
    - Create `transcription.module.ts` with imports, providers, exports
    - Import `ConfigModule` for configuration access
  - [x] 2.3 Implement TranscriptionService
    - Create `transcription.service.ts`
    - Inject `ConfigService` for API key and settings
    - Initialize Groq client in constructor
    - Implement `transcribe(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult>`
    - Use `whisper-large-v3` model, `es` language, medical prompt
    - Wrap API call with configurable timeout (AbortController)
    - Return `{ text: string, status: 'completed' | 'failed', error?: string }`
  - [x] 2.4 Implement retry utility with exponential backoff
    - Create `utils/retry.ts` in transcription module
    - Implement `withRetry<T>(fn, options): Promise<T>`
    - Exponential backoff: delay = min(1000 \* 2^attempt, 16000)
    - Respect `Retry-After` header on 429 errors
    - Max attempts configurable (default 5)
  - [x] 2.5 Create TranscriptionResult DTO
    - Create `dto/transcription-result.dto.ts`
    - Fields: `text`, `status`, `error`, `retryCount`
  - [x] 2.6 Run TranscriptionService tests
    - Execute: `pnpm --filter server test transcription.service`
    - Verify all 4-6 tests pass
    - Do NOT run entire test suite

**Acceptance Criteria:**

- All 4-6 TranscriptionService tests pass
- Service correctly calls Groq API with configured parameters
- Timeout handling works correctly
- Exponential backoff utility functions correctly
- Rate limit handling respects Retry-After header

---

#### Task Group 3: Integration & Cron Processor

**Dependencies:** Task Group 2

- [x] 3.0 Complete integration with MediaService
  - [x] 3.1 Write 3-4 focused integration tests
    - Test 1: Voice note upload triggers transcription attempt
    - Test 2: Successful transcription updates voiceNotes JSON with text and status
    - Test 3: Timeout saves with pending status for retry
    - Test 4: Cron processor picks up pending items
  - [x] 3.2 Extend VoiceNote interface
    - Update type definition (or add to shared types)
    - Add fields: `transcriptionStatus`, `transcriptionError`, `retryCount`, `createdAt`
    - Status enum: `'pending' | 'processing' | 'completed' | 'failed'`
  - [x] 3.3 Modify MediaService.uploadVoiceNote()
    - Import and inject `TranscriptionService`
    - After file upload, fetch audio buffer from storage
    - Call `transcriptionService.transcribe()` with 5s timeout
    - On success: set `transcriptionStatus: 'completed'`, `transcription: text`
    - On timeout/error: set `transcriptionStatus: 'pending'`, `retryCount: 0`
    - Update Prisma JSON push with extended voiceNote object
  - [x] 3.4 Implement TranscriptionProcessor (Cron)
    - Create `transcription.processor.ts`
    - Use `@Cron('*/30 * * * * *')` decorator for every 30 seconds
    - Query Evaluations and TreatmentSessions with pending voiceNotes
    - Process each pending item: fetch audio, attempt transcription
    - Update status to `completed` or increment `retryCount`
    - Mark as `failed` after 5 retries
    - Add logging for each processing attempt
  - [x] 3.5 Export TranscriptionService from module
    - Add to TranscriptionModule exports
    - Import TranscriptionModule in MediaModule
  - [x] 3.6 Run integration tests
    - Execute: `pnpm --filter server test media.service`
    - Execute: `pnpm --filter server test transcription.processor`
    - Verify all 3-4 integration tests pass

**Acceptance Criteria:**

- Voice note upload includes transcription attempt
- Successful transcriptions populate `transcription` field
- Failed/timeout attempts saved with `pending` status
- Cron processor runs every 30 seconds
- Retry count increments correctly
- Items marked `failed` after 5 retries

---

### Testing Layer

#### Task Group 4: Test Review & Verification

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review and finalize testing
  - [x] 4.1 Review all tests from Task Groups 2-3
    - Review 4-6 tests from TranscriptionService (Task 2.1)
    - Review 3-4 tests from Integration (Task 3.1)
    - Total existing tests: approximately 7-10 tests
  - [x] 4.2 Add up to 3 additional strategic tests if gaps found
    - Gap 1 (if needed): End-to-end evaluation voice note flow
    - Gap 2 (if needed): End-to-end session voice note flow
    - Gap 3 (if needed): Concurrent transcription handling
  - [x] 4.3 Run all feature-specific tests
    - Execute: `pnpm --filter server test --testPathPattern="transcription|media.service"`
    - Expected total: 10-13 tests
    - Verify all pass
  - [x] 4.4 Manual verification with real API (optional)
    - Set valid `GROQ_API_KEY` in `.env`
    - Start server: `pnpm --filter server start:dev`
    - Upload test voice note via Swagger
    - Verify transcription appears in response
    - Check Spanish medical terms are recognized

**Acceptance Criteria:**

- All 10-13 feature-specific tests pass
- TranscriptionService correctly integrates with Groq API
- VoiceNote JSON structure updated correctly
- Cron processor handles pending items
- No regressions in existing media functionality

---

## Execution Order

Recommended implementation sequence:

```
1. Infrastructure Layer (Task Group 1) ─────────────────────┐
   - Dependencies, config, constants                        │
   - ~1 hour                                                │
                                                            ▼
2. Service Layer (Task Group 2) ────────────────────────────┐
   - TranscriptionService + tests                           │
   - ~3 hours                                               │
                                                            ▼
3. Integration Layer (Task Group 3) ────────────────────────┐
   - MediaService integration + Cron                        │
   - ~2.5 hours                                             │
                                                            ▼
4. Testing Layer (Task Group 4) ────────────────────────────┘
   - Review, gaps, verification
   - ~1.5 hours
```

---

## File Changes Summary

| File                                                                    | Action | Description                    |
| ----------------------------------------------------------------------- | ------ | ------------------------------ |
| `package.json`                                                          | Modify | Add groq-sdk, @nestjs/schedule |
| `apps/server/src/config/transcription.config.ts`                        | Create | Configuration for Groq API     |
| `apps/server/src/modules/transcription/`                                | Create | New module folder              |
| `apps/server/src/modules/transcription/transcription.module.ts`         | Create | Module definition              |
| `apps/server/src/modules/transcription/transcription.service.ts`        | Create | Groq API wrapper               |
| `apps/server/src/modules/transcription/transcription.service.spec.ts`   | Create | Unit tests                     |
| `apps/server/src/modules/transcription/transcription.processor.ts`      | Create | Cron job handler               |
| `apps/server/src/modules/transcription/constants/prompts.ts`            | Create | Medical vocabulary             |
| `apps/server/src/modules/transcription/dto/transcription-result.dto.ts` | Create | Result DTO                     |
| `apps/server/src/modules/transcription/utils/retry.ts`                  | Create | Retry utility                  |
| `apps/server/src/modules/media/media.module.ts`                         | Modify | Import TranscriptionModule     |
| `apps/server/src/modules/media/media.service.ts`                        | Modify | Integrate transcription        |
| `apps/server/src/app.module.ts`                                         | Modify | Add ScheduleModule             |
| `.env.example`                                                          | Modify | Add GROQ_API_KEY               |

**Total new files:** 9
**Total modified files:** 5
