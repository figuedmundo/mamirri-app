# Spec Requirements: AI Orchestration (Voice + Vision + RAG + LLM)

## Initial Description

**From Roadmap Task 15.2:** Orchestration: Combine Voice + Vision + RAG + LLM

**Context:** Part of Week 15 "Vision & Full Analysis" phase in AI Infrastructure (Part 2). This is a critical milestone leading to "Milestone 7: The AI provides a cited treatment suggestion."

**Goal:** Create an orchestration layer that combines multiple AI services to provide comprehensive clinical analysis:

1. **Voice Input**: Patient descriptions, therapist notes, dictated observations (transcribed via Whisper)
2. **Vision Input**: Posturogram images, footprint scans, patient photos (pre-analyzed findings)
3. **RAG (Retrieval-Augmented Generation)**: Relevant passages from medical books
4. **LLM**: Synthesized treatment suggestions with citations

**Success Criteria:**

- AI suggestions are clinically relevant (70%+ accuracy target)
- Citations trace to actual book content
- Query response time < 3 seconds (target: <2.5 seconds)
- Therapist trusts AI enough to use regularly

---

## Requirements Discussion

### First Round Questions

**Q1: I assume the orchestration should be triggered on-demand when a therapist clicks "Analyze Case", rather than automatically after every transcription. Is that correct?**

**Answer:** Yes. On-demand "Analyze Case" button is preferred. This respects therapist agency, is computationally efficient, and matches the existing `AiAnalysisService.analyzeCase` pattern. The button will be placed in the `CaseDetailLayout` header and disabled until minimum data exists (at least one evaluation).

---

**Q2: I'm thinking the orchestration should aggregate ALL relevant data for a case: voice transcripts from evaluations, vision analysis from posturograms/footprints, and structured clinical data. Should we also include treatment session notes, or limit scope to just evaluation data?**

**Answer:** Include Evaluations + Recent Sessions (Last 3). Evaluations have the most structured clinical data (Barthel, pain scales, posturograms). Recent sessions capture evolution trends (pain reduction trajectory, treatment response). Including all sessions would add too much noise; last 3 sessions gives trend context without overwhelming the LLM. Voice notes from both evaluations and sessions provide narrative context.

**Data Sources:**

```typescript
dataSources: {
  evaluation: ClinicalCase.evaluations[], // All evaluations (Initial, Progress, Final)
  recentSessions: TreatmentSession.last(3), // Last 3 sessions only
  visionAnalyses: VisionResult[], // Pre-analyzed findings from posturograms/footprints
  patientProfile: Patient.demographics // Age, gender (anonymized)
}
```

---

**Q3: For the Vision integration — should the orchestration use raw images or the pre-analyzed Vision findings (which are already stored as structured JSON)? Using pre-analyzed findings would be faster; raw images would be more comprehensive but slower.**

**Answer:** Use Pre-Analyzed Vision Findings (Stored JSON). This provides instant access (avoiding 2-5 second delay), avoids duplicate Gemini Vision API calls, and leverages the existing `VisionService` structured output. Raw image analysis can be added later as an "enhanced mode" if needed.

**Structure to include:**

```typescript
visionContext: {
  posturogramFindings: VisionResult[], // From previous VisionService calls
  footprintAnalysis: VisionResult[],
  photosAnalysis: VisionResult[]
}
```

---

**Q4: I'm assuming the RAG context should query for multiple angles: diagnosis confirmation, treatment suggestions, AND contraindications/precautions. Is that the right approach, or should we focus on just one aspect?**

**Answer:** Yes, use the 4-Query Strategy (already implemented in `KnowledgeBaseService`). This gives comprehensive clinical context:

1. Diagnosis confirmation: "What conditions match these symptoms?"
2. Treatment suggestions: "What therapies are recommended?"
3. Contraindications: "What should be avoided?"
4. Prognosis indicators: "What outcomes are expected?"

**IMPORTANT: Parallel RAG with Sequential LLM Reasoning**

There was a question about whether running diagnosis, treatment, and contraindication queries in parallel would affect answer quality, given that diagnosis logically informs treatment.

**The Answer: Parallel RAG actually improves quality because we're parallelizing retrieval, not clinical reasoning.**

#### How RAG Actually Works

