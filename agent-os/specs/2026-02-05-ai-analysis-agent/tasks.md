# Task Breakdown: AI Analysis Agent

## Overview

Total Tasks: 24
Feature Type: Backend-only (NestJS Module)
Estimated Effort: 3-4 days

## Task List

### Foundation Layer

#### Task Group 1: Module Scaffolding & DTOs

**Dependencies:** None

- [x] 1.0 Complete module foundation
  - [x] 1.1 Write 4 focused tests for core DTOs and interfaces
    - Test `AnalyzeCaseDto` validation (clinicalCaseId required, string type)
    - Test `AnalysisResultDto` structure matches expected schema
    - Test confidence enum validation (HIGH/MEDIUM/LOW only)
    - Test citations array structure validation
  - [x] 1.2 Create `ai-analysis.module.ts`
    - Import `KnowledgeBaseModule`, `PrismaModule`, `ConfigModule`
    - Follow pattern from `transcription.module.ts`
    - Export `AiAnalysisService` for external use
  - [x] 1.3 Create request/response DTOs
    - `dto/analyze-case.dto.ts` with `@IsString()`, `@IsNotEmpty()` for clinicalCaseId
    - `dto/analysis-result.dto.ts` with full response structure
    - Add `@ApiProperty` decorators for Swagger documentation
  - [x] 1.4 Create TypeScript interfaces
    - `interfaces/analysis.interfaces.ts` with `AnalysisResult`, `Citation`, `Suggestion` types
    - `interfaces/anonymization.interfaces.ts` with `AnonymizationMapping` type
  - [x] 1.5 Create system prompts constants
    - `constants/system-prompts.ts` with Chain-of-Thought prompt template
    - Include 3-step reasoning structure (Understanding, Literature, Synthesis)
    - Enforce Spanish output and JSON response format
  - [x] 1.6 Ensure foundation tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify DTOs compile without errors

**Acceptance Criteria:**

- The 4 tests written in 1.1 pass
- Module imports compile without circular dependencies
- DTOs have complete Swagger documentation
- System prompt template is well-structured

---

### Services Layer

#### Task Group 2: Anonymizer Service

**Dependencies:** Task Group 1

- [x] 2.0 Complete PII anonymization service
  - [x] 2.1 Write 5 focused tests for anonymization
    - Test patient name replacement with `[PATIENT]`
    - Test birthDate conversion to `[AGE] años` calculation
    - Test email/phone/emergencyContact removal
    - Test reversible mapping storage
    - Test `rehydrate()` correctly restores placeholders
  - [x] 2.2 Create `services/anonymizer.service.ts`
    - Implement `anonymize(caseData: ClinicalCaseWithPatient): AnonymizedResult`
    - Implement `rehydrate(text: string, mapping: AnonymizationMapping): string`
    - Calculate age from birthDate (handle edge cases: future dates, missing dates)
  - [x] 2.3 Implement field detection logic
    - Define PII_FIELDS constant with field paths to anonymize
    - Use nested object traversal for deep anonymization
    - Handle null/undefined fields gracefully
  - [x] 2.4 Add security constraints
    - Never log mapping to persistent storage (use in-memory only)
    - Clear mapping from memory after rehydration complete
    - Log anonymization event without PII details
  - [x] 2.5 Ensure anonymizer tests pass
    - Run ONLY the 5 tests written in 2.1
    - Verify no PII leakage in test output

**Acceptance Criteria:**

- The 5 tests written in 2.1 pass
- All PII fields correctly anonymized
- Age calculation handles edge cases
- Rehydration restores original values

---

#### Task Group 3: Translator Service

**Dependencies:** Task Group 1

- [x] 3.0 Complete translation service
  - [x] 3.1 Write 4 focused tests for translation
    - Test language detection (English vs Spanish)
    - Test EN->ES translation of medical passage
    - Test term-level cache hit (avoid duplicate API calls)
    - Test original quote preservation in `quoteOriginal`
  - [x] 3.2 Create `services/translator.service.ts`
    - Implement `detectLanguage(text: string): 'en' | 'es'`
    - Implement `translateToSpanish(text: string): Promise<TranslatedResult>`
    - Use Gemini for translation (same SDK as main analysis)
  - [x] 3.3 Implement caching layer
    - Check Redis cache first (7-day TTL for passages)
    - Use passage hash as cache key
    - Fall back to API call on cache miss
  - [x] 3.4 Handle translation edge cases
    - Skip translation if already Spanish
    - Preserve medical terminology accuracy
    - Return both translated and original text
  - [x] 3.5 Ensure translator tests pass
    - Run ONLY the 4 tests written in 3.1
    - Mock Gemini API calls in tests

