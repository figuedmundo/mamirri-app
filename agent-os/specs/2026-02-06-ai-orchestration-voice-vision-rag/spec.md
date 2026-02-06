# Specification: AI Orchestration (Voice + Vision + RAG + LLM)

## Goal

Create an orchestration layer that combines Voice transcripts, Vision findings, RAG medical knowledge retrieval, and LLM synthesis to provide therapists with cited, evidence-based clinical analysis and treatment suggestions for patient cases.

## User Stories

- As a physiotherapist, I want to click "Analyze Case" to receive AI-powered treatment suggestions so that I can validate my clinical reasoning with evidence-based recommendations.
- As a therapist, I want to see which medical books support each AI suggestion so that I can trust the recommendations and reference them in my treatment planning.

## Specific Requirements

**On-Demand Analysis Trigger**

- Add "Analyze with AI" button to CaseDetailLayout header, disabled when <1 evaluation exists
- Button triggers POST /api/v1/ai/cases/:caseId/analyze endpoint
- Show loading state with progress indicator during analysis
- Display toast notification on success/failure

**Multi-Modal Data Aggregation**

- Fetch all evaluations (Initial, Progress, Final) for the clinical case
- Query last 3 treatment sessions ordered by date descending for trend context
- Retrieve pre-analyzed Vision findings from Evaluation.posturogramResults and Evaluation.footprintResults
- Collect transcribed voice notes from evaluations and sessions via voiceNotes JSON arrays
- Anonymize patient demographics before processing (strip names, dates, locations; keep age range, gender)

**Parallel RAG Evidence Retrieval**

- Execute 4 parallel similarity searches using KnowledgeBaseService.findSimilar(): diagnosis query, treatment query, contraindications query, prognosis query
- Retrieve top 5 relevant passages per query angle from pgvector embeddings table
- Deduplicate results by content hash to avoid redundant citations
- Implement 5-second timeout per query with graceful fallback to partial results
- Return RAG results ranked by similarity score

**LLM Synthesis with Gemini 3 Flash**

- Build comprehensive prompt including: anonymized patient context, vision findings summary, voice transcript excerpts, RAG passages
- Include system prompt with Chain-of-Thought clinical reasoning guidelines
- Request structured JSON output matching AnalysisResultDto schema
- Implement 10-second timeout with 3 retry attempts using exponential backoff
- Post-process response to extract JSON, validate schema, and format for display

**Card-Based Suggestions UI**

- Display AI analysis results in scrollable panel or modal
- Show pattern recognized section with supporting evidence bullet list
- Render suggestions as cards with: type badge (diagnostic_hypothesis/treatment_protocol/contraindication), content text, confidence level (HIGH/MEDIUM/LOW chip), rationale explanation
- Include citations section with: book title, page number, relevance percentage, expandable passage quote
- Add disclaimer footer: "AI-generated suggestion. Clinical judgment required."

**Graceful Degradation**

- Detect service failures and mark in response metadata under metadata.serviceStatus
- Return partial analysis when RAG unavailable (degrade to LLM-only reasoning)
- Show warning indicator when Vision findings missing: "Image analysis unavailable"
- Display retry button when LLM timeout occurs: "Analysis delayed. Try again?"
- Color-code status: green (all services), yellow (partial), red (failed)

**Response Time Optimization**

- Target <2.5 seconds total response time (max 3 seconds)
- Parallelize: RAG queries (Promise.all), vision/voice DB reads, citation translation
- Sequential only: LLM call (must wait for RAG context)
- Log timing breakdown: data gathering, RAG, LLM, post-processing

**Privacy and Security**

- Anonymize all PII via AnonymizerService before external LLM calls
- Never send patient names, specific dates, or identifiers to Gemini
- Log only anonymized analysis requests with case ID and timestamp
- Ensure all citations use original book content without patient data

## Visual Design

No visual mockups provided. Design should follow existing Shadcn/UI patterns from CaseDetailLayout and use card-based layout consistent with the product's "Card-Based Decision Support" differentiator.

## Existing Code to Leverage

**AiAnalysisService**

- Core orchestration service already implementing multi-query RAG and LLM synthesis
- Reuse analyzeCase() flow pattern: load case → anonymize → RAG → prompt building → LLM call → parse response
- Extend to include Vision findings and Voice transcripts aggregation

**KnowledgeBaseService**

- findSimilar(query, limit) method executes vector similarity search via pgvector
- Already implements parallel RAG queries for diagnosis, treatment, contraindications
- Returns chunks with content, documentTitle, author, pageNumber, similarity scores

**AnalysisResultDto and Interfaces**

- SuggestionDto structure with title, description, confidence enum, reasoning
- CitationDto with quote, documentTitle, author, pageNumber, relevance
- ReasoningDto with step1_understanding, step2_literature, step3_synthesis
- MetadataDto with processing metrics

**CaseDetailLayout Component**

- Existing header layout with action buttons pattern
- Props interface accepts callbacks and render slots
- Use as placement location for "Analyze with AI" button

**AnonymizerService**

- anonymize() method strips PII and returns anonymized text + mapping
- rehydrate() method restores original values after LLM processing
- Already integrated into AiAnalysisService flow

## Out of Scope

- Real-time streaming suggestions (on-demand analysis only)
- Raw image analysis during orchestration (use pre-analyzed Vision findings only)
- Modifications to existing VisionService or TranscriptionService
- New database tables or schema changes
- Patient-facing AI features (therapist-only functionality)
- Multi-language support beyond existing EN/ES toggle
- Offline AI analysis (requires internet connectivity)
- Caching of analysis results for repeated queries
- Like/dislike feedback buttons on suggestions
- Version history of AI analyses
- Export analysis as PDF report
- Comparison mode between initial and final evaluations
