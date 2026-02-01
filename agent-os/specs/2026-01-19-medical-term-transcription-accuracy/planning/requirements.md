# Spec Requirements: Medical Term Transcription Accuracy

## Initial Description

**Roadmap Task 7.7:** Test: Dictate medical terms, verify accuracy

Validate that the Whisper/Groq transcription system (implemented in 7.4-7.6) accurately recognizes Spanish physiotherapy terminology before field testing begins in Week 9. This is a QA/validation task that establishes accuracy baselines and identifies any prompt refinements needed.

Part of **Week 7: Media & Dictation** milestone.
Goal: **Milestone 3** - "I can take photos and dictate notes"

---

## Requirements Discussion

### First Round Questions

**Q1:** Should this be automated tests, manual QA, or both?

**Answer:** Hybrid approach - automated integration tests for regression protection + manual QA protocol for real-world validation.

**Rationale:**

- Automated tests ensure accuracy doesn't regress with code changes and run in CI/CD
- Manual QA catches real-world variability (accents, background noise, speaking speed)
- Both are needed for confidence before Week 9 field testing
- Automated alone can't test actual user experience; manual alone isn't repeatable

---

**Q2:** Do pre-recorded audio fixtures exist, or need to be created?

**Answer:** Need to be created. Include recording instructions in the spec.

**Rationale:**

- No audio fixtures currently exist in the codebase
- Using the primary user's voice (the physiotherapist) is the most realistic test
- Recording 8 clips (~10-30 seconds each) takes ~15 minutes
- These become permanent test assets for regression testing
- TTS alternatives don't test real accents, cadence, or clinical speaking patterns

---

**Q3:** What accuracy thresholds should we target?

**Answer:**

- **100%** accuracy for the 25 curated vocabulary terms in `PHYSIO_TRANSCRIPTION_PROMPT`
- **≤10% WER** (Word Error Rate) for full clinical sentences
- **0%** critical error rate (medical term → different medical term substitution)

**Rationale:**

- Medical context demands high accuracy - misrecognized diagnoses are unacceptable
- Whisper-large-v3 achieves 10.3% WER benchmark; we should match that
- The curated prompt exists specifically to guarantee these 25 terms - 100% is expected
- If we can't hit 100% on prompted terms, the prompt needs refinement
- Critical errors (e.g., "ciática" → "psoriasis") would be dangerous; must be zero

---

**Q4:** Should scope include prompt refinement if accuracy is below threshold?

**Answer:** Yes, include prompt refinement as contingency.

**Rationale:**

- If tests reveal accuracy gaps, we need to fix them before Week 9
- The fix is straightforward: update `PHYSIO_TRANSCRIPTION_PROMPT` with problem terms
- Testing without a path to resolution is incomplete
- Keeps the feedback loop tight: test → measure → fix → retest

---

**Q5:** Where should tests run - CI/CD or local only?

**Answer:** Both, with CI/CD tests skipped unless `GROQ_API_KEY` is available.

**Rationale:**

- Integration tests call the real Groq API (no mocking for accuracy validation)
- Local development: run with API key to validate changes
- CI/CD: skip by default to avoid API costs; run manually for release validation
- Use Jest's `describe.skipIf(!process.env.GROQ_API_KEY)` pattern

---

**Q6:** What audio format and recording guidelines?

**Answer:** M4A format, 16kHz+ sample rate, clear speech at natural clinical pace.

**Rationale:**

- M4A is native iOS/Safari recording format (iPad is production target)
- Matches existing `audio/mp4` validation in StorageService
- 16kHz is minimum for speech recognition quality
- Natural clinical pace tests real-world usage, not artificially slow dictation

---

### Existing Code to Reference

**Similar Features Identified:**

| Pattern                   | Location                                                                | Usage                     |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------- |
| TranscriptionService      | `apps/server/src/modules/transcription/transcription.service.ts`        | Target service under test |
| Medical vocabulary prompt | `apps/server/src/modules/transcription/constants/prompts.ts`            | Terms to verify           |
| Existing unit tests       | `apps/server/src/modules/transcription/transcription.service.spec.ts`   | Test patterns to follow   |
| Processor tests           | `apps/server/src/modules/transcription/transcription.processor.spec.ts` | Integration test patterns |

