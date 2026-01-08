# 🗺️ Optimized Roadmap (14-16 Weeks)

Estimated Total Time: 12-16 Weeks (3-4 months) for full AI version.
Methodology: Agile Development (1-week Sprints).

---

## 🏁 Phase 0: Foundations & Infrastructure (Weeks 1-4)

**Goal:** Solid foundation, DevOps, and critical infrastructure. No business logic yet.

### Week 1: Infrastructure

- [x] **1.1 Docker Infrastructure:** PostgreSQL (w/ pgvector), MinIO, Redis.
- [x] **1.2 Prisma Schema v1:** User, Patient, Session tables.
- [x] **1.3 NestJS Structure:** Create module shells (auth, patients, sessions, media).
- [x] **1.4 Frontend Setup:** React + Shadcn/UI basic layout.

### Week 2: Auth & Storage

- [x] **2.1 JWT Authentication:** Register/Login/Logout flows.
- [ ] **2.2 MinIO Integration:** Upload/Download service.
- [ ] **2.3 Frontend Auth:** Protected routes & context.
- [ ] **2.4 Basic Error Handling:** Global filters.

### Week 3: DevOps

- [ ] **3.1 Database Backups:** Automated backup scripts.
- [ ] **3.2 Environment:** Secure .env management (Single source of truth).
- [ ] **3.3 CI/CD:** Basic GitHub Actions (lint/test).
- [ ] **3.4 Deployment:** Deploy to Ubuntu home lab.

### Week 4: Testing Foundation

- [ ] **4.1 Unit Tests:** Critical backend services.
- [ ] **4.2 E2E Tests:** Auth flow verification.
- [ ] **4.3 API Docs:** Swagger setup & refinement.
- [ ] **4.4 Onboarding:** Developer guide & setup scripts.

**🎯 Milestone 1:** "I can login and see an empty dashboard"

---

## 🏗️ Phase 1: MVP (Weeks 5-8) - REORDERED

### Week 5: Patients (Core Data Model)

- [ ] **5.1** Backend: Patients CRUD (routes, validation, Prisma)
- [ ] **5.2** Frontend: Patient list with search
- [ ] **5.3** Frontend: Create/Edit patient form
- [ ] **5.4** Frontend: Patient detail view (empty history for now)
- [ ] **5.5** Tests: Patient CRUD unit tests

**🎯 Milestone 2:** "I can create and search patients"

### Week 6: Clinical Sessions (The Workflow)

- [ ] **6.1** Backend: Session schema (Draft/Finalized states)
- [ ] **6.2** Backend: Session CRUD endpoints
- [ ] **6.3** Frontend: "New Session" wizard (3 steps)
- [ ] **6.4** Frontend: Session list on patient detail
- [ ] **6.5** UX: Large buttons (>44px) for tablet

**🎯 Milestone 3:** "I can start a session and add text notes"

### Week 7: Media & Dictation

- [ ] **7.1** Backend: Media upload endpoint (validation, S3)
- [ ] **7.2** Frontend: Camera capture component
- [ ] **7.3** Frontend: Photo gallery per session
- [ ] **7.4** Backend: Whisper integration (Groq API)
- [ ] **7.5** Frontend: Voice recorder button + transcription
- [ ] **7.6** Test: Dictate medical terms, verify accuracy

**🎯 Milestone 4:** "I can take photos and dictate notes"

### Week 8: PWA Basics (Offline Skeleton)

- [ ] **8.1** Service Worker: Cache static assets
- [ ] **8.2** Offline indicator (connection status)
- [ ] **8.3** PWA manifest (install to home screen)
- [ ] **8.4** Test: Works without internet (static pages only)

**Note:** Full offline editing (IndexedDB sync) deferred to Phase 2.5

**🎯 Milestone 5:** "App loads offline, shows cached data"

---

## 🧪 Phase 2: Validation & Hardening (Weeks 9-11)

### Week 9: Field Testing ("The Truth")

- [ ] **9.1** Install on mother's iPad
- [ ] **9.2** Observe 3-5 real consultations
- [ ] **9.3** Document friction points (what breaks her flow?)
- [ ] **9.4** Collect performance data (slow queries?)
- [ ] **9.5** User feedback interview

**🎯 Milestone 6:** "Mother used it with a real patient without asking for help"

### Week 10: Pivot & Fix Week 🔧

**Critical Buffer Week - Expect the Unexpected**

- [ ] **10.1** Prioritize top 3 UX blockers from Week 9
- [ ] **10.2** Fix critical bugs (data loss, crashes)
- [ ] **10.3** Refine UI based on real usage (button sizes, wording)
- [ ] **10.4** Performance: Only fix proven bottlenecks
- [ ] **10.5** Decision: AI-ready or need more MVP work?

**Possible outcomes:**

- ✅ MVP solid → Proceed to Week 11
- ⚠️ Major issues → Extend MVP work, push AI to later

### Week 11: Security & Performance (Post-Validation)

- [ ] **11.1** Input sanitization (based on real attack vectors)
- [ ] **11.2** File upload security (malware scan if needed)
- [ ] **11.3** Rate limiting (if API abuse detected)
- [ ] **11.4** Database indexing (based on slow query logs)
- [ ] **11.5** Image compression (if storage is an issue)
- [ ] **11.6** Audit logging for sensitive operations

**Why now?** You know what needs securing based on real usage.

**🎯 Milestone 7:** "App is production-ready (no AI yet)"

---

## 🧠 Phase 3: The AI Brain (Weeks 12-15)

**Pre-requisite Check:**

