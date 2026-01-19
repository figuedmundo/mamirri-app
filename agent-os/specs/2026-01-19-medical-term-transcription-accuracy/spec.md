# Specification: Medical Term Transcription Accuracy Testing

## Goal

Validate that Whisper/Groq transcription system accurately recognizes Spanish physiotherapy terminology before field testing begins in Week 9, establishing accuracy baselines and identifying any prompt refinements needed.

## User Stories

- As a physiotherapist, I want my medical terms transcribed accurately so that clinical documentation is reliable and safe
- As a developer, I want automated accuracy tests so that transcription doesn't regress with code changes

## Specific Requirements

**Audio Test Fixtures**

- Create 8 M4A audio clips (10-30 seconds each) covering all 25 curated terms from `PHYSIO_TRANSCRIPTION_PROMPT`
- Store fixtures in `apps/server/src/modules/transcription/__fixtures__/audio/` directory
- Create `expected-transcriptions.json` with exact expected text for each fixture
- Include recording instructions with specific Spanish phrases to dictate
- Use M4A format, 16kHz+ sample rate, clear speech at natural clinical pace

**Integration Tests for Accuracy Validation**

- Create `transcription.accuracy.spec.ts` file in transcription module
- Write tests that call actual Groq API (not mocked) for each audio fixture
- Measure and assert: 100% accuracy for 25 curated terms, ≤10% WER for full sentences
- Use `describe.skipIf(!process.env.GROQ_API_KEY)` pattern to skip tests when API key unavailable
- Calculate WER: (substitutions + deletions + insertions) / total words
- Test each fixture independently, not as a single batch

**Manual QA Protocol**

- Create structured checklist document for iPad Safari testing
- Include all 25 curated terms plus full clinical note scenarios
- Track: pass/fail per term, overall WER, critical errors, device type, network condition
- Document environment: device model, iOS version, Safari version, WiFi vs 4G
- Include instructions for recording test sessions and collecting results

**Accuracy Report Template**

- Create markdown template with sections: Medical Term Accuracy, WER, Critical Errors, Latency
- Include date, tester name, and environment summary
- Provide summary table of all test results with pass/fail indicators
- Document any issues found and recommended actions

**Prompt Refinement Path**

- If any curated term fails in tests, update `PHYSIO_TRANSCRIPTION_PROMPT` in `constants/prompts.ts`
- Re-run affected tests to verify fix
- Document any changes made to prompt in accuracy report
- Limit to 25 terms (max prompt size) - replace least critical term if needed

**Test Execution Control**

- Tests should run automatically when `GROQ_API_KEY` is present
- CI/CD pipeline should skip by default to avoid API costs
- Enable manual CI run for release validation with API key injection
- Log all test results and accuracy metrics

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**TranscriptionService**

- Primary target service under test, wraps Groq SDK for audio transcription
- Use existing `transcribe(audioBuffer, filename)` method for all accuracy tests
- Follows configured model (`whisper-large-v3`), language (`es`), and medical prompt

**Transcription Test Patterns**

- `transcription.service.spec.ts`: Jest unit test patterns with mocked Groq SDK
- `transcription.processor.spec.ts`: Integration test patterns with mocked Prisma and StorageService
- Follow existing `beforeEach`/`afterEach` cleanup and mocking patterns

**Medical Vocabulary Prompt**

- `apps/server/src/modules/transcription/constants/prompts.ts`: 25 Spanish physiotherapy terms
- Test must validate all terms in this prompt achieve 100% recognition accuracy
- Prompt is input parameter to Groq API transcription call

**Jest Configuration**

- Existing test setup supports `describe.skipIf()` pattern for conditional test execution
- Logger integration available for test result documentation
- Test fixture directory structure supported by existing module layout

**StorageService Upload Integration**

- `MediaService.uploadVoiceNote()` triggers transcription in production flow
- Accuracy tests verify the transcription result that would be stored in database
- Follow existing error handling patterns for API failures

## Out of Scope

- Frontend UI changes or components
- New API endpoints or modifications to existing endpoints
- TranscriptionService implementation (completed in 7.4)
- VoiceRecorder component (completed in 7.5)
- Performance optimization or benchmarking beyond accuracy measurement
- Multi-language support (only Spanish validated in this spec)
- Offline transcription testing
- Manual transcription editing UI features
- Separate Transcription database entity or migrations