**Curated Vocabulary (25 terms to verify 100% accuracy):**

From `PHYSIO_TRANSCRIPTION_PROMPT`:

1. fascitis plantar
2. escoliosis
3. lumbalgia
4. cervicalgia
5. ciática
6. hernia discal
7. tendinitis
8. contractura muscular
9. esguince
10. bursitis
11. síndrome del túnel carpiano
12. epicondilitis
13. gonalgia
14. coxalgia
15. dorsalgia
16. parestesia
17. hiperlordosis
18. cifosis
19. prueba de Lasègue
20. maniobra de Phalen
21. test de Thomas
22. escala EVA
23. índice de Barthel
24. goniometría

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a testing/validation task. No UI changes.

---

## Requirements Summary

### Functional Requirements

1. **Audio Test Fixtures**
   - Create 8 pre-recorded audio clips covering all 25 curated vocabulary terms
   - Format: M4A, 16kHz+ sample rate, clear speech
   - Store in `apps/server/src/modules/transcription/__fixtures__/audio/`
   - Include recording script with exact phrases to dictate

2. **Integration Tests**
   - Create `transcription.accuracy.spec.ts` for accuracy validation
   - Skip tests if `GROQ_API_KEY` not available (CI-safe)
   - Test each fixture against expected transcription output
   - Measure and assert accuracy thresholds

3. **Manual QA Protocol**
   - Create checklist document for iPad Safari testing
   - Include all 25 curated terms plus full clinical note scenarios
   - Track pass/fail for each term and overall WER
   - Document device, network, and environment conditions

4. **Accuracy Report Template**
   - Markdown template to document test results
   - Sections: Medical Term Accuracy, WER, Critical Errors, Latency
   - Include date, tester, environment, and any issues found

5. **Prompt Refinement (Contingency)**
   - If any curated term fails, update `PHYSIO_TRANSCRIPTION_PROMPT`
   - Re-run tests to verify fix
   - Document any changes made

### Test Cases

**Audio Fixture Plan (8 clips):**

| #   | Filename             | Content                                                                                                                      | Terms Covered                                         |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | `conditions-1.m4a`   | "El paciente presenta fascitis plantar bilateral con dolor intenso"                                                          | fascitis plantar                                      |
| 2   | `conditions-2.m4a`   | "Diagnóstico de escoliosis lumbar, lumbalgia crónica y cervicalgia"                                                          | escoliosis, lumbalgia, cervicalgia                    |
| 3   | `conditions-3.m4a`   | "Ciática por hernia discal L4-L5, parestesia en miembro inferior"                                                            | ciática, hernia discal, parestesia                    |
| 4   | `conditions-4.m4a`   | "Tendinitis del supraespinoso, contractura muscular en trapecio, esguince de tobillo grado dos"                              | tendinitis, contractura muscular, esguince            |
| 5   | `conditions-5.m4a`   | "Bursitis trocantérica, síndrome del túnel carpiano bilateral, epicondilitis lateral"                                        | bursitis, síndrome del túnel carpiano, epicondilitis  |
| 6   | `conditions-6.m4a`   | "Gonalgia derecha, coxalgia bilateral, dorsalgia mecánica, hiperlordosis lumbar con cifosis dorsal"                          | gonalgia, coxalgia, dorsalgia, hiperlordosis, cifosis |
| 7   | `clinical-tests.m4a` | "Prueba de Lasègue positiva a treinta grados, maniobra de Phalen positiva, test de Thomas negativo"                          | prueba de Lasègue, maniobra de Phalen, test de Thomas |
| 8   | `scales-full.m4a`    | "Escala EVA siete sobre diez, índice de Barthel ochenta y cinco puntos, goniometría de rodilla flexión ciento veinte grados" | escala EVA, índice de Barthel, goniometría            |

### Accuracy Metrics

