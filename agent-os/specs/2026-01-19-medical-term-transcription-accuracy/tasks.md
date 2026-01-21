# Task Breakdown: Medical Term Transcription Accuracy Testing

## Overview

Total Tasks: 12 (3 task groups)

## Task List

### Test Fixtures Setup

#### Task Group 1: Audio Fixtures and Expected Outputs

**Dependencies:** None

- [x] 1.0 Complete test fixtures setup
  - [x] 1.1 Create fixture directory structure
    - Create `apps/server/src/modules/transcription/__fixtures__/` directory
    - Create `audio/` subdirectory for M4A files
    - Create `expected-transcriptions.json` file
  - [x] 1.2 Create recording instructions document
    - Include exact Spanish phrases for all 8 audio clips
    - Specify M4A format, 16kHz+ sample rate requirements
    - Instructions for natural clinical dictation pace
    - Save as `__fixtures__/RECORDING_INSTRUCTIONS.md`
  - [x] 1.3 Define expected transcriptions
    - Write `expected-transcriptions.json` with exact text for each fixture
    - Cover all 25 curated terms from `PHYSIO_TRANSCRIPTION_PROMPT`
    - Include file mapping: conditions-1.m4a → expected text
  - [ ] 1.4 User: Record audio fixtures
    - Record 8 M4A clips (10-30 seconds each) using iPad/iPhone
    - Follow phrases from recording instructions document
    - Speak clearly at natural clinical pace in quiet environment
    - Save with exact filenames: conditions-1.m4a through scales-full.m4a
    - Place files in `__fixtures__/audio/` directory
  - [ ] 1.5 Verify fixture files exist and are valid
    - Check all 8 audio files are present in `__fixtures__/audio/`
    - Verify `expected-transcriptions.json` is valid JSON
    - Confirm audio files can be read by Node.js `fs` module

**Acceptance Criteria:**

- 8 M4A audio files present in `__fixtures__/audio/`
- `expected-transcriptions.json` contains expected text for all fixtures
- `RECORDING_INSTRUCTIONS.md` documents exact phrases to dictate
- All 25 curated medical terms covered across fixtures

---

### Integration Tests

#### Task Group 2: Accuracy Validation Tests

**Dependencies:** Task Group 1

- [x] 2.0 Complete integration tests for accuracy
  - [x] 2.1 Write 2-8 focused tests for transcription accuracy
    - Test each of the 8 audio fixtures independently
    - Use `describe.skipIf(!process.env.GROQ_API_KEY)` for CI safety
    - Mock ONLY file system, use real TranscriptionService and Groq API
    - Test: 100% accuracy for all 25 curated medical terms
    - Test: ≤10% WER for full sentence transcriptions
    - Test: 0% critical errors (medical term → different medical term)
    - Limit to 8 focused tests maximum (one per fixture)
  - [x] 2.2 Create transcription.accuracy.spec.ts
    - Follow pattern from existing `transcription.service.spec.ts`
    - Import `TranscriptionService`, read fixtures from `__fixtures__` directory
    - Use `fs.readFileSync` to load audio fixtures
    - Implement WER calculation utility function
    - Implement critical error detection utility
  - [x] 2.3 Implement WER calculation logic
    - Create helper function: calculateWER(expected, actual)
    - Formula: (substitutions + deletions + insertions) / total words
    - Return percentage result (0-100)
  - [x] 2.4 Implement medical term accuracy checker
    - Create helper function: checkMedicalTermAccuracy(expected, actual)
    - Parse 25 curated terms from `PHYSIO_TRANSCRIPTION_PROMPT`
    - Return count: correct / total, percentage
  - [x] 2.5 Implement critical error detection
    - Create helper function: detectCriticalErrors(expected, actual)
    - Check for medical term → different medical term substitutions
    - Example: "ciática" → "psoriasis" = critical error
    - Return count and list of critical errors
  - [x] 2.6 Add latency measurement
    - Measure time from `service.transcribe()` call to result
    - Assert < 3 seconds latency in tests
    - Log latency to test output
  - [ ] 2.7 Ensure integration tests pass
    - Run ONLY tests written in 2.1
    - Verify all 8 fixture tests pass
    - Verify accuracy thresholds met (100% terms, ≤10% WER, 0% critical errors)
    - Verify latency < 3s average
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**

