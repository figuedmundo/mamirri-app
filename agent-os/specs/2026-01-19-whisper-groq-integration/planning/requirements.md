# Spec Requirements: Whisper Groq Integration

## Initial Description

**Roadmap Task 7.4:** Backend: Whisper integration (Groq API)

Integrate OpenAI Whisper via Groq API for voice note transcription in the Mamirri physiotherapy app. This enables therapists to dictate clinical notes hands-free during patient sessions, with automatic transcription to text.

Part of **Week 7: Media & Dictation** milestone.
Goal: **Milestone 3** - "I can take photos and dictate notes"

---

## Requirements Discussion

### First Round Questions

**Q1:** Should transcription happen synchronously (blocking) or asynchronously (background job)?

**Answer:** Hybrid approach - synchronous with 5-second timeout, falling back to async retry via cron job.

**Rationale:**

- Groq Whisper is extremely fast (189x-262x real-time). A 30-second voice note transcribes in ~150ms.
- For typical clinical dictations (< 2 minutes), synchronous is fine.
- 5-second timeout prevents blocking on network issues.
- Avoids adding Bull/Redis queue infrastructure for MVP.
- Cron job (`@nestjs/schedule`) handles pending items without new dependencies.

---

**Q2:** Which Whisper model should we use?

**Answer:** `whisper-large-v3` for maximum medical terminology accuracy.

**Rationale:**

- Medical terminology requires maximum accuracy (10.3% WER vs 12% for turbo).
- Cost impact is minimal at expected volume: ~$0.19/month for 100 voice notes.
- Supports translation if needed for future English reports.

| Model                    | WER   | Speed | Cost/hour |
| ------------------------ | ----- | ----- | --------- |
| `whisper-large-v3` ✅    | 10.3% | 189x  | $0.111    |
| `whisper-large-v3-turbo` | 12%   | 216x  | $0.04     |

---

**Q3:** Should we specify language or use auto-detection?

**Answer:** Fixed Spanish (`es`) for MVP.

**Rationale:**

- Groq docs state: "Specifying language improves accuracy and latency"
- 99% of dictations will be Spanish
- Simplest implementation, optimal for target use case
- Future: Store language preference in User model for multi-language support

---

**Q4:** Should we use the Groq prompt parameter for medical vocabulary?

**Answer:** Yes, use a curated physiotherapy vocabulary prompt.

**Prompt (max 224 tokens):**

```
Transcripción de notas clínicas de fisioterapia en español.
Términos frecuentes: fascitis plantar, escoliosis, lumbalgia, cervicalgia,
ciática, hernia discal, tendinitis, contractura muscular, esguince,
bursitis, síndrome del túnel carpiano, epicondilitis, gonalgia,
coxalgia, dorsalgia, parestesia, hiperlordosis, cifosis,
prueba de Lasègue, maniobra de Phalen, test de Thomas,
escala EVA, índice de Barthel, goniometría.
```

**Rationale:**

- Improves recognition of domain-specific Spanish medical terms
- Includes conditions, tests, and scales already used in the app

---

**Q5:** How should we handle errors and track transcription status?

**Answer:** Add `transcriptionStatus` enum + exponential backoff retry (max 5 attempts).

**VoiceNote structure update:**

```typescript
interface VoiceNote {
  audioUrl: string;
  transcription: string | null;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionError?: string;
  durationSeconds: number;
  createdAt: string;
}
```

**Retry strategy:**

- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max 5 retries before marking as `failed`
- Respect `Retry-After` header on 429 errors

---

**Q6:** Should we store transcriptions in the existing JSON field or create a separate entity?

**Answer:** Keep existing JSON structure in `voiceNotes` field.

**Rationale:**

- No migration required
- Matches current schema pattern
- Simpler queries for MVP use case
- Can add separate `Transcription` entity later if search across all notes is needed

---

**Q7:** What should happen when transcription fails permanently?

**Answer:** Mark as failed + show UI warning + allow manual retry.

| Failure Type                  | Action                                                |
| ----------------------------- | ----------------------------------------------------- |
| Transient (429, 500, timeout) | Auto-retry up to 5 times                              |
| Permanent (corrupted audio)   | Mark `failed`, store error message                    |
| User notification             | Show warning icon in voice note list                  |
| Manual retry                  | "Reintentar transcripción" button (frontend task 7.5) |

---

### Existing Code to Reference

**Similar Features Identified:**

| Pattern              | Location                                             | Usage                                       |
| -------------------- | ---------------------------------------------------- | ------------------------------------------- |
| External API wrapper | `apps/server/src/modules/storage/storage.service.ts` | Follow this pattern for GroqService         |
| File upload handling | `apps/server/src/modules/media/media.service.ts`     | Integration point for transcription trigger |
| Config management    | `apps/server/src/config/storage.config.ts`           | Pattern for `transcription.config.ts`       |
| DTO validation       | `apps/server/src/modules/media/dto/`                 | Follow existing DTO patterns                |

