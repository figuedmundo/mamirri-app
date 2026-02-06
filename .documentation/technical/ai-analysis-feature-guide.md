# AI Analysis Feature Guide

## Overview

The AI Analysis feature provides physiotherapists with evidence-based clinical suggestions by combining multiple data sources: voice transcripts from evaluations, vision analysis of posturograms and footprints, medical literature (RAG), and structured clinical data. This multi-modal approach gives the AI a complete picture of the patient, resulting in more accurate and contextually relevant recommendations.

**Last Modified:** 2026-02-06

---

## What Makes This Different

Traditional AI analysis looks only at structured form data. Mamirri's orchestration layer goes further by incorporating:

- **Voice transcripts**: Natural language descriptions recorded during sessions
- **Vision findings**: AI-analyzed posturograms and footprint scans
- **Medical literature**: Evidence from ingested textbooks (RAG)
- **Clinical history**: Evaluations, pain scales, and treatment sessions

This gives therapists suggestions grounded in both the patient's complete clinical picture and published medical evidence.

---

## How It Works

### The Analysis Pipeline

When you click **Analyze with AI**, the system runs this pipeline:

```
1. Gather Data (Parallel)
   ├── Fetch all evaluations (Initial, Progress, Final)
   ├── Fetch last 3 treatment sessions
   ├── Extract vision findings from posturograms/footprints
   └── Collect voice transcripts from evaluations and sessions

2. Anonymize (Privacy Protection)
   ├── Replace names with "Patient"
   ├── Convert dates to relative time ("3 weeks ago")
   └── Remove identifying information

3. Retrieve Evidence (Parallel RAG)
   ├── Search: Diagnosis confirmation
   ├── Search: Treatment options
   ├── Search: Contraindications
   └── Search: Prognosis indicators

4. Generate Analysis (LLM)
   ├── Combine all context sources
   ├── Apply clinical reasoning (Chain-of-Thought)
   └── Structure response with citations

5. Deliver Results
   ├── Pattern recognition summary
   ├── Suggestion cards (diagnosis/treatment/contraindication)
   ├── Citations from medical books
   └── Service status indicators
```

### Parallel Processing for Speed

The system performs data gathering and RAG searches in parallel to keep response times under 2.5 seconds:

- Data fetching: ~100ms (parallel DB queries)
- RAG retrieval: ~500ms (4 parallel similarity searches)
- LLM synthesis: ~1500ms (with retry logic)
- **Total: ~2.1 seconds average**

---

## Using the Feature

### From the Frontend

1. Navigate to a patient's clinical case
2. Ensure at least 1 evaluation exists (button is disabled otherwise)
3. Click **Analizar con IA** in the header
4. Wait for analysis (shows loading spinner)
5. Review results in the slide-out panel:
   - **Pattern Recognized**: Clinical patterns identified
   - **Suggestions**: Cards with diagnosis, treatment, and contraindications
   - **Citations**: Expandable quotes from medical literature
   - **Status Indicator**: Green/yellow/red showing which services contributed

### Service Status Indicators

The colored dot tells you what data was used:

| Color     | Meaning                  | When You'll See It                                            |
| --------- | ------------------------ | ------------------------------------------------------------- |
| 🟢 Green  | All services operational | Everything worked perfectly                                   |
| 🟡 Yellow | Partial results          | Some services unavailable (e.g., no vision data, RAG timeout) |
| 🔴 Red    | Analysis failed          | LLM service unavailable or major error                        |

**Example yellow states:**

- "Limited knowledge base results" - RAG timed out, but LLM still generated suggestions
- "No image analysis available" - Case has no posturograms or footprints

### API Endpoint

**POST** `/api/v1/ai/cases/:caseId/analyze`

Analyzes a clinical case using all available data sources.

**Authentication:** Bearer token required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| caseId | string | UUID of the clinical case |

**Response:**