```
┌─────────────────────────────────────────────────────────────┐
│  PARALLEL PHASE (Retrieval - Fast, Independent)             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Diagnosis    │ │ Treatment    │ │ Contraindica-│        │
│  │ Query:       │ │ Query:       │ │ tions Query: │        │
│  │ "What        │ │ "What        │ │ "What should │        │
│  │ conditions   │ │ therapies    │ │ be avoided   │        │
│  │ match        │ │ help         │ │ for this     │        │
│  │ symptoms?"   │ │ condition?"  │ │ pattern?"    │        │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘        │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  [Book passages]  [Book passages]  [Book passages]         │
│  - Disc herniation- Core exercises - Avoid flexion         │
│  - Muscle strain  - Manual therapy - Caution: osteo-       │
│  - Facet syndrome - TENS          - porosis                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  SYNTHESIS PHASE (LLM - Sequential by nature)                │
│                                                              │
│  LLM sees ALL retrieved passages simultaneously:             │
│  "Given these possible diagnoses [A, B, C],                  │
│   these treatment options [X, Y, Z],                         │
│   and these precautions [P, Q]...                            │
│   Here's my integrated analysis..."                          │
│                                                              │
│  The LLM performs sequential clinical reasoning:             │
│  1. Considers diagnosis A, B, C                              │
│  2. Matches treatments X, Y, Z to each diagnosis             │
│  3. Applies contraindications P, Q to filter                 │
│  4. Synthesizes final recommendation                         │
└─────────────────────────────────────────────────────────────┘
```

#### Why Parallel RAG is Better

**1. Evidence is Independent in Medical Knowledge**
Medical textbooks are structured with separate facts:

- Diagnosis criteria: "Lumbar disc herniation presents with leg pain > back pain"
- Treatment evidence: "Core stabilization exercises reduce recurrence by 40%"
- Contraindications: "Avoid extension if spondylolisthesis present"

These are independent pieces of knowledge. The vector database retrieves them. The LLM connects them.

**2. Mimics Clinical Thinking**
When a physiotherapist sees a patient, they don't:

1. First figure out the exact diagnosis
2. Then ask "what should I do?"
3. Then ask "what should I avoid?"

They think: _"Could be disc, muscle, or facet... what works for each? What should I avoid for each?"_

Parallel RAG mimics this **hypothesis-generation approach** that clinicians naturally use.

**3. The LLM Makes Connections**
The critical insight: Sequential clinical reasoning happens **inside the LLM**, not in the RAG retrieval.

Example of LLM synthesis:

> "The posturogram shows hyperlordosis (diagnosis evidence). The book says hyperlordosis responds to core strengthening (treatment evidence). But wait, the book also says osteoporosis contraindicates aggressive core work (contraindication evidence). Patient is 60+ female, so I'll suggest gentle core activation instead."

**4. Performance Comparison**

**Sequential RAG (Slower):**

```
Step 1: Query diagnosis → [Wait 500ms]
Step 2: Query treatment → [Wait 500ms]
Step 3: Query contraindications → [Wait 500ms]
Total: 1500ms
```

**Parallel RAG (Faster, Same Quality):**

```
All 3 queries run simultaneously → [Wait 500ms total]
Total: 500ms (3x faster)
```

**Same passages retrieved, same LLM synthesis, 3x faster.**

#### Concrete Example

**Patient**: 55-year-old, back pain, posturogram shows hyperlordosis

**Parallel retrieves:**

- Diagnosis passages: Hyperlordosis, possible spondylolisthesis, muscle strain
- Treatment passages: Core exercises help, manual therapy effective
- Contraindication passages: Avoid extension with spondylolisthesis, caution with osteoporosis

**LLM synthesizes:**

> "Evidence suggests hyperlordosis with possible spondylolisthesis. Core exercises are generally recommended, but given patient's age (55) and potential spondylolisthesis, I recommend gentle core activation and manual therapy instead of aggressive extension exercises. Monitor for osteoporosis signs."

**This is clinical-grade reasoning, enabled by parallel evidence gathering.**

---

**Q5: For the response format, I'm thinking structured JSON with: suggestedDiagnosis, recommendedTreatments, relevantBookCitations, confidenceScore, and reasoning. Should we also include a contraindications section?**

**Answer:** Yes, use Card-Based Decision Support Format that matches the Product Mission's "Card-Based Decision Support" differentiator. This format is clinically actionable and easy for therapists to scan quickly.

**Proposed Response Structure:**

