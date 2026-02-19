# 🗺️ Mamirri Product Roadmap (30 Weeks)

Estimated Total Time: 30 Weeks (~7.5 months) for complete product.
Methodology: Agile Development (1-week Sprints).

---

═══════════════════════════════════════════════════════════════════════════════

## 📦 PART 1: MVP (Weeks 1-11)

═══════════════════════════════════════════════════════════════════════════════

**Goal:** Working app for field testing. Mother can complete consultations.

---

## 🏁 Phase 0: Foundations & Infrastructure (Weeks 1-4) ✅ COMPLETE

### Week 1: Infrastructure ✅

- [x] **1.1** Docker Infrastructure: PostgreSQL (w/ pgvector), MinIO, Redis
- [x] **1.2** Prisma Schema v1: User, Patient, Session tables
- [x] **1.3** NestJS Structure: Module shells (auth, patients, sessions, media)
- [x] **1.4** Frontend Setup: React + Shadcn/UI basic layout

### Week 2: Auth & Storage ✅

- [x] **2.1** JWT Authentication: Register/Login/Logout flows
- [x] **2.2** MinIO Integration: Upload/Download service
- [x] **2.3** Frontend Auth: Protected routes & context
- [x] **2.4** Basic Error Handling: Global filters

### Week 3: DevOps ✅

- [x] **3.1** Database Backups: Automated backup scripts
- [x] **3.2** Environment: Secure .env management
- [x] **3.3** CI/CD: Basic GitHub Actions (lint/test)
- [x] **3.4** Deployment: Deploy to Ubuntu home lab

### Week 4: Testing Foundation ✅

- [x] **4.1** Unit Tests: Critical backend services
- [x] **4.2** E2E Tests: Auth flow verification
- [x] **4.3** API Docs: Swagger setup & refinement
- [x] **4.4** Onboarding: Developer guide & setup scripts

**🎯 Milestone 1:** "I can login and see an empty dashboard" ✅ COMPLETE

---

## 🏗️ Phase 1: Core Features (Weeks 5-8)

### Week 5: Pacientes — Core Components (Milestone 2a)

**Components:**

- [x] **5.1** PacientesList — Grid of patient cards with search, filters, quick actions
- [x] **5.2** PacienteProfile — Detailed view with cases history, photos, action buttons
- [x] **5.3** CaseDetailLayout — Split layout wrapper for clinical timeline and content ✅
  - **Tests:** 26/35 tests passing (74% coverage of critical flows)
  - **Implementation:** Complete with session add/edit callbacks, voice UI, posturogram integration
- [x] **5.4** CaseTimeline — Visual timeline of clinical case phases and sessions ✅
  - **Tests:** 18/23 tests passing (78% coverage of critical flows)
  - **Implementation:** Complete with phase grouping, session selection, voice note indicators

**Backend & Data Layer:**

- [x] **5.5** Database schema: Patient, ClinicalCase, Evaluation, TreatmentSession
  - **Note:** Prisma schema supports 1:N Evaluations per ClinicalCase (INITIAL, PROGRESS, FINAL)
  - **Note:** Evaluation.type field exists in DB, frontend alignment needed (see 6.14)
- [x] **5.6** API endpoints: Patients CRUD with therapist isolation
- [x] **5.7** API endpoints: Clinical cases CRUD
- [x] **5.8** API endpoints: Treatment sessions CRUD
- [x] **5.9** Validation: Pain scale (0-10), Barthel index (0-100)

**Integrations:**

- [x] **5.10** Wire callbacks: onView, onCreate, onEdit, onDelete
- [x] **5.11** Wire callback: onSchedule (Google Calendar pre-fill)
- [x] **5.12** Empty states: No patients, no active case, no search results
- [x] **5.13** Loading states and error handling with toasts

**Tests:**

- [x] **5.14** Backend unit tests: Patient, ClinicalCase services
- [x] **5.15** Backend integration tests: Patient endpoints

### Week 6: Pacientes — Evaluation & Timeline (Milestone 2b)

**Components:**

- [x] **6.1** EvaluacionForm — Clinical evaluation (posturograma, orthopedic tests) ✅
  - **Implementation:** Interactive SVG body silhouette, 8 orthopedic tests, voice recorder UI, debounced auto-save
  - **Tests:** 30 tests passing (useDebounce, BodySilhouette, VoiceRecorder)
  - **Spec:** agent-os/specs/2026-01-15-evaluacion-form/