**Acceptance Criteria:**

- The 4 tests written in 3.1 pass
- Language detection works accurately
- Cache reduces API calls for repeated terms
- Original English preserved for verification

---

#### Task Group 4: Prompt Builder Service

**Dependencies:** Task Group 1

- [x] 4.0 Complete prompt construction service
  - [x] 4.1 Write 3 focused tests for prompt building
    - Test system prompt includes CoT structure
    - Test context injection with RAG results
    - Test anonymized case data formatting
  - [x] 4.2 Create `services/prompt-builder.service.ts`
    - Implement `buildSystemPrompt(): string`
    - Implement `buildUserPrompt(caseData, ragContext): string`
    - Combine anonymized case data with RAG citations
  - [x] 4.3 Structure Chain-of-Thought format
    - Step 1: Understanding (patient presentation analysis)
    - Step 2: Literature Review (RAG context synthesis)
    - Step 3: Synthesis (treatment recommendations)
  - [x] 4.4 Enforce output schema
    - Include JSON schema in prompt for structured output
    - Specify confidence levels and citation format
    - Require Spanish language output
  - [x] 4.5 Ensure prompt builder tests pass
    - Run ONLY the 3 tests written in 4.1
    - Verify prompt structure matches expected format

**Acceptance Criteria:**

- The 3 tests written in 4.1 pass
- Prompts follow Chain-of-Thought structure
- JSON output schema clearly specified
- Case data properly anonymized in prompts

---

### Core AI Layer

#### Task Group 5: AI Analysis Service (Orchestrator)

**Dependencies:** Task Groups 2, 3, 4

- [x] 5.0 Complete core AI analysis orchestration
  - [x] 5.1 Write 6 focused tests for analysis service
    - Test clinical case loading with therapist validation
    - Test multi-query RAG execution (3 parallel queries)
    - Test Gemini LLM call with retry logic
    - Test response parsing to `AnalysisResultDto`
    - Test full orchestration flow end-to-end (mocked)
    - Test error handling when LLM fails
  - [x] 5.2 Create `ai-analysis.service.ts`
    - Inject `KnowledgeBaseService`, `PrismaService`, `ConfigService`
    - Inject `AnonymizerService`, `TranslatorService`, `PromptBuilderService`
    - Initialize Gemini client with config values
  - [x] 5.3 Implement clinical case loading
    - Load case with patient data via Prisma
    - Validate case belongs to requesting therapist
    - Throw `NotFoundException` if case not found or unauthorized
  - [x] 5.4 Implement multi-query RAG strategy
    - Query 1: `findSimilar(diagnosis + consultationReason, 5)`
    - Query 2: `findSimilar(clinical presentation, 5)`
    - Query 3: `findSimilar(pharmacologicalHistory contraindications, 3)`
    - Execute queries in parallel with `Promise.all()`
    - Deduplicate chunks by content hash
  - [x] 5.5 Implement Gemini LLM call
    - Use `@google/generative-ai` SDK
    - Configure model from `AI_MODEL` env (default: `gemini-2.0-flash`)
    - Set temperature: 0.3, maxOutputTokens: 4096
    - Wrap with `withRetry()` utility (max 3 retries)
  - [x] 5.6 Implement response parsing
    - Parse JSON from LLM response
    - Validate against `AnalysisResultDto` schema
    - Translate English citations to Spanish
    - Rehydrate anonymized placeholders
    - Add metadata (tokens, processing time)
  - [x] 5.7 Implement error handling
    - Graceful degradation if LLM unavailable
    - Return partial results if some RAG queries fail
    - Log errors without exposing to client
    - Never expose raw LLM errors
  - [x] 5.8 Ensure analysis service tests pass
    - Run ONLY the 6 tests written in 5.1
    - All tests should use mocked external services

**Acceptance Criteria:**

- The 6 tests written in 5.1 pass
- Full analysis flow works end-to-end
- Therapist authorization enforced
- Errors handled gracefully

---

### API Layer

#### Task Group 6: Controller & REST Endpoint

**Dependencies:** Task Group 5

