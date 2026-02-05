# Spec Requirements: AI Analysis Agent

## Initial Description

Week 14 of the product roadmap: Build the AI Agent backend that powers clinical decision support. This module orchestrates RAG (Retrieval-Augmented Generation) queries over the medical knowledge base, integrates with Gemini LLM for reasoning, anonymizes PII before sending data externally, and provides EN-ES translation for medical terminology.

**Roadmap Tasks Covered:**

- 14.1 NestJS: AIAnalysis module
- 14.2 RAG logic: Semantic search implementation
- 14.3 LLM integration: Gemini or Groq
- 14.4 System Prompt engineering (Chain of Thought)
- 14.5 Anonymization: Strip PII before sending to LLM
- 14.6 Translation service: EN <-> ES for medical terms
- 14.7 Test: Query "fascitis plantar" -> returns relevant book passages

## Requirements Discussion

### First Round Questions

**Q1:** I assume the AIAnalysis module will be a standalone NestJS module that imports KnowledgeBaseService for RAG queries and exposes its own controller/endpoints. Is that correct, or should it be tightly coupled to a specific module (e.g., ClinicalCases)?

**Answer:** Standalone module that exports a service. Follows existing patterns like `transcription.module.ts` and `knowledge-base.module.ts`. Can be imported by `ClinicalCasesModule` later for "Analyze" button integration.

**Q2:** For LLM integration, the tech stack mentions "Gemini 3", and I see `@google/generative-ai` is already used in KnowledgeBaseService. Should we continue with Gemini for the LLM calls, or also support Groq as a fallback?

**Answer:** Gemini-only (no Groq fallback). Groq is optimized for Whisper (audio), not text generation. Gemini has vision capabilities needed for Week 15 and 1M token context window. Keeps LLM strategy unified.

**Q3:** Should the "Analyze Case" response include confidence scores, alternative suggestions, and source passages (verbatim quotes from books)?

**Answer:** Include all three:

- **Confidence scores**: Essential for medical apps - therapist needs to know when AI is uncertain
- **Alternatives**: Matches product mission ("Card-Based Decision Support" with options)
- **Source passages**: Required for "Grounded AI" promise - citations must trace to actual book content

**Q4:** The existing `findSimilar()` method returns 5 results by default. For clinical analysis, should we retrieve more chunks, or use multiple queries?

**Answer:** Multi-query approach with 5 chunks per query:

- Query 1: Diagnosis context (5 chunks)
- Query 2: Treatment protocols (5 chunks)
- Query 3: Contraindications (3 chunks)
- Total: ~13 chunks providing ~7,500 words of context

**Q5:** Should Chain-of-Thought reasoning be visible to the user (transparency), or only show final suggestions?

**Answer:** Visible reasoning (transparency mode). Product mission emphasizes "thinks WITH them, not FOR them". Therapist needs to validate AI's logic. Visible reasoning builds trust for medical adoption.

**Q6:** For PII stripping before LLM calls, should we use placeholders, remove entirely, or make it reversible?

**Answer:** Placeholder replacement with reversible mapping:

- `patient.name` -> `[PATIENT]`
- `patient.birthDate` -> `[AGE] anos` (age is clinically relevant)
- `patient.email`, `patient.phone`, `emergencyContact` -> Remove entirely (not clinically relevant)
- Reversible mapping allows personalized responses

**Q7:** The app is primarily in Spanish, but medical literature may be in English. What's the translation strategy?

**Answer:** Bidirectional, Spanish-first:

- Clinical notes stay in Spanish
- RAG queries in Spanish
- If retrieved passages are in English, translate to Spanish for display
- LLM system prompt enforces Spanish output
- Keep original English quotes available for verification

**Q8:** Should translations be cached to avoid re-translating the same medical terms?

**Answer:** Yes, two-tier cache:

- Term-level: Database table `medical_terms_translations` (permanent, curated)
- Passage-level: Redis cache with 7-day TTL (LRU eviction)
- Reduces API calls by ~30-40% for common medical terminology

**Q9:** What is explicitly OUT of scope for this spec?

**Answer:** Out of scope:

- Vision/image analysis (Week 15)
- Frontend UI for suggestions (Week 15)
- Real-time streaming responses
- Feedback loop (like/dislike) (Week 15)
- Multi-turn conversation with AI
- Custom knowledge base upload (user books)
- WebSocket for live analysis

### Existing Code to Reference

**Similar Features Identified:**

- **External API integration pattern**: `apps/server/src/modules/transcription/transcription.service.ts`
  - Retry logic, timeout handling, error structure
- **Retry utility**: `apps/server/src/modules/transcription/utils/retry.ts`
  - Reusable `withRetry()` function
- **LLM/Embedding calls**: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
  - `@google/generative-ai` setup, `generateEmbedding()` method
- **RAG query**: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
  - `findSimilar()` method for semantic search
- **Module structure**: `apps/server/src/modules/transcription/transcription.module.ts`
  - Imports pattern, provider exports
- **DTO pattern**: `apps/server/src/modules/transcription/dto/transcription-result.dto.ts`
  - Response structure conventions
- **Prompts organization**: `apps/server/src/modules/transcription/constants/prompts.ts`
  - System prompts stored as constants
- **Config injection**: `apps/server/src/modules/transcription/transcription.service.ts` constructor
  - `ConfigService` injection pattern