```json
{
  "primarySuggestion": {
    "title": "Fascitis plantar bilateral",
    "description": "El patrón de dolor matutino y la distribución en la planta del pie sugieren fascitis plantar bilateral...",
    "confidence": "HIGH",
    "reasoning": "Basado en la escala de dolor EVA 7/10 y el hallazgo de hiperpronación en el posturograma..."
  },
  "alternatives": [...],
  "citations": [
    {
      "quote": "El estiramiento específico de la fascia plantar es el pilar del tratamiento conservador...",
      "documentTitle": "Manual de Fisioterapia",
      "author": "Kapandji",
      "pageNumber": 234,
      "relevance": 0.95
    }
  ],
  "reasoning": {
    "step1_understanding": "Paciente presenta dolor en planta...",
    "step2_literature": "La literatura indica que el 80% responden...",
    "step3_synthesis": "Se recomienda iniciar con estiramientos..."
  },
  "metadata": {
    "processingTimeMs": 2150,
    "anonymizationApplied": true,
    "serviceStatus": {
      "rag": true,
      "vision": true,
      "voice": false,
      "llm": true
    },
    "warnings": []
  }
}
```

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success - Analysis complete |
| 400 | Bad Request - No evaluations for this case |
| 403 | Forbidden - You don't own this case |
| 404 | Not Found - Case doesn't exist |
| 503 | Service Unavailable - LLM service down |

---

## Technical Architecture

### Services

**DataAggregationService**
: Fetches and combines data from multiple sources in parallel. Returns a `CaseDataAggregate` containing evaluations, sessions, vision findings, and voice transcripts.

**AiAnalysisService**
: Orchestrates the analysis pipeline. Coordinates data aggregation, anonymization, RAG retrieval, and LLM generation.

**AnonymizerService**
: Strips PII before sending to external LLM. Uses reversible masking so patient data never leaves your infrastructure.

**PromptBuilderService**
: Constructs specialized prompts for different query types and formats multi-modal context for the LLM.

**KnowledgeBaseService**
: Performs semantic search over ingested medical literature using pgvector.

### Data Flow

```
User clicks "Analyze"
  ↓
DataAggregationService.aggregateCaseData()
  ├── Prisma: Fetch evaluations
  ├── Prisma: Fetch sessions (last 3)
  ├── Extract: vision findings JSON
  └── Extract: voice notes arrays
  ↓
AnonymizerService.anonymize()
  ↓
KnowledgeBaseService.multiQueryRag() [Parallel]
  ├── Diagnosis query → top 5 chunks
  ├── Treatment query → top 5 chunks
  ├── Contraindications query → top 3 chunks
  └── Prognosis query → top 5 chunks
  ↓
PromptBuilderService.buildUserPrompt()
  ├── Case context (anonymized)
  ├── Vision findings summary
  ├── Voice transcript excerpts
  └── RAG passages
  ↓
Gemini 3 Flash.generateContent()
  ↓
Parse response → AnalysisResultDto
  ↓
Return to client
```

### Components

**Backend (NestJS):**

- `data-aggregation.service.ts` - Multi-modal data fetching
- `ai-analysis.service.ts` - Pipeline orchestration
- `ai-analysis.controller.ts` - HTTP endpoint
- `prompt-builder.service.ts` - Prompt construction

**Frontend (React):**

- `AnalyzeButton.tsx` - Header button with loading states
- `use-case-analysis.ts` - Hook for API integration
- `AnalysisResultsPanel.tsx` - Slide-out results panel
- `SuggestionCard.tsx` - Individual suggestion display
- `CitationsSection.tsx` - Expandable citations
- `ServiceStatusIndicator.tsx` - Status dot with tooltip

---

## Development & Testing

### Environment Variables

Required in `.env`:

```bash
GOOGLE_API_KEY=your_key_here
AI_MODEL=gemini-3-flash
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4096
```

### Running Tests

```bash
# Run all AI analysis tests
pnpm test --filter server -- ai-analysis

# Run data aggregation tests specifically
pnpm test --filter server -- data-aggregation.service.spec

# Run frontend button tests
pnpm test --filter client -- AnalyzeButton

# Run e2e tests
pnpm test:e2e --filter server
```

### Testing Manually

**Via Swagger UI:**

1. Start server: `pnpm dev`
2. Open http://localhost:3000/api/docs
3. Authorize with JWT
4. Try `POST /ai/cases/{caseId}/analyze`

**Via curl:**