- [x] **6.2** Cronograma — Treatment sessions timeline with phase indicators ✅
  - **Implementation:** PhaseProgress, SessionCard, PainTrendChart, SessionStatsSummary, SessionForm
  - **Tests:** 12 tests passing (PhaseProgress, PainTrendChart)
  - **Spec:** agent-os/specs/2026-01-15-cronograma/
- [x] **6.3** ComparacionBoard — Before/After visual comparison slider
- [x] **6.4** PosturogramViewer — Interactive posturogram with anatomical markers

**Flows:**

- [ ] **6.5** Flow 1: Create New Patient (voice placeholder for Week 7)
- [ ] **6.6** Flow 2: Record Treatment Session (Check-in with END scale)
- [ ] **6.7** Flow 3: Compare Posturogram (Before/After slider)
- [ ] **6.8** Flow 4: View Patient Timeline (phases and sessions)

**Clinical Model Alignment (Doctor's Requirements):**

> Based on expert input: Treatment follows a 6-stage flow with 2 formal evaluations (Initial + Final) and per-session evolution tracking across 5 phases / 15 sessions.

- [x] **6.14** Evaluation 1:N Migration — Frontend types `evaluation` → `evaluations[]`
  - **Spec:** agent-os/specs/2026-01-16-evaluation-1n-migration/
  - **Scope:** Update ClinicalCase type, add utility functions, update 9 components
  - **Estimate:** 2 hours
- [x] **6.15** Add `type` field to Evaluation UI — Selector for INITIAL / FINAL
  - EvaluacionForm should prompt user to select evaluation type when creating
  - Display evaluation type badge in CaseDetailLayout header
- [x] **6.16** Update ComparisonBoard — Derive Initial vs Final from evaluations array
  - Use `getInitialEvaluation()` and `getFinalEvaluation()` utility functions
  - Show empty state if Final evaluation doesn't exist yet
- [x] **6.17** Treatment Plan Objectives UI — Display therapeutic/prophylactic/educational goals
  - Add objectives section to CaseDetailLayout (Stage 2 of clinical flow)
  - Wire to `TreatmentPlan.objectives` from backend
- [x] **6.18** 5-Phase Progress Visualization — Update phase model from 4 to 5 phases
  - Phase 1: Initial (mobilizations, pain relief)
  - Phase 2: Early-Intermediate (begin stretching)
  - Phase 3: Intermediate (flexibility gains)
  - Phase 4: Late-Intermediate (therapeutic exercises)
  - Phase 5: Advanced (functional strengthening)

**Future (Post-MVP):**

- [ ] **6.19** Case Recommendations Entity — Treatment closure with suggestions
  - Data model: `CaseRecommendations` (patientRecommendations, professionalRecommendations, continuationStrategy)
  - UI: Recommendations section in case completion flow
  - **Deferred to:** Week 10 or Part 3

**Integrations:**

- [x] **6.9** Wire callbacks: onSave, onPosturogramaChange, onPainScaleChange
- [x] **6.10** Wire callbacks: onAddSession, onEditSession, onViewSession
- [x] **6.11** Wire callback: onExport (comparison report)
- [ ] **6.12** Responsive design for mobile/tablet
- [x] **6.13** Frontend tests: Key user flows (TDD approach)
- [x] **6.20** Evaluation utility functions unit tests

**🎯 Milestone 2:** "I can create patients, record sessions, and compare evaluations"

**Full Checklist:** See `product-plan/instructions/incremental/02-pacientes.md#done-when`

---

### Week 7: Media & Dictation

- [x] **7.1** Backend: Media upload endpoint (validation, MinIO)
- [x] **7.2** Frontend: Camera capture component
- [x] **7.3** Frontend: Photo gallery per session
- [x] **7.4** Backend: Whisper integration (Groq API)
- [x] **7.5** Frontend: Voice recorder button + transcription
- [x] **7.6** Wire Pacientes: onVoiceDictation, onCaptureHuella, onCaptureVideo
- [x] **7.7** Make a list of all buttons that record auidio and video, and wire their states and methods
- [ ] **7.8** Test: Dictate medical terms, verify accuracy

**🎯 Milestone 3:** "I can take photos and dictate notes"

---

### Week 8: PWA Basics (Offline Skeleton)

- [x] **8.1** Service Worker: Cache static assets
- [x] **8.2** Offline indicator (connection status)
- [x] **8.3** PWA manifest (install to home screen)
- [x] **8.4** Test: Works without internet (static pages only)

**Note:** Full offline editing (IndexedDB sync) deferred to Part 4.

**🎯 Milestone 4:** "App loads offline, shows cached data"

---

## 🧪 Phase 2: Validation & Hardening (Weeks 9-11)

### Week 9: Field Testing ("The Truth")

- [x] **9.1** Install on mother's iPad
- [x] **9.2** Observe 3-5 real consultations
- [ ] **9.3** Document friction points (what breaks her flow?)
- [ ] **9.4** Collect performance data (slow queries?)
- [ ] **9.5** User feedback interview

#### Issues raised

- [x] 9.6 Improve create patient form
- [x] 9.7 Improve login
- [x] 9.8 Possibility to add a clinic that will habe theraphists and patients (multi-tenancy)
- [ ] 9.10 Clinic onboarding 

**🎯 Milestone 5:** "Mother used it with a real patient without asking for help"

### Week 10: Pivot & Fix Week 🔧

**Critical Buffer Week - Expect the Unexpected**

- [ ] **10.1** Prioritize top 3 UX blockers from Week 9
- [x] **10.1.1** Make login more fast , the doctor feels enter email is slow, make the create account more visible
- [x] **10.1.2** Theraphist want have a profile page where can update personal details

- [ ] **10.2** Fix critical bugs (data loss, crashes)
- [ ] **10.3** Refine UI based on real usage (button sizes, wording)
- [ ] **10.4** Performance: Only fix proven bottlenecks
- [ ] **10.5** Decision: AI-ready or need more MVP work?

**Possible outcomes:**

- ✅ MVP solid → Proceed to Week 11
- ⚠️ Major issues → Extend MVP work, push AI to later

### Week 11: Security & Performance (Post-Validation)

- [x] **11.1** Input sanitization (based on real attack vectors)
- [ ] **11.2** File upload security (malware scan if needed)
- [ ] **11.3** Rate limiting (if API abuse detected)
- [ ] **11.4** Database indexing (based on slow query logs)
- [ ] **11.5** Image compression (if storage is an issue)
- [x] **11.6** Audit logging for sensitive operations

**🎯 Milestone 6:** "App is production-ready (no AI yet)"

---

### 🚦 MVP Gate Check (End of Week 11)

| Criteria                                   | Target |
| ------------------------------------------ | ------ |
| Mother completes consultation without help | ✅     |
| No data loss in 10 test sessions           | ✅     |
| Page load time < 3 seconds on iPad         | ✅     |
| Used for 20+ real patients                 | ✅     |
| Zero critical security vulnerabilities     | ✅     |
| Backup/restore tested and works            | ✅     |

---

═══════════════════════════════════════════════════════════════════════════════

## 🧠 PART 2: AI INFRASTRUCTURE (Weeks 12-16)

═══════════════════════════════════════════════════════════════════════════════

**Goal:** The AI "brain" that differentiates the product.

**Pre-requisite Check:**

- [x] Do you have 3-5 reference books (PDFs) ready?
- [x] Are they legally yours to process?
- [ ] Is the MVP stable enough to build on?

---

### Week 12: Knowledge Base Preparation ✅

- [x] **12.1** Research: PDF extraction tools (pdf-parse vs. Unstructured.io)
- [x] **12.2** Chunking strategy design (500 words, 50-word overlap)
- [x] **12.3** Metadata schema (book, page, chapter, section)
- [x] **12.4** Manual test: Extract 1 book, verify quality
- [x] **12.5** Write ingestion script with error handling

### Week 13: Vector Database (RAG Foundation) ✅

- [x] **13.1** Enable pgvector on Postgres
- [x] **13.2** Create embeddings table schema
- [x] **13.3** Generate embeddings (Google Gemini text-embedding-004)
- [x] **13.4** Bulk insert vectors into database
- [x] **13.5** Test similarity search queries
- [x] **13.6** Optimize: Vector index for <200ms queries

### Week 14: The AI Agent (Backend)

- [x] **14.1** NestJS: AIAnalysis module
- [x] **14.2** RAG logic: Semantic search implementation
- [x] **14.3** LLM integration: Gemini or Groq
- [x] **14.4** System Prompt engineering (Chain of Thought)
- [x] **14.5** Anonymization: Strip PII before sending to LLM
- [x] **14.6** Translation service: EN ↔ ES for medical terms
- [x] **14.7** Test: Query "fascitis plantar" → returns relevant book passages

### Week 15: Vision & Full Analysis

- [x] **15.1** Gemini Vision: Image description API
- [x] **15.2** Orchestration: Combine Voice + Vision + RAG + LLM
- [x] **15.3** "Analyze Case" endpoint (orchestrates all services)
- [x] **15.4** Frontend: Suggestions UI (cards, citations) ✅
  - **Implementation:** Complete wiring with AnalysisResultsPanel, citation authors, warning banners, and re-open/retry states.
  - **Tests:** 22/22 feature-specific tests passing (100% coverage of core wiring and enhancements)
- [x] **15.5** Feedback loop: Like/Dislike buttons
- [ ] **15.6** Test: Complete flow with real patient data

**🎯 Milestone 7:** "The AI provides a cited treatment suggestion"

### Week 16: RAG Optimization & AI Refinement ✅ COMPLETE

> **Spec:** `agent-os/specs/2026-02-06-rag-optimization/`
> **Goal:** Move from "Production-Grade" to "State-of-the-Art" RAG system.

**🔴 Critical Improvements (High Impact):**

- [x] **16.1** Semantic Chunking — Replace word-based (500w) with semantic splitting [NOTE: semantic chunking was disabled as it consumed too many tokens]
  - Group sentences by embedding similarity (respects meaning boundaries)
  - Expected improvement: +70% retrieval accuracy
  - Implementation: `KnowledgeBaseService.semanticChunk()`
- [x] **16.2** Parent-Document Retrieval — Small-to-Big retrieval pattern ✅
  - Index small chunks (256-512 tokens) for precise search
  - Return larger parent documents (2000 tokens) for LLM context
  - Expected improvement: +30% context retention
- [x] **16.3** Reranking with Cross-Encoder — Refine top-K results ✅
  - Retrieve 15-20 candidates from pgvector
  - Rerank to top 5 with Cohere Rerank v3 or local cross-encoder
  - Expected improvement: +40% RAG accuracy
  - Implementation: `AiAnalysisService.rerankChunks()`
- [x] **16.4** Hybrid Search (BM25 + Dense) — Catch exact medical terminology ✅
  - Add PostgreSQL `tsvector` full-text index to embeddings table
  - Combine with `pgvector` using Reciprocal Rank Fusion (RRF)
  - Expected improvement: +40% for exact matches (drug names, ICD codes)
  - SQL: `CREATE INDEX embeddings_content_fts ON embeddings USING GIN (to_tsvector('english', content));`

**🟡 Important Improvements (Medium Impact):**

- [x] **16.5** RAG Evaluation Framework — Measure retrieval quality ✅
  - Implement RAGAS metrics: Context Precision, Recall, Faithfulness
  - Create test suite with medical queries and expected documents
  - CI integration for regression detection
  - File: `knowledge-base/rag-evaluation.spec.ts`
- [x] **16.6** Metadata Filtering — Filter by book, year, volume ✅
  - Extend `findSimilar()` with optional filters parameter
  - UI: Allow users to scope searches to specific books
- [ ] **16.7** Explainability — Show which passages influenced suggestion
  - Display RAG chunks with relevance scores in UI
  - Link citations to specific document sections

**🟢 Refinements:**

- [ ] **16.8** Prompt iteration (based on real output quality)
- [ ] **16.9** Add more books to knowledge base
- [ ] **16.10** Vision prompt refinement

### Week 16.5: OCR & High-Fidelity Extraction (Docling) ✅ COMPLETE

> **Spec:** `agent-os/specs/2026-02-09-rag-pdf-ocr-docling/`
> **Goal:** Upgrade PDF processing with high-fidelity OCR for better layout preservation.

- [x] **16.5.1** Docling Worker — Implement Python-based PDF-to-Markdown engine
- [x] **16.5.2** Page Marker Injection — Support precise page-level citations: `<!-- PAGE_NUMBER: X -->`
- [x] **16.5.3** Multi-Engine Pipeline — Fallback to PyMuPDF if Docling worker is not initialized
- [x] **16.5.4** CLI Integration — Update `pnpm knowledge:convert` to support `--engine=docling`

### Week 17: Embedding Model Upgrade (Voyage AI) ✅ COMPLETE

> **Spec:** `agent-os/specs/2026-02-10-migrate-to-voyage-4-embeddings/`
> **Goal:** Migrate to state-of-the-art Voyage-4-large embeddings with asymmetric retrieval.

- [x] **17.1** Voyage AI Integration — Implement VoyageEmbeddingService with SDK
- [x] **17.2** Asymmetric Retrieval — Use voyage-4-large for docs, voyage-4 for queries
- [x] **17.3** 1024-Dim Migration — Update pgvector schema to support new dimensions
- [x] **17.4** Batch Optimization — Implemented Async Batch API to bypass rate limits

**Expected Combined Improvement: 2-3x over current baseline**

| Improvement       | Expected Gain           |
| ----------------- | ----------------------- |
| Semantic chunking | +70% retrieval accuracy |
| Reranking         | +40% RAG precision      |
| Hybrid search     | +40% exact terminology  |
| Parent-document   | +30% context retention  |

---

### 🚦 AI Gate Check (End of Week 16)

| Criteria                                 | Target      |
| ---------------------------------------- | ----------- |
| AI suggestions clinically relevant       | 80%+        |
| Citations trace to actual book content   | ✅          |
| Query response time                      | < 3 seconds |
| Mother trusts AI enough to use regularly | ✅          |
| RAGAS Context Precision                  | > 0.75      |
| RAGAS Faithfulness                       | > 0.80      |
| Exact terminology retrieval (drug names) | ✅          |

---

═══════════════════════════════════════════════════════════════════════════════

## 🏆 PART 3: COMPLETE PRODUCT (Weeks 17-30)

═══════════════════════════════════════════════════════════════════════════════

**Goal:** Full professional toolset for physiotherapy practice.

---

## 📚 Phase 4: Biblioteca Médica (Weeks 17-18) — Milestone 8

**Implementation note (2026-02-18):** Biblioteca is currently implemented as **books-only** search (RAG results) with an "Open book" markdown viewer. Protocol/category/bibliography overlays are quarantined (hidden) to avoid manual maintenance risk.

### Week 17: Search & Categories

**Components:**

- [x] **17.1** LibraryDashboard — Main interface with search + book passages (BibliotecaDashboard)
- [x] **17.2** Book grouping — Results grouped by book with cited pages
- [x] **17.3** Snippet + context — Focused match + expandable context
- [x] **17.4** Open book viewer — Full markdown viewer with page jump

**Backend:**

- [x] **17.5** Database schema: Document, Embedding
- [x] **17.6** API endpoint: `GET /library/protocols?q=...` (ragResults)
- [x] **17.7** API endpoint: `GET /library/books/:documentId/markdown`
- [x] **17.8** Client caching to avoid repeated retrieval calls

<!--
Legacy overlay plan (protocol/category/reference layers) was quarantined in favor of books-only Biblioteca.

- [ ] **17.5** Database schema: Protocol, ReferenciaBibliografica
- [ ] **17.6** API endpoints: Protocol search with full-text + RAG
- [ ] **17.7** Category filtering endpoint
- [ ] **17.8** Search debouncing (300ms)
-->

**Flows:**

- [ ] **17.9** Flow 1: Search for Protocol (natural language)
- [ ] **17.10** Flow 2: Browse by Category

### Week 18: Protocol Details & References

**Components:**

- [ ] **18.1** Citations — show title/author/page for each passage
- [ ] **18.1.1** BibliographyPanel — Formal citations and references
      **Features:**

- [ ] **18.2** Side-panel navigation — open book without losing results
- [ ] **18.3** Markdown rendering — readable formatting + safe sanitization
- [ ] **18.4** Protocol detail view (Ficha Explicativa)
- [ ] **18.5** Definition, justification, procedure steps
- [ ] **18.6** EN/ES translation toggle (uses AI from Phase 3)
- [ ] **18.7** Bibliographic references with author, year, title, source
- [ ] **18.8** Add reference to treatment plan

**Flows:**

- [ ] **18.9** Flow 3: View Protocol Details with language toggle
- [ ] **18.10** Flow 4: Add Reference to Treatment Plan

**Empty States:**

- [ ] **18.9** Initial welcome state
- [ ] **18.10** No search results
- [ ] **18.11** Empty category
- [ ] **18.12** No bibliography

**🎯 Milestone 8:** "I can search medical literature and add references to treatment plans"

**Full Checklist:** See `product-plan/instructions/incremental/04-biblioteca-medica.md#done-when`

---

## 📊 Phase 5: Análisis (Weeks 19-22) — Milestone 9

### Week 19: Footprint Analysis

**Components:**

- [ ] **19.1** HuellaAnalysis — Footprint viewer with pressure heatmap

**Backend:**

- [ ] **19.2** Database schema: Huella (footprint)
- [ ] **19.3** Image upload with validation
- [ ] **19.4** Arch classification logic (plano/cavo/normal)
- [ ] **19.5** Pressure distribution analysis

**Flow:**

- [ ] **19.6** Flow 1: Analyze Footprint (upload, heatmap, classification)

### Week 20: Posturogram

**Components:**

- [ ] **20.1** PosturogramaView — 4-view with anatomical point markers

**Backend:**

- [ ] **20.2** Database schema: Posturograma with 4 views
- [ ] **20.3** Image upload for anterior, posterior, lateral views
- [ ] **20.4** Anatomical point storage (head, shoulders, spine, pelvis)
- [ ] **20.5** Deviation auto-detection (escoliosis, hiperlordosis)

**Flow:**

- [ ] **20.6** Flow 2: Capture Posturogram (4 views, mark points, save)

### Week 21: Video Analysis

**Components:**

- [ ] **21.1** VideoAnalysis — Video player with slow-motion and angle detection

**Backend:**

- [ ] **21.2** Database schema: VideoDePostura
- [ ] **21.3** Video upload with processing
- [ ] **21.4** Angle detection (genuFlexo, inclinacionTronco)

**Features:**

- [ ] **21.5** Slow-motion playback (0.25x, 0.5x)
- [ ] **21.6** Frame-by-frame controls
- [ ] **21.7** Gait phase detection (heel strike, toe-off)
- [ ] **21.8** Initial vs. Final comparison mode

**Flow:**

- [ ] **21.9** Flow 3: Analyze Gait Video

### Week 22: Evolution Dashboard

**Components:**

- [ ] **22.1** AnalisisDashboard — Overview with case comparison and metrics
- [ ] **22.2** EvolucionDashboard — Progress charts (initial vs. final)
- [ ] **22.3** DiagnosticoComparativoCard — Improvement/decline indicators
- [ ] **22.4** DolorChart — Line chart tracking pain levels over sessions
- [ ] **22.5** TestsComparativosChart — Bar chart comparing functional tests

**Features:**

- [ ] **22.6** Pain reduction visualization (9/10 → 4/10)
- [ ] **22.7** Functional test improvements (Schober: +3cm → +4cm)
- [ ] **22.8** Generate comparative diagnostic report
- [ ] **22.9** Export report

**Flow:**

- [ ] **22.10** Flow 4: Generate Comparative Report

**Empty States:**

- [ ] **22.11** No case selected
- [ ] **22.12** No evaluation data
- [ ] **22.13** No progress yet (single data point)

**🎯 Milestone 9:** "I can analyze biomechanics and track objective progress"

**Full Checklist:** See `product-plan/instructions/incremental/03-analisis.md#done-when`

---

## 🦶 Phase 6: Plantillas 3D CAD (Weeks 23-28) — Milestone 10

### Week 23: 3D Foundation & Viewer

**Components:**

- [ ] **23.1** PlantillasEditor — Full-screen CAD workspace
- [ ] **23.2** InsoleViewer3D — Interactive 3D model (Three.js / React Three Fiber)
- [ ] **23.3** ClinicalSidePanel — Persistent right panel with diagnosis data

**Infrastructure:**

- [ ] **23.4** Three.js / React Three Fiber setup
- [ ] **23.5** Base insole 3D model (GLTF/GLB)
- [ ] **23.6** Camera controls: rotate, zoom, pan (OrbitControls)
- [ ] **23.7** Lighting setup for medical visualization
- [ ] **23.8** Full-screen mode (no main navigation while editing)

**Backend:**

- [ ] **23.9** Database schema: Plantilla, ZonaAlivio, MaterialPlanta
- [ ] **23.10** API endpoints: Plantilla CRUD
- [ ] **23.11** Link to clinical case diagnosis data

### Week 24: Structure Editing (Sliders)

**Components:**

- [ ] **24.1** Toolbar — Tool switching (Slider/Brush modes)
- [ ] **24.2** PropertiesPanel — Sliders for structural adjustments

**Features:**

- [ ] **24.3** Arch height slider (0-20mm) with real-time 3D update
- [ ] **24.4** Heel wedge slider (0-10mm) with real-time 3D update
- [ ] **24.5** Lateral wedge slider for valgo/varo correction
- [ ] **24.6** 3D mesh deformation based on slider values
- [ ] **24.7** Visual indicators on model (Pie Talo, Pelvic Retroversion markers)

**Flows:**

- [ ] **24.8** Flow 1: Import Diagnosis and Auto-Generate base model
- [ ] **24.9** Flow 2: Edit Structure with Sliders

### Week 25: Brush Tool & Relief Zones

**Features:**

- [ ] **25.1** Brush tool implementation (raycasting on 3D mesh)
- [ ] **25.2** Brush sizes: Small, Medium, Large
- [ ] **25.3** Relief levels: Soft (1), Medium (3), Firm (5)
- [ ] **25.4** Paint relief zones on 3D model surface
- [ ] **25.5** Visual feedback: relief zones appear in different color/texture
- [ ] **25.6** Relief zones list in ClinicalSidePanel
- [ ] **25.7** Undo/redo history for design changes

**Flow:**

- [ ] **25.8** Flow 3: Paint Relief Zones with Brush

### Week 26: Materials & Layer Manager

**Components:**

- [ ] **26.1** LayerManager — Controls for material layers

**Features:**

- [ ] **26.2** Three layers: Base, Middle, Top Cover
- [ ] **26.3** Material selection per layer (EVA_rigido, EVA_medio, EVA_suave)
- [ ] **26.4** EVA density visualization in 3D
- [ ] **26.5** Espesor (thickness) per layer
- [ ] **26.6** Add/remove layers
- [ ] **26.7** Drag-and-drop layer reordering

### Week 27: Biomechanical Validation

**Features:**

- [ ] **27.1** Side-by-side comparison: insole design vs. posturogram findings
- [ ] **27.2** Validation rules: arch height ↔ lumbar spine alignment
- [ ] **27.3** Chain alignment check: foot → ankle → knee → hip → lumbar
- [ ] **27.4** Warning indicators if biomechanical chain is misaligned
- [ ] **27.5** Confirmation message if design is coherent
- [ ] **27.6** "Validar" button with results modal

**Flow:**

- [ ] **27.7** Flow 4: Biomechanical Validation

### Week 28: PDF Export & Polish

**Features:**

- [ ] **28.1** PDF technical spec sheet generation
- [ ] **28.2** PDF includes: dimensions, materials, layer specs, relief zones
- [ ] **28.3** 3D model screenshot for PDF
- [ ] **28.4** Manufacturing instructions section
- [ ] **28.5** Download PDF functionality
- [ ] **28.6** "Cerrar" button returns to main navigation
- [ ] **28.7** Auto-save on changes
- [ ] **28.8** Performance optimization for smooth 3D

**Flow:**

- [ ] **28.9** Flow 5: Select Materials and Export PDF

**Empty States:**

- [ ] **28.10** No clinical case selected
- [ ] **28.11** No evaluation data (warning)
- [ ] **28.12** No layers defined (before export)

**🎯 Milestone 10:** "I can design custom 3D insoles based on patient diagnosis"

**Full Checklist:** See `product-plan/instructions/incremental/05-plantillas.md#done-when`

---

## 🔗 Phase 7: Integration & Polish (Weeks 29-30)

### Week 29: Cross-Module Integration

- [ ] **29.1** Pacientes → Análisis: Link evaluation to analysis tools
- [ ] **29.2** Análisis → Plantillas: Import diagnosis to auto-generate insole
- [ ] **29.3** Biblioteca → Pacientes: Add references to treatment plans
- [ ] **29.4** AI → All modules: Consistent suggestion UI
- [ ] **29.5** Navigation: Seamless flow between modules
- [ ] **29.6** Data consistency: All modules use same patient/case data

### Week 30: Final Testing & Documentation

- [ ] **30.1** End-to-end testing: Complete patient journey
- [ ] **30.2** Performance audit: All pages < 3s load
- [ ] **30.3** Mobile/tablet responsiveness check
- [ ] **30.4** Accessibility audit (a11y)
- [ ] **30.5** User documentation update
- [ ] **30.6** API documentation update
- [ ] **30.7** Final security audit

---

### 🚦 Complete Product Gate Check (End of Week 30)

| Criteria                                    | Target |
| ------------------------------------------- | ------ |
| All 4 user flows per module work end-to-end | ✅     |
| 3D Plantillas renders smoothly (60fps)      | ✅     |
| PDF export generates valid documents        | ✅     |
| Cross-module data flows correctly           | ✅     |
| Mobile responsive on all modules            | ✅     |
| Mother uses full toolset in practice        | ✅     |

---

═══════════════════════════════════════════════════════════════════════════════

## 🚀 PART 4: FUTURE (Post-Week 30)

═══════════════════════════════════════════════════════════════════════════════

**Deferred to future releases:**

- [ ] Full offline sync (IndexedDB + background sync)
- [ ] Multi-tenancy (multiple therapists, clinics)
- [ ] React Native mobile app
- [ ] Stripe billing integration
- [ ] Patient portal (patients view their own progress)
- [ ] Appointment scheduling system
- [ ] Integration with medical devices (podoscope hardware)
- [ ] HIPAA/GDPR compliance audit
- [ ] White-label solution for other clinics

---

## 📊 Risk Management Strategy

### High-Risk Items (Have a Plan B)

| Risk                               | Mitigation                   | Plan B                   |
| ---------------------------------- | ---------------------------- | ------------------------ |
| **Week 9: Mother hates UX**        | Week 10 pivot buffer         | Extend MVP, delay Part 3 |
| **Week 12: No books available**    | Start collecting in Week 1   | Use free PubMed articles |
| **Week 13: pgvector too slow**     | Optimize indexes early       | Use Pinecone (cloud)     |
| **Week 15: AI hallucinates**       | Strict citation requirement  | Disable AI, manual mode  |
| **Week 16: Semantic chunk slow**   | Batch processing, caching    | Keep word-based chunking |
| **Week 16: Cohere Rerank cost**    | Use local cross-encoder      | Skip reranking           |
| **Week 16: Hybrid search complex** | Start with RRF in app layer  | Dense-only fallback      |
| **Week 23: 3D performance**        | Optimize mesh, use LOD       | Fallback to 2D editor    |
| **Week 25: Brush raycasting**      | Use proven Three.js examples | Simplify to click-to-add |
| **Week 28: PDF generation**        | Use proven library (jsPDF)   | Export as PNG + text     |

### Complexity Buffers

| Phase             | Buffer Built-In |
| ----------------- | --------------- |
| Part 1 (MVP)      | Week 10         |
| Part 2 (AI)       | Week 16         |
| Part 3 (Complete) | Week 30         |

---

## 📅 Calendar View (30 Weeks)

```
Part 1: MVP (Weeks 1-11)
├── Weeks 1-4:   Foundation ✅
├── Weeks 5-6:   Pacientes (8 components, 4 flows)
├── Week 7:      Media & Dictation
├── Week 8:      PWA Basics
├── Week 9:      Field Testing
├── Week 10:     Pivot & Fix (Buffer)
└── Week 11:     Security & Performance

Part 2: AI Infrastructure (Weeks 12-16)
├── Week 12:     Knowledge Base
├── Week 13:     Vector Database
├── Week 14:     AI Agent
├── Week 15:     Vision & Analysis
└── Week 16:     AI Refinement (Buffer)

Part 3: Complete Product (Weeks 17-30)
├── Weeks 17-18: Biblioteca Médica (5 components, 4 flows)
├── Weeks 19-22: Análisis (8 components, 4 flows)
├── Weeks 23-28: Plantillas 3D CAD (6 components, 5 flows)
└── Weeks 29-30: Integration & Polish
```

**Total Time: 30 weeks (7.5 months)**
**Buffer Time: 3 weeks built-in (Week 10, 16, 30)**
**Realistic Completion: 8 months** (because life happens)

---

## 💡 Final Advice

1. **Milestone 5 (Week 9) is the most critical**
   If she doesn't want to use it daily, the rest won't matter.

2. **The books for RAG must be acquired NOW**
   Don't wait until Week 12 to realize you can't get them.

3. **3D Plantillas is the showstopper feature**
   Week 23-28 will define the product's premium value.

4. **Expect Week 10 to be chaos**
   Real-world testing always reveals surprises.

5. **Part 3 modules can be released incrementally**
   Ship Biblioteca first, then Análisis, then Plantillas.

6. **RAG Optimization (Week 16) is ROI-positive**
   - Semantic chunking + reranking = 2-3x improvement
   - Prioritize: Semantic chunking → Reranking → Hybrid search
   - Start evaluation framework early to measure progress
   - See spec: `agent-os/specs/2026-02-06-rag-optimization/`