```typescript
{
  "analysis": {
    "confidenceScore": 0.87, // 0-1 based on evidence quality
    "clinicalSummary": "Brief synthesis of patient presentation"
  },
  "findings": {
    "patternRecognized": "e.g., 'Lumbar hyperlordosis with pelvic anteversion'",
    "supportingEvidence": ["Finding 1 from posturogram", "Finding 2 from evaluation"]
  },
  "suggestions": [
    {
      "type": "diagnostic_hypothesis",
      "content": "Possible discogenic LBP with postural component",
      "confidence": "high",
      "rationale": "Pain increases with flexion, posturogram shows..."
    },
    {
      "type": "treatment_protocol",
      "content": "McKenzie extension protocol + core stabilization",
      "confidence": "medium",
      "rationale": "Evidence supports extension exercises for discogenic pain"
    },
    {
      "type": "contraindication",
      "content": "Avoid prolonged flexion activities",
      "confidence": "high",
      "rationale": "May exacerbate discogenic symptoms"
    }
  ],
  "citations": [
    {
      "book": "Manual Therapy for the Spine",
      "page": 147,
      "relevance": "Treatment protocol for discogenic pain",
      "passage": "Extension-based exercises show 70% success rate..."
    }
  ],
  "disclaimers": [
    "AI-generated suggestion. Clinical judgment required.",
    "Based on available data as of [timestamp]"
  ]
}
```

---

**Q6: Anonymization is currently handled before sending to LLM. Should the orchestration preserve this approach, stripping PII (patient names, specific dates) before the AI call?**

**Answer:** Yes - Strict Anonymization Before LLM. This is essential for:

- Privacy compliance: Patient data should never reach third-party LLMs
- Existing pattern: `AiAnalysisService` already implements this via `AnonymizationService`
- Trust: Essential for "Privacy-First & Grounded AI" product differentiator

**What to strip:**

- Patient name → "Patient"
- Specific dates → "Initial evaluation", "3 weeks later"
- Location identifiers → remove
- Keep: Age range (e.g., "50s"), gender, clinical findings

---

**Q7: Performance target is <3 seconds — given multiple service calls (RAG + Vision aggregation + LLM), should we implement parallel execution where possible, or is sequential acceptable?**

**Answer:** Implement Parallel Execution with Smart Sequencing. This achieves <2.5 second target.

**Execution Flow:**

```typescript
// Parallel phase (all independent operations)
const [ragResults, visionContext, voiceTranscripts] = await Promise.all([
  knowledgeBase.multiQuerySearch(queries), // ~500ms - parallel queries
  getVisionFindings(caseId), // ~50ms - DB read
  getVoiceTranscripts(caseId), // ~50ms - DB read
]);

// Sequential phase (depends on RAG results)
const prompt = buildPrompt(ragResults, visionContext, voiceTranscripts);
const llmResponse = await llmService.generate(prompt); // ~1500ms

// Total target: ~2050ms (<2.5 seconds)
```

**Rationale:**

- RAG queries (diagnosis, treatment, contraindications) are independent → parallel
- Vision and voice data are pre-analyzed/stored → fast DB reads → parallel
- LLM call must wait for RAG → sequential, but that's the only blocker

---

**Q8: What should happen if one service fails (e.g., Vision analysis unavailable)? Should the orchestration gracefully degrade and return partial results with a warning, or fail entirely?**

**Answer:** Graceful Degradation with Warning Indicators. Therapists need SOMETHING, not complete failure. Partial results with transparency builds more trust than mysterious failures.

**Degradation Levels:**

1. **Full success**: All services working → complete analysis
2. **Vision unavailable**: Analysis based on text + RAG only → warning: "Image analysis unavailable"
3. **RAG partial**: Only some queries succeeded → use available context → warning: "Limited knowledge base results"
4. **LLM timeout**: Return cached suggestion or "Analysis delayed" with retry option

**UI Pattern:**