```bash
curl -X POST http://localhost:3000/api/v1/ai/cases/YOUR_CASE_ID/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Privacy & Security

### Data Protection

**Anonymization happens before any external API calls:**

- Patient names → "[PATIENT]"
- Specific dates → relative time references
- Contact info → removed entirely
- Only clinical patterns and anonymized demographics are sent to Gemini

**What stays in your infrastructure:**

- Anonymization mappings (in-memory only)
- Original patient data
- Voice recordings
- Medical images

### GDPR Compliance

- No PII is sent to external LLM providers
- No patient data is used to train AI models
- All citations use original book content (no patient data)
- Audit trail of analysis requests (case ID + timestamp only)

---

## Troubleshooting

### Analysis taking too long (>3 seconds)

**Check:**

1. RAG query performance: `pnpm knowledge:stats`
2. Database connection pool
3. Gemini API rate limits

**Solutions:**

- System degrades gracefully - you'll get partial results with warnings
- Check server logs for timing breakdown

### "No image analysis available" warning

**Cause:** Case has no evaluations with posturograms or footprints.

**Fix:** Add an evaluation with posturogram data, or ignore if not relevant to this case.

### "Limited knowledge base results" warning

**Cause:** RAG queries timed out or no relevant passages found.

**Fix:** Check if books are ingested: `pnpm knowledge:list`

### Button disabled (grayed out)

**Cause:** Case has no evaluations.

**Fix:** Create at least 1 evaluation (Initial or Final) before analyzing.

---

## Related Documentation

- [Knowledge Base & RAG](knowledge-base-rag.md) - Managing medical literature
- [API Reference](api-reference.md) - Complete API documentation
- [Security & Privacy](security.md) - Data protection details

---

## Appendix: Future Architecture Considerations

### Provider-Agnostic AI Architecture (Option B)

**Status:** Future enhancement (not yet implemented)  
**Last Modified:** 2026-02-06

#### The Vision

Make the AI Analysis service provider-agnostic so you can switch between AI providers (Google Gemini, OpenAI GPT, Anthropic Claude) based on:

- **Price optimization** - Use whichever provider is cheaper at the moment
- **Availability** - Fail over if one provider is down
- **Performance** - Choose based on latency or quality needs
- **Compliance** - Some clients may require specific providers

#### Current Limitation: Embeddings Are Model-Specific

**Critical constraint:** The Knowledge Base (RAG) uses **Gemini embeddings** (`gemini-embedding-004`).

```
┌─────────────────────────────────────────────────────────────────┐
│  EMBEDDINGS ARE MODEL-SPECIFIC                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Text: "Fascitis plantar es una inflamación..."                  │
│                                                                  │
│  ┌────────────────────┐      ┌────────────────────┐             │
│  │ Gemini Embedding   │  ≠   │ OpenAI Embedding   │             │
│  │ [0.12, -0.45, ...] │      │ [0.89, 0.23, ...]  │             │
│  │ 768 dimensions     │      │ 1536 dimensions    │             │
│  └────────────────────┘      └────────────────────┘             │
│                                                                  │
│  WHY? Each model creates vectors in its own "semantic space"     │
│  with different dimensionalities and mathematical properties.    │
│                                                                  │
│  You CANNOT mix embeddings from different models!                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**What this means:**

| Component                 | Can Switch Provider? | Impact                                   |
| ------------------------- | -------------------- | ---------------------------------------- |
| **Text Generation** (LLM) | ✅ Yes               | Easy - just change API endpoint          |
| **Vision Analysis**       | ✅ Yes               | Requires code changes but doable         |
| **Embeddings/RAG**        | ❌ No                | Would require **re-ingesting all books** |

#### Architecture for Provider-Agnostic LLM

If you want to switch the **analysis LLM** (not embeddings), here's the architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Analysis Module                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                          │
│  │ AIProvider       │◄────────── Interface                     │
│  │ Interface        │                                          │
│  ├──────────────────┤                                          │
│  │ + generateContent│                                          │
│  │ + getModelName() │                                          │
│  └────────┬─────────┘                                          │
│           │                                                      │
│     ┌─────┴─────┐                                                │
│     │           │                                                │
│  ┌──▼───┐   ┌───▼────┐   ┌──────────────┐                      │
│  │Google│   │ OpenAI │   │  Anthropic   │                      │
│  │Provider   │Provider│   │   Provider   │                      │
│  └──┬───┘   └───┬────┘   └──────────────┘                      │
│     │           │                                                │
│     └─────┬─────┘                                                │
│           │                                                      │
│     ┌─────▼─────┐                                                │
│     │ Config    │                                                │
│     │ AI_ANALYSIS_PROVIDER=google|openai|anthropic               │
│     └───────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Environment Variables (Future Design)