- [ ] Do you have 3-5 reference books (PDFs) ready?
- [ ] Are they legally yours to process?
- [ ] Is the MVP stable enough to build on?

### Week 12: Knowledge Base Preparation

- [ ] **12.1** Research: PDF extraction tools (pdf-parse vs. Unstructured.io)
- [ ] **12.2** Chunking strategy design (500 words, 50-word overlap)
- [ ] **12.3** Metadata schema (book, page, chapter, section)
- [ ] **12.4** Manual test: Extract 1 book, verify quality
- [ ] **12.5** Write ingestion script with error handling

### Week 13: Vector Database (RAG Foundation)

- [ ] **13.1** Enable pgvector on Postgres
- [ ] **13.2** Create embeddings table schema
- [ ] **13.3** Generate embeddings (OpenAI text-embedding-3-small)
- [ ] **13.4** Bulk insert vectors into database
- [ ] **13.5** Test similarity search queries
- [ ] **13.6** Optimize: Vector index for <200ms queries

### Week 14: The AI Agent (Backend)

- [ ] **14.1** NestJS: AIAnalysis module
- [ ] **14.2** RAG logic: Semantic search implementation
- [ ] **14.3** LLM integration: OpenAI GPT-4 or Gemini
- [ ] **14.4** System Prompt engineering (Chain of Thought)
- [ ] **14.5** Anonymization: Strip PII before sending to LLM
- [ ] **14.6** Test: Query "fascitis plantar" → returns relevant book passages

### Week 15: Vision & Full Analysis

- [ ] **15.1** Gemini Vision: Image description API
- [ ] **15.2** Orchestration: Combine Voice + Vision + RAG + LLM
- [ ] **15.3** "Analyze Case" endpoint (orchestrates all services)
- [ ] **15.4** Frontend: Suggestions UI (cards, citations)
- [ ] **15.5** Feedback loop: Like/Dislike buttons
- [ ] **15.6** Test: Complete flow with real patient data

**🎯 Milestone 8:** "The AI provides a cited treatment suggestion"

---

## 🔄 Phase 3.5: AI Refinement (Week 16) - OPTIONAL

**If AI output quality is poor:**

- [ ] **16.1** Prompt iteration (based on real output quality)
- [ ] **16.2** Add more books to knowledge base
- [ ] **16.3** Improve chunking strategy
- [ ] **16.4** Vision prompt refinement
- [ ] **16.5** Explainability: Show which book passages influenced suggestion

---

## 📊 Risk Management Strategy

### High-Risk Items (Have a Plan B)

| Risk                            | Mitigation                  | Plan B                       |
| ------------------------------- | --------------------------- | ---------------------------- |
| **Week 9: Mother hates the UX** | Week 10 pivot buffer        | Extend MVP, delay AI         |
| **Week 12: No books available** | Start collecting in Week 1  | Use free PubMed articles     |
| **Week 13: pgvector too slow**  | Optimize indexes early      | Use Pinecone (cloud)         |
| **Week 15: AI hallucinates**    | Strict citation requirement | Disable AI, manual mode only |
| **Groq API down**               | Monitor uptime early        | Fallback to OpenAI Whisper   |

### Low-Risk Items (Can Defer)

- Full offline sync (IndexedDB) → Phase 4
- Multi-tenancy → Phase 4
- React Native app → Phase 4
- Stripe billing → Phase 4

---

## 🎯 Success Criteria (Gate Checks)

### After Phase 1 (Week 8):

- ✅ Mother can complete a full consultation without your help
- ✅ No data loss in 10 test sessions
- ✅ Page load time < 3 seconds on iPad

### After Phase 2 (Week 11):

- ✅ Used for 20+ real patients
- ✅ Zero security vulnerabilities in audit
- ✅ Backup/restore tested and works

### After Phase 3 (Week 15):

- ✅ AI suggestions are clinically relevant 70%+ of the time
- ✅ Citations trace back to actual book content
- ✅ Mother trusts the AI enough to use it regularly

---

## 📅 Calendar View (16 Weeks)

```
Weeks 1-4:   Foundation (DevOps, Auth, Infrastructure)
Weeks 5-8:   MVP Features (Patients, Sessions, Media)
Weeks 9-11:  Validation & Hardening (Real-world testing)
Weeks 12-15: AI Integration (RAG, Vision, Analysis)
Week 16:     Buffer / AI Refinement
```

**Total Time: 16 weeks (4 months)**  
**Buffer Time: 2 weeks built-in (Week 10, Week 16)**  
**Realistic Completion: 4.5-5 months** (because life happens)

---

## 🚨 When to Hit Pause

**Stop and reassess if:**

- Week 9 reveals the core UX is fundamentally broken
- Week 13 shows pgvector performance is unacceptable
- Week 15 shows AI quality is worse than manual work
- You're consistently 2+ weeks behind schedule

**Don't be afraid to:**

- Skip Phase 3 entirely if MVP is enough
- Ship MVP first, add AI in 6 months after real usage data
- Pivot from Gemini to GPT-4 if vision quality is poor

---

## 💡 Final Advice

1. **Milestone 6 (Week 9) is the most critical**  
   If she doesn't want to use it daily, AI won't save you.

2. **Don't gold-plate Phase 1**  
   Ugly but functional beats pretty but broken.

3. **The books for RAG must be acquired NOW**  
   Don't wait until Week 12 to realize you can't get them.

4. **Expect Week 10 to be chaos**  
   Real-world testing always reveals surprises.

5. **Phase 3 is optional**  
   A solid MVP without AI is better than a broken AI system.