### Follow-up Questions

No follow-up questions needed. All requirements were clarified in the first round.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - This is a backend-only feature. Frontend UI will be designed in Week 15.

## Requirements Summary

### Functional Requirements

**Core Analysis Flow:**

1. Accept clinical case ID via REST endpoint
2. Load case data (diagnosis, consultation reason, pharmacological history)
3. Anonymize PII using placeholder replacement
4. Execute multi-query RAG search (3 queries, 13 total chunks)
5. Build Chain-of-Thought prompt with retrieved context
6. Call Gemini LLM for reasoning and suggestions
7. Translate any English citations to Spanish
8. Rehydrate placeholders in response
9. Return structured result with confidence, alternatives, and citations

**Anonymization:**

- Replace patient name with `[PATIENT]`
- Replace birthDate with calculated `[AGE] anos`
- Replace therapist name with `[THERAPIST]`
- Remove email, phone, emergencyContact entirely
- Maintain reversible mapping for response rehydration

**Translation:**

- Detect language of retrieved passages
- Translate EN->ES for Spanish display
- Cache translations at term and passage level
- Preserve original English for verification

**Response Structure:**

```typescript
interface AnalysisResult {
  primarySuggestion: {
    title: string;
    description: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string;
  };
  alternatives: Array<{
    title: string;
    description: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  citations: Array<{
    quote: string;
    quoteOriginal?: string; // Original English if translated
    documentTitle: string;
    author: string;
    pageNumber?: number;
    relevance: number;
  }>;
  reasoning: {
    step1_understanding: string;
    step2_literature: string;
    step3_synthesis: string;
  };
  metadata: {
    queryTokens: number;
    responseTokens: number;
    processingTimeMs: number;
    anonymizationApplied: boolean;
    translationsApplied: number;
  };
}
```

### Module Structure

```
modules/ai-analysis/
├── ai-analysis.module.ts
├── ai-analysis.service.ts          # Core orchestration
├── ai-analysis.controller.ts       # REST endpoints
├── services/
│   ├── anonymizer.service.ts       # PII stripping + rehydration
│   ├── translator.service.ts       # EN<->ES translation + cache
│   └── prompt-builder.service.ts   # CoT prompt construction
├── dto/
│   ├── analyze-case.dto.ts         # Request DTO
│   └── analysis-result.dto.ts      # Response DTO
├── interfaces/
│   └── analysis.interfaces.ts      # TypeScript interfaces
└── constants/
    └── system-prompts.ts           # Clinical reasoning prompts
```

### API Endpoints

```
POST /api/v1/ai/analyze
Body: { clinicalCaseId: string }
Response: AnalysisResult

GET /api/v1/ai/analyze/:clinicalCaseId
Response: AnalysisResult (if previously analyzed, returns cached)
```

### Reusability Opportunities

- Reuse `withRetry()` from transcription module
- Reuse `@google/generative-ai` setup pattern from knowledge-base
- Reuse `findSimilar()` for RAG queries
- Follow DTO patterns from transcription module
- Follow prompts organization from transcription constants

### Scope Boundaries

**In Scope:**

- NestJS AIAnalysis module structure
- RAG semantic search with multi-query strategy
- Gemini LLM integration for clinical reasoning
- Chain-of-Thought prompting with visible reasoning
- PII anonymization with reversible placeholders
- EN<->ES translation service with caching
- REST endpoint for case analysis
- Unit tests validating "fascitis plantar" query

**Out of Scope:**

- Vision/image analysis (deferred to Week 15)
- Frontend UI for displaying suggestions (deferred to Week 15)
- Real-time streaming of AI responses
- Feedback loop (like/dislike buttons) (deferred to Week 15)
- Multi-turn conversational AI
- User-uploaded knowledge base documents
- WebSocket connections for live analysis

### Technical Considerations

**LLM Configuration:**

- Provider: Google Gemini
- Model: `gemini-3-flash` (or configurable via env)
- Temperature: 0.3 (low for clinical accuracy)
- Max tokens: 4096 for response

**Caching Strategy:**

- Term translations: PostgreSQL table `medical_terms_translations`
- Passage translations: Redis with 7-day TTL
- Analysis results: Optional caching with clinical case version tracking

**Error Handling:**

- Graceful degradation if LLM unavailable
- Return partial results if some RAG queries fail
- Log all LLM interactions for debugging
- Never expose raw LLM errors to frontend

**Security:**

- Validate clinicalCaseId belongs to requesting therapist
- Audit log all AI analysis requests
- Never log anonymized data mappings to persistent storage
- Rate limit: 10 analyses per minute per user

### Dependencies

**Existing modules to import:**

- `KnowledgeBaseModule` - for RAG queries
- `PrismaModule` - for clinical case data
- `ConfigModule` - for LLM configuration

**New dependencies (if needed):**

- None - all required packages already installed (`@google/generative-ai`, `groq-sdk`)

### Success Criteria (from Roadmap 14.7)

Test: Query "fascitis plantar" -> returns relevant book passages with:

- [ ] At least 3 relevant citations from ingested medical books
- [ ] Confidence score for primary suggestion
- [ ] Visible Chain-of-Thought reasoning in Spanish
- [ ] No PII in LLM request logs
- [ ] Response time < 5 seconds
- [ ] All citations include document title and author