- `transcription.accuracy.spec.ts` created with 8 tests
- All tests use real Groq API (not mocked transcription)
- Tests skip when `GROQ_API_KEY` unavailable
- 100% medical term accuracy achieved
- WER ≤ 10% for all fixtures
- Zero critical errors detected
- Average latency < 3 seconds

---

### Documentation

#### Task Group 3: QA Protocol and Accuracy Report

**Dependencies:** Task Groups 1-2

- [x] 3.0 Complete documentation for manual QA
  - [x] 3.1 Create manual QA protocol document
    - Save as `agent-os/specs/2026-01-19-medical-term-transcription-accuracy/implementation/manual-qa-protocol.md`
    - Include checklist for all 25 curated medical terms
    - Include full clinical note test scenarios
    - Track: pass/fail per term, overall WER, device type, network condition
    - Include environment tracking: device model, iOS version, Safari version, WiFi vs 4G
    - Provide instructions for recording test sessions
  - [x] 3.2 Create accuracy report template
    - Save as `agent-os/specs/2026-01-19-medical-term-transcription-accuracy/implementation/accuracy-report.md`
    - Sections: Medical Term Accuracy, WER, Critical Errors, Latency
    - Include date, tester name, environment summary fields
    - Provide summary table with pass/fail indicators for all tests
    - Include issues found section and recommended actions
  - [ ] 3.3 Execute manual QA on iPad Safari
    - Load app on iPad with Safari browser
    - Test each of the 25 curated terms using VoiceRecorder
    - Test 2-3 full clinical notes (30-60 seconds)
    - Record results: pass/fail per term, observed transcription text
    - Track: device model, iOS version, network (WiFi/4G)
  - [ ] 3.4 Calculate and document WER from manual tests
    - Use WER calculation from integration tests (2.3) or manual calculation
    - Calculate overall WER across all manual test sessions
    - Document WER per test case and average
  - [ ] 3.5 Identify and document any critical errors
    - Review manual test results for medical term substitutions
    - Mark any critical errors found during manual QA
    - List specific term misrecognitions (e.g., "ciática" → "siatica")
  - [ ] 3.6 Compile accuracy report
    - Fill accuracy report template with manual QA results
    - Include: medical term accuracy percentage, WER, critical errors count
    - Add latency measurements from integration tests
    - Document any issues observed and environment conditions
    - Sign-off section with pass/fail recommendation
  - [ ] 3.7 Verify documentation completeness
    - Ensure manual-qa-protocol.md covers all test scenarios
    - Ensure accuracy-report.md is complete with all metrics
    - Verify both documents are saved in `implementation/` directory

**Acceptance Criteria:**

- `manual-qa-protocol.md` created with all 25 terms checklist
- `accuracy-report.md` template created with required sections
- Manual QA executed on iPad Safari
- All results documented with pass/fail indicators
- WER calculated and documented
- Critical errors identified and documented
- Complete accuracy report generated

---

## Execution Order

Recommended implementation sequence:

1. Test Fixtures Setup (Task Group 1)
2. Integration Tests (Task Group 2)
3. Documentation (Task Group 3)

**Note**: Task 1.4 (User: Record audio fixtures) is the blocker - all other tasks depend on these audio files being present.

---

## Effort Estimation

| Task Group                        | Estimated Time                                    |
| --------------------------------- | ------------------------------------------------- |
| Task Group 1: Test Fixtures Setup | 2 hours (1.5 hours prep + 30 min user recording)  |
| Task Group 2: Integration Tests   | 1.5 hours                                         |
| Task Group 3: Documentation       | 2 hours (1 hour execution + 1 hour documentation) |
| **Total**                         | **~5.5 hours**                                    |
