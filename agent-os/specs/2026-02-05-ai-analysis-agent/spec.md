# Specification: AI Analysis Agent

## Goal

Build a NestJS backend module that provides AI-powered clinical decision support by orchestrating RAG queries over medical literature, integrating with Gemini LLM for Chain-of-Thought reasoning, anonymizing PII before external calls, and translating EN-ES medical terminology.

## User Stories

- As a physiotherapist, I want to analyze a clinical case and receive treatment suggestions with cited references so that I can make evidence-based decisions.
- As a physiotherapist, I want to see the AI's reasoning process so that I can validate its logic before accepting suggestions.
- As a clinic owner, I want patient data anonymized before any external AI processing so that I maintain HIPAA/GDPR compliance.

## Specific Requirements

**AIAnalysis Module Structure**

- Create standalone NestJS module at `apps/server/src/modules/ai-analysis/`
- Export `AiAnalysisService` for potential import by other modules (e.g., ClinicalCases)
- Import `KnowledgeBaseModule`, `PrismaModule`, and `ConfigModule`
- Follow existing module pattern from `transcription.module.ts`

**REST API Endpoint**

- `POST /api/v1/ai/analyze` accepts `{ clinicalCaseId: string }` body
- Protected with `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`
- Validate `clinicalCaseId` belongs to requesting therapist before processing
- Return structured `AnalysisResultDto` with suggestions, citations, and reasoning
- Use `@ApiTags('ai')`, `@ApiOperation`, `@ApiResponse` decorators for Swagger

**Multi-Query RAG Strategy**

- Execute 3 parallel semantic searches using `KnowledgeBaseService.findSimilar()`
- Query 1: Diagnosis context (5 chunks) based on `diagnosis` and `consultationReason`
- Query 2: Treatment protocols (5 chunks) based on clinical presentation
- Query 3: Contraindications (3 chunks) based on `pharmacologicalHistory`
- Deduplicate overlapping chunks before sending to LLM

**Gemini LLM Integration**

- Use `@google/generative-ai` package (already installed)
- Model: `gemini-2.0-flash` configurable via `AI_MODEL` env variable
- Temperature: 0.3 for clinical accuracy
- Max response tokens: 4096
- Wrap API calls with `withRetry()` utility from transcription module

**Chain-of-Thought Prompting**

- System prompt enforces 3-step reasoning: Understanding, Literature Review, Synthesis
- LLM must output structured JSON matching `AnalysisResultDto` schema
- Reasoning steps are visible to user (transparency mode)
- All output must be in Spanish regardless of input language
- Include confidence level (HIGH/MEDIUM/LOW) for each suggestion

**PII Anonymization Service**

- Create `AnonymizerService` with `anonymize()` and `rehydrate()` methods
- Replace `patient.name` with `[PATIENT]`, `therapist.name` with `[THERAPIST]`
- Convert `birthDate` to calculated age: `[AGE] anos`
- Remove entirely: `email`, `phone`, `emergencyContact`
- Return reversible mapping for response rehydration
- Never log the mapping to persistent storage

**Translation Service**

- Create `TranslatorService` for EN-ES bidirectional translation
- Detect language of RAG-retrieved passages
- Translate English citations to Spanish for display
- Preserve original English in `quoteOriginal` field for verification
- Cache term translations in `medical_terms_translations` database table
- Cache passage translations in Redis with 7-day TTL

**Response Structure**

- `primarySuggestion`: title, description, confidence, reasoning
- `alternatives`: array of up to 3 alternative suggestions with confidence
- `citations`: array with quote, quoteOriginal, documentTitle, author, pageNumber, relevance
- `reasoning`: step1_understanding, step2_literature, step3_synthesis
- `metadata`: queryTokens, responseTokens, processingTimeMs, anonymizationApplied

## Visual Design

No visual assets provided. This is a backend-only feature. Frontend UI will be designed in Week 15.

## Existing Code to Leverage

**TranscriptionService Pattern**

- Copy retry/timeout pattern from `apps/server/src/modules/transcription/transcription.service.ts`
- Reuse `withRetry()` utility from `apps/server/src/modules/transcription/utils/retry.ts`
- Follow same error handling structure with `Logger` and graceful degradation
- Mirror `ConfigService` injection pattern for AI configuration

**KnowledgeBaseService RAG**

- Import `KnowledgeBaseModule` to access `findSimilar()` method
- RAG already returns `documentTitle`, `documentAuthor`, `similarity` score
- Embeddings use `gemini-embedding-001` model with 768 dimensions
- Follow same `@google/generative-ai` SDK initialization pattern

**ClinicalCasesController Structure**

- Mirror controller decorators: `@ApiTags`, `@ApiBearerAuth`, `@UseGuards(JwtAuthGuard)`
- Use `@CurrentTherapist()` decorator to extract authenticated user
- Follow same `@ApiOperation` and `@ApiResponse` documentation style
- Reference `clinical-cases.controller.ts` for endpoint structure

**DTO Validation Pattern**

- Use `class-validator` decorators: `@IsString()`, `@IsNotEmpty()`
- Follow naming convention: `analyze-case.dto.ts`, `analysis-result.dto.ts`
- Reference `create-clinical-case.dto.ts` for `@ApiProperty` usage

**SanitizationService Reference**

- Existing `apps/server/src/common/logger/sanitization.service.ts` handles log-level redaction
- New `AnonymizerService` should complement (not replace) this for LLM-specific anonymization
- Use similar regex-based detection for PII field identification

## Out of Scope

- Vision/image analysis (deferred to Week 15)
- Frontend UI for displaying suggestions (deferred to Week 15)
- Real-time streaming of AI responses via WebSocket
- Feedback loop with like/dislike buttons (deferred to Week 15)
- Multi-turn conversational AI interactions
- User-uploaded custom knowledge base documents
- Caching of full analysis results (optional future enhancement)
- Rate limiting implementation (use existing global rate limiter if available)
- Database migrations for `medical_terms_translations` table (separate task)
- Integration tests with real Gemini API (unit tests with mocks only)