```bash
# Provider selection
AI_ANALYSIS_PROVIDER=google  # Options: google, openai, anthropic

# Google Gemini (current)
GOOGLE_API_KEY=your_key
GOOGLE_ANALYSIS_MODEL=gemini-3-flash-preview

# OpenAI (optional future)
OPENAI_API_KEY=your_key
OPENAI_ANALYSIS_MODEL=gpt-4-turbo-preview

# Anthropic (optional future)
ANTHROPIC_API_KEY=your_key
ANTHROPIC_ANALYSIS_MODEL=claude-3-opus-20240229

# Note: Embeddings always use Gemini (knowledge base is locked)
GOOGLE_EMBEDDING_MODEL=gemini-embedding-004
```

#### Why Embeddings Can't Be Swapped

**The technical reason:**

1. **Different Vector Spaces**: Each embedding model maps text to vectors differently
   - Gemini: "fascitis plantar" → `[0.12, -0.45, 0.89, ...]` (768 dims)
   - OpenAI: "fascitis plantar" → `[0.89, 0.23, -0.67, ...]` (1536 dims)

2. **Semantic Mapping**: The meaning of dimensions is model-specific
   - Dimension 5 might mean "medical" in Gemini but "anatomy" in OpenAI

3. **Similarity Math**: Cosine similarity only works within the same vector space
   - Comparing Gemini vector to OpenAI vector = meaningless

**What switching would require:**

```bash
# 1. Wipe current embeddings
pnpm knowledge:wipe

# 2. Change embedding model in code
# 3. Re-ingest ALL books (expensive!)
pnpm knowledge:ingest

# 4. Wait 2-4 hours for 20+ books
```

#### Recommendation

**Current approach (keep as-is):**

- Use Gemini for everything (embeddings + LLM + vision)
- Simple, consistent, cost-effective
- One API key to manage

**Future enhancement (if needed):**

- Keep Gemini embeddings (can't change without re-ingesting)
- Make LLM provider-agnostic (easy to switch)
- Use adapter pattern for different LLM APIs

**When to consider Option B:**

- Gemini becomes too expensive
- Gemini has reliability issues
- You need features only available in GPT-4 or Claude
- Compliance requirements dictate specific providers

**Cost comparison (approximate, per 1M tokens):**

| Provider  | Model          | Input  | Output |
| --------- | -------------- | ------ | ------ |
| Google    | Gemini 3 Flash | $0.075 | $0.30  |
| OpenAI    | GPT-4 Turbo    | $10.00 | $30.00 |
| Anthropic | Claude 3 Opus  | $15.00 | $75.00 |

_Gemini is currently 130x cheaper than GPT-4 and 200x cheaper than Claude!_

#### Implementation Notes

If you decide to implement Option B later:

1. **Create provider interface:**

   ```typescript
   export interface AIProvider {
     generateContent(prompt: string, config?: ProviderConfig): Promise<string>;
     getModelInfo(): ModelInfo;
   }
   ```

2. **Implement adapters:**
   - `GoogleProvider` - uses `@google/genai`
   - `OpenAIProvider` - uses `openai` SDK
   - `AnthropicProvider` - uses `@anthropic-ai/sdk`

3. **Factory pattern:**

   ```typescript
   @Injectable()
   export class AIProviderFactory {
     create(provider: string): AIProvider {
       switch (provider) {
         case 'google':
           return new GoogleProvider();
         case 'openai':
           return new OpenAIProvider();
         case 'anthropic':
           return new AnthropicProvider();
       }
     }
   }
   ```

4. **Keep embeddings separate:**
   - Always use Gemini for embeddings (KnowledgeBaseService)
   - Only swap the LLM (AiAnalysisService)

---

**Bottom line:** You CAN switch LLM providers for text generation, but you CANNOT switch embedding providers without re-ingesting your entire medical library. The current Gemini-only approach is simpler and significantly cheaper.