- [x] 6.0 Complete REST API endpoint
  - [x] 6.1 Write 4 focused tests for API endpoint
    - Test `POST /api/v1/ai/analyze` returns 200 with valid response
    - Test returns 401 without authentication
    - Test returns 404 for non-existent clinical case
    - Test returns 403 for case belonging to different therapist
  - [x] 6.2 Create `ai-analysis.controller.ts`
    - Use `@Controller('ai')` with `@ApiTags('ai')`
    - Apply `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`
    - Inject `AiAnalysisService`
  - [x] 6.3 Implement analyze endpoint
    - `@Post('analyze')` accepts `AnalyzeCaseDto`
    - Use `@CurrentTherapist()` decorator for user context
    - Return `AnalysisResultDto` with proper typing
  - [x] 6.4 Add Swagger documentation
    - `@ApiOperation({ summary: 'Analyze clinical case with AI' })`
    - `@ApiResponse({ status: 200, type: AnalysisResultDto })`
    - `@ApiResponse({ status: 404, description: 'Clinical case not found' })`
  - [x] 6.5 Add request validation
    - Validate `clinicalCaseId` format
    - Use `ValidationPipe` for DTO validation
    - Return clear error messages
  - [x] 6.6 Ensure API tests pass
    - Run ONLY the 4 tests written in 6.1
    - Verify Swagger docs generate correctly

**Acceptance Criteria:**

- The 4 tests written in 6.1 pass
- Endpoint properly secured with JWT
- Swagger documentation complete
- Error responses follow API standards

---

### Integration & Verification

#### Task Group 7: Test Review & Integration

**Dependencies:** Task Groups 1-6

- [x] 7.0 Review and verify complete implementation
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review 4 tests from Task 1.1 (DTOs/interfaces)
    - Review 5 tests from Task 2.1 (anonymizer)
    - Review 4 tests from Task 3.1 (translator)
    - Review 3 tests from Task 4.1 (prompt builder)
    - Review 6 tests from Task 5.1 (analysis service)
    - Review 4 tests from Task 6.1 (controller)
    - Total existing tests: 26 tests
  - [x] 7.2 Analyze test coverage gaps
    - Identify any critical paths not covered
    - Focus on integration between services
    - Check edge cases in orchestration flow
  - [x] 7.3 Write up to 6 additional integration tests
    - Test full flow: case → anonymize → RAG → LLM → translate → rehydrate
    - Test with "fascitis plantar" query returns relevant citations (Milestone 14.7)
    - Test response time is under 5 seconds (with mocked LLM)
    - Test no PII appears in final response
    - Add maximum 2 more if critical gaps found
  - [x] 7.4 Run all feature tests
    - Run all 26+ tests for this feature
    - Verify all pass
    - Check test execution time is reasonable
  - [x] 7.5 Manual verification checklist
    - [x] Module registers correctly in app.module.ts
    - [x] Swagger docs show endpoint at /api/docs
    - [x] Environment variables documented
    - [x] No TypeScript errors in build

**Acceptance Criteria:**

- All ~32 feature tests pass
- "Fascitis plantar" test validates Milestone 14.7 requirement
- No PII leakage detected
- Module integrates cleanly with existing codebase

---

## Execution Order

Recommended implementation sequence:

```
Phase 1: Foundation (Day 1)
├── Task Group 1: Module Scaffolding & DTOs

Phase 2: Services (Day 1-2)
├── Task Group 2: Anonymizer Service (can parallel)
├── Task Group 3: Translator Service (can parallel)
└── Task Group 4: Prompt Builder Service (can parallel)

Phase 3: Core AI (Day 2-3)
└── Task Group 5: AI Analysis Service (depends on 2,3,4)

Phase 4: API & Integration (Day 3-4)
├── Task Group 6: Controller & REST Endpoint
└── Task Group 7: Test Review & Integration
```

## Environment Variables Required

Add to `.env`:

```bash
AI_MODEL=gemini-2.0-flash
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4096
```

## Files to Create

```
apps/server/src/modules/ai-analysis/
├── ai-analysis.module.ts
├── ai-analysis.service.ts
├── ai-analysis.service.spec.ts
├── ai-analysis.controller.ts
├── ai-analysis.controller.spec.ts
├── services/
│   ├── anonymizer.service.ts
│   ├── anonymizer.service.spec.ts
│   ├── translator.service.ts
│   ├── translator.service.spec.ts
│   ├── prompt-builder.service.ts
│   └── prompt-builder.service.spec.ts
├── dto/
│   ├── analyze-case.dto.ts
│   └── analysis-result.dto.ts
├── interfaces/
│   └── analysis.interfaces.ts
└── constants/
    └── system-prompts.ts
```

## Success Criteria (Roadmap 14.7)

Final verification that the implementation meets Milestone 14.7:

- [x] Query "fascitis plantar" returns at least 3 relevant citations
- [x] Citations include document title and author
- [x] Confidence score present for primary suggestion
- [x] Visible Chain-of-Thought reasoning in Spanish
- [x] No PII in LLM request logs
- [x] Response time < 5 seconds