- 🟢 Green dot: All sources included
- 🟡 Yellow dot: Partial (warning tooltip explains what's missing)
- 🔴 Red dot: Failed (retry button)

---

### Existing Code to Reference

Based on codebase exploration, these existing features should be referenced:

**Similar Features Identified:**

- **Feature:** AiAnalysisService - Path: `apps/server/src/modules/ai-analysis/ai-analysis.service.ts`
  - Components to potentially reuse: analyzeCase method, prompt building patterns
  - Backend logic to reference: Anonymization flow, multi-query RAG orchestration

- **Feature:** KnowledgeBaseService - Path: `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
  - Components to potentially reuse: Multi-query search implementation, embedding similarity search
  - Backend logic to reference: PDF ingestion, chunking strategy, pgvector queries

- **Feature:** VisionService - Path: `apps/server/src/modules/ai-analysis/services/vision.service.ts`
  - Components to potentially reuse: VisionResult structure, image analysis patterns
  - Backend logic to reference: Gemini Vision integration, structured output format

- **Feature:** TranscriptionProcessor - Path: `apps/server/src/modules/transcription/transcription.processor.ts`
  - Components to potentially reuse: Voice note processing patterns
  - Backend logic to reference: Cron-based transcription, status management

- **Feature:** CaseDetailLayout - Path: `apps/client/src/pacientes/components/CaseDetailLayout.tsx`
  - Components to potentially reuse: Header layout, action button patterns
  - Frontend logic to reference: Where to add "Analyze with AI" button

---

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets to analyze.

---

## Requirements Summary

### Functional Requirements

#### Core Functionality

- **FR1**: On-demand "Analyze Case" button in CaseDetailLayout header
- **FR2**: Button disabled state when insufficient data (<1 evaluation)
- **FR3**: Aggregate data from: all evaluations, last 3 sessions, vision findings, voice transcripts
- **FR4**: Execute parallel RAG queries: diagnosis, treatment, contraindications, prognosis
- **FR5**: Anonymize all PII before LLM call (names, dates, locations)
- **FR6**: Synthesize findings using Gemini 3 Flash
- **FR7**: Return structured JSON response with suggestions, citations, confidence
- **FR8**: Display results in card-based UI format
- **FR9**: Implement graceful degradation for partial service failures

#### Data Aggregation

- **FR10**: Fetch all evaluations for clinical case (Initial, Progress, Final)
- **FR11**: Fetch last 3 treatment sessions for trend analysis
- **FR12**: Fetch pre-analyzed vision findings from posturograms/footprints
- **FR13**: Fetch transcribed voice notes from evaluations and sessions
- **FR14**: Anonymize patient demographics (keep age range, gender)

#### RAG Integration

- **FR15**: Execute 4 parallel similarity searches in pgvector
- **FR16**: Retrieve top-5 relevant passages per query angle
- **FR17**: Include book title, page number, and passage text in citations
- **FR18**: Implement query timeout (5s per query) with fallback

#### LLM Integration

- **FR19**: Build comprehensive prompt with all context sources
- **FR20**: Include system prompt with clinical reasoning guidelines
- **FR21**: Request structured JSON output with specified schema
- **FR22**: Implement response timeout (10s) with retry logic
- **FR23**: Post-process LLM output for display formatting

#### Error Handling

- **FR24**: Detect service failures and mark in response metadata
- **FR25**: Return partial results when some services unavailable
- **FR26**: Include warning messages for degraded modes
- **FR27**: Provide retry mechanism for failed analyses
- **FR28**: Log all errors for monitoring and debugging

### Reusability Opportunities

#### Backend Components to Reuse

- `AiAnalysisService.analyzeCase()` - orchestration pattern
- `KnowledgeBaseService.multiQuerySearch()` - RAG implementation
- `AnonymizationService.anonymize()` - PII stripping
- `VisionService` structured output format
- `TranslationService` - EN/ES toggle for medical terms
- Prisma queries for ClinicalCase, Evaluation, TreatmentSession

#### Frontend Components to Reuse

- `CaseDetailLayout` header for "Analyze" button placement
- Card components from Shadcn/UI for suggestions display
- Badge components for confidence scores
- Tooltip components for warning indicators
- Existing loading states and skeletons

#### Patterns to Follow

- Existing `analyzeCase` API endpoint pattern (`POST /ai/analysis`)
- Error handling patterns from transcription module
- Async job status tracking pattern
- Toast notifications for success/error states

### Scope Boundaries

**In Scope:**

- Backend orchestration service combining Voice + Vision + RAG + LLM
- API endpoint: `POST /ai/cases/:caseId/analyze` (or extend existing)
- Frontend "Analyze with AI" button in CaseDetailLayout
- Results display component for card-based suggestions
- Integration with existing AiAnalysisService
- Graceful degradation for partial failures
- Response time optimization (<2.5s target)
- Comprehensive logging for monitoring

**Out of Scope:**

- Real-time/streaming suggestions (on-demand only)
- Raw image analysis during orchestration (use pre-analyzed findings)
- Modifying existing VisionService or TranscriptionService
- New database tables (use existing embeddings, cases, sessions)
- Patient-facing AI features (therapist-only)
- Multi-language support beyond EN/ES toggle
- Offline AI analysis (requires internet)

**Future Enhancements (Post-Task):**

- Caching of analysis results for repeated queries
- Feedback loop (like/dislike buttons) for continuous improvement
- Version history of AI suggestions
- Comparison mode (initial vs final analysis)
- Export analysis as PDF report

### Technical Considerations

#### Integration Points

1. **AiAnalysisService**: Extend existing orchestration or create new `OrchestrationService`
2. **KnowledgeBaseService**: Use existing multi-query RAG (no changes needed)
3. **VisionService**: Read pre-analyzed findings from DB (no direct API calls)
4. **TranscriptionModule**: Query completed transcriptions from evaluations/sessions
5. **CaseDetailLayout**: Add button and wire to new API endpoint

#### Performance Targets

- Total response time: <2.5 seconds (target), <3 seconds (max)
- RAG queries: <500ms (parallel)
- Vision/voice aggregation: <100ms (DB reads)
- LLM generation: <1500ms
- Frontend render: <200ms

#### Data Flow Architecture

```
User clicks "Analyze" →
  CaseDetailLayout calls API →
    OrchestrationService gathers:
      - Evaluations (DB query)
      - Recent sessions (DB query)
      - Vision findings (DB query)   ┐ All parallel
      - Voice transcripts (DB query)┘
    → Anonymize data
    → Execute parallel RAG queries
    → Build LLM prompt with all context
    → Call Gemini 3 Flash
    → Parse structured response
    → Return JSON to frontend
  → Display card-based suggestions
```

#### Error Scenarios & Handling

| Scenario            | Behavior               | User Message                       |
| ------------------- | ---------------------- | ---------------------------------- |
| RAG timeout         | Degrade to LLM-only    | "Limited knowledge base results"   |
| Vision data missing | Exclude from context   | "Image analysis unavailable"       |
| LLM timeout         | Return retry option    | "Analysis delayed. Try again?"     |
| All services fail   | Show error state       | "Unable to analyze. Please retry." |
| Partial RAG results | Use available passages | "Partial evidence retrieved"       |

#### Security & Privacy

- All PII anonymized before external LLM calls
- Patient data never leaves the system unencrypted
- API responses contain only anonymized patient references
- Logging excludes sensitive clinical details
- Audit trail of AI analysis requests (who, when, case ID)

#### Monitoring & Observability

- Track response times for each phase (RAG, LLM, total)
- Monitor success rates by service
- Log degradation events
- Alert on repeated failures
- Measure user engagement (analysis requests per session)

---

## Summary of Decisions

| Question            | Decision                      | Rationale                        |
| ------------------- | ----------------------------- | -------------------------------- |
| **Trigger**         | On-demand button              | Respects therapist agency        |
| **Data Scope**      | Evaluations + last 3 sessions | Trend without noise              |
| **Vision**          | Pre-analyzed findings         | Speed + cost efficiency          |
| **RAG Strategy**    | 4-query parallel              | Comprehensive context, 3x faster |
| **Response Format** | Card-based JSON               | Clinically actionable            |
| **Anonymization**   | Strict, preserve existing     | Privacy + trust                  |
| **Performance**     | Parallel execution            | <2.5s target                     |
| **Error Handling**  | Graceful degradation          | Workflow continuity              |

---

## Therapist Communication Notes

This section will help explain to therapists how the AI works:

### How the AI Analysis Works

**1. Data Gathering**
The AI looks at:

- Your evaluation notes (Initial, Progress, Final)
- Recent treatment sessions (last 3)
- Posturogram and footprint analysis results
- Voice notes you've recorded

**2. Evidence Retrieval (Parallel Search)**
The AI simultaneously searches our medical library for:

- What conditions match this presentation
- What treatments are evidence-based
- What precautions or contraindications apply
- What outcomes are typically expected

_Why parallel? This mimics how experienced clinicians think—considering multiple possibilities at once, not one at a time. It makes the AI 3x faster without losing quality._

**3. Clinical Synthesis**
The AI combines all evidence to provide:

- Pattern recognition (what's similar to cases in the books)
- Treatment suggestions with rationale
- Contraindications and precautions
- Citations to specific book passages

**4. Your Judgment**
The AI provides **suggestions**, not prescriptions. Every recommendation includes:

- Confidence level (how certain the AI is)
- Rationale (why this suggestion makes sense)
- Source citations (which books support this)
- A clear disclaimer that your clinical judgment is required

### Privacy Guarantee

- Your patient's name and details are never sent to the AI
- Only clinical patterns and anonymized data are analyzed
- All processing follows medical privacy standards
- You remain in complete control of all decisions

### When the AI Can't Help

Sometimes the AI will say:

- "Limited knowledge base results" (couldn't find relevant books)
- "Image analysis unavailable" (vision service temporarily down)
- "Analysis delayed" (high traffic, try again)

In these cases, you still get partial results, not a complete failure.