**No existing patterns for:**

- Background job queues (use `@nestjs/schedule` @Cron instead)
- Retry with exponential backoff (implement new utility)
- Event-driven architecture (use NestJS EventEmitter)

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend-only feature. Frontend UI (voice recorder button, transcription display) is covered in roadmap task 7.5.

---

## Requirements Summary

### Functional Requirements

1. **Transcription Service**
   - Create `TranscriptionModule` with `TranscriptionService` wrapping Groq API
   - Use official `groq-sdk` npm package for TypeScript integration
   - Configure via environment variable `GROQ_API_KEY`

2. **Voice Note Flow**
   - On voice note upload, attempt synchronous transcription (5s timeout)
   - If successful, save with `transcriptionStatus: 'completed'`
   - If timeout/error, save with `transcriptionStatus: 'pending'`
   - Cron job processes pending items every 30 seconds

3. **Groq API Configuration**
   - Model: `whisper-large-v3`
   - Language: `es` (Spanish)
   - Response format: `json`
   - Include medical vocabulary prompt

4. **Error Handling**
   - Retry transient errors with exponential backoff
   - Max 5 retry attempts
   - Store error message on permanent failure
   - Respect rate limit headers

5. **Data Model Update**
   - Extend VoiceNote interface with `transcriptionStatus` and `transcriptionError`
   - Update existing null transcriptions to `status: 'pending'` (migration)

### API Endpoints

No new endpoints required. Transcription happens automatically on existing:

- `POST /media/evaluations/:evaluationId/voice-notes`
- `POST /media/sessions/:sessionId/voice-notes`

Future consideration: Add manual retry endpoint

- `POST /media/voice-notes/:id/retry-transcription`

### Reusability Opportunities

- `TranscriptionService` can be reused for future AI features (Week 12-16)
- Retry utility can be extracted to shared utils
- Event-driven pattern enables future webhooks/notifications

### Scope Boundaries

**In Scope:**

- TranscriptionModule with GroqService
- Integration with existing voice note upload flow
- Transcription status tracking
- Retry mechanism for failed transcriptions
- Error handling and logging
- Environment configuration for API key
- Unit tests for TranscriptionService

**Out of Scope:**

- Frontend voice recorder UI (task 7.5)
- Frontend transcription display (task 7.5)
- Structured data extraction from transcriptions (Part 2: AI)
- Real-time streaming transcription
- Multi-language support beyond Spanish
- Offline transcription

### Technical Considerations

**Dependencies to add:**

```json
{
  "groq-sdk": "^0.3.0"
}
```

**Environment variables:**

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

**Module structure:**

```
apps/server/src/modules/transcription/
├── transcription.module.ts
├── transcription.service.ts
├── transcription.processor.ts    # @Cron handler
├── transcription.config.ts
├── constants/
│   └── prompts.ts               # Medical vocabulary prompt
└── dto/
    └── transcription-result.dto.ts
```

**Integration points:**

1. `MediaService.uploadVoiceNote()` - Trigger transcription after upload
2. `Evaluation.voiceNotes` / `TreatmentSession.voiceNotes` - Update with transcription

**Supported audio formats (per Groq API):**

- flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm

**Existing StorageService already validates:**

- audio/wav, audio/mpeg, audio/mp4 (25MB limit)

### Performance Considerations

- Groq Whisper: 189x real-time (30s audio = ~150ms transcription)
- Timeout: 5 seconds for synchronous attempt
- Cron interval: 30 seconds for retry processing
- Max file size: 25MB (enforced by StorageService)

### Security Considerations

- API key stored in environment variable, never in code
- No PII sent to Groq (audio only, no patient identifiers)
- Transcription stored in same secure database as other clinical data
- Access controlled by existing therapist ownership verification

---

## Acceptance Criteria

1. [ ] Voice note upload triggers automatic transcription
2. [ ] Transcription text appears in `voiceNotes[].transcription` field
3. [ ] `transcriptionStatus` correctly reflects state (pending/processing/completed/failed)
4. [ ] Failed transcriptions are retried up to 5 times
5. [ ] Permanently failed transcriptions store error message
6. [ ] Spanish medical terms are correctly transcribed (test with: "fascitis plantar", "escala EVA")
7. [ ] Transcription completes within 5 seconds for typical dictations (< 2 min)
8. [ ] Unit tests cover TranscriptionService with mocked Groq API
9. [ ] Integration test verifies end-to-end flow

---

## Estimation

| Task                                   | Effort      |
| -------------------------------------- | ----------- |
| TranscriptionModule setup              | 1 hour      |
| TranscriptionService (Groq wrapper)    | 2 hours     |
| Integration with MediaService          | 1 hour      |
| Cron processor for retries             | 1 hour      |
| VoiceNote interface update + migration | 30 min      |
| Unit tests                             | 1.5 hours   |
| Integration tests                      | 1 hour      |
| **Total**                              | **8 hours** |