| Metric                    | Definition                                             | Target | Measurement                    |
| ------------------------- | ------------------------------------------------------ | ------ | ------------------------------ |
| **Medical Term Accuracy** | % of 25 curated terms correctly recognized             | 100%   | Count correct / 25             |
| **Word Error Rate (WER)** | (Substitutions + Deletions + Insertions) / Total Words | ≤10%   | Calculate per fixture, average |
| **Critical Error Rate**   | Medical terms misrecognized as different medical terms | 0%     | Manual review                  |
| **Latency**               | Time from API call to transcription complete           | <3s    | Measure in tests               |

### Scope Boundaries

**In Scope:**

- Audio fixture recording instructions and scripts
- Integration tests for accuracy validation (real Groq API)
- Manual QA protocol document
- Accuracy report template
- Prompt refinement if needed
- Documentation of results

**Out of Scope:**

- Mocked unit tests (already exist in `transcription.service.spec.ts`)
- Frontend changes
- New API endpoints
- Performance optimization
- Multi-language support
- Offline transcription testing

### Technical Considerations

**File structure:**

```
apps/server/src/modules/transcription/
├── __fixtures__/
│   ├── audio/
│   │   ├── conditions-1.m4a
│   │   ├── conditions-2.m4a
│   │   ├── conditions-3.m4a
│   │   ├── conditions-4.m4a
│   │   ├── conditions-5.m4a
│   │   ├── conditions-6.m4a
│   │   ├── clinical-tests.m4a
│   │   └── scales-full.m4a
│   └── expected-transcriptions.json
├── transcription.accuracy.spec.ts    # NEW
├── transcription.service.spec.ts     # Existing
└── transcription.processor.spec.ts   # Existing

agent-os/specs/2026-01-19-medical-term-transcription-accuracy/
├── planning/
│   └── requirements.md               # This file
├── implementation/
│   ├── manual-qa-protocol.md         # QA checklist
│   └── accuracy-report.md            # Test results
└── spec.md
```

**Test pattern:**

```typescript
describe.skipIf(!process.env.GROQ_API_KEY)('Transcription Accuracy', () => {
  it('should correctly transcribe fascitis plantar', async () => {
    const audio = fs.readFileSync(
      path.join(__dirname, '__fixtures__/audio/conditions-1.m4a'),
    );
    const result = await service.transcribe(audio, 'conditions-1.m4a');

    expect(result.status).toBe('completed');
    expect(result.text.toLowerCase()).toContain('fascitis plantar');
  });
});
```

**Recording instructions for user:**

1. Use iPad/iPhone Voice Memos app or any M4A recorder
2. Speak clearly at natural clinical dictation pace
3. Record in quiet environment (simulating clinic between patients)
4. Each clip should be 10-30 seconds
5. Save with exact filenames specified above
6. Place in `apps/server/src/modules/transcription/__fixtures__/audio/`

---

## Acceptance Criteria

1. [ ] 8 audio fixture files recorded and placed in `__fixtures__/audio/`
2. [ ] `expected-transcriptions.json` created with expected text for each fixture
3. [ ] `transcription.accuracy.spec.ts` created with tests for all fixtures
4. [ ] All 25 curated medical terms achieve 100% recognition accuracy
5. [ ] Full sentence WER is ≤10% across all fixtures
6. [ ] Zero critical errors (medical term → different medical term)
7. [ ] Manual QA protocol document created
8. [ ] Manual QA executed on iPad Safari and results documented
9. [ ] Accuracy report completed with all metrics
10. [ ] If any term fails: prompt refined and tests re-run to pass

---

## Estimation

| Task                                   | Effort       |
| -------------------------------------- | ------------ |
| Write recording instructions + scripts | 30 min       |
| Record audio fixtures (user task)      | 30 min       |
| Create expected-transcriptions.json    | 15 min       |
| Write integration tests                | 1.5 hours    |
| Create manual QA protocol              | 30 min       |
| Execute manual QA + document           | 1 hour       |
| Prompt refinement (if needed)          | 30 min       |
| Create accuracy report                 | 30 min       |
| **Total**                              | **~5 hours** |

---

## Dependencies

- **Blocker:** Audio fixtures must be recorded by user before tests can run
- **Requires:** Valid `GROQ_API_KEY` in environment for integration tests
- **Builds on:** Completed implementation of 7.4 (Whisper integration), 7.5 (Voice recorder)
