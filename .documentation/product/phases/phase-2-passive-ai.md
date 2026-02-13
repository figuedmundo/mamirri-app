# Phase 2: Passive Intelligence (MVP+)

**Duration:** 4-6 weeks  
**Status:** 🔴 Not Started  
**Goal:** AI assists with knowledge, doesn't make decisions

---

## 2.1 Knowledge Base (RAG Initial)

### Components

- Vector database (pgvector)
- Documents:
  - Physiotherapy textbooks
  - Personal notes
  - Scanned PDFs
  - Multilingual texts

### Function

- Semantic search
- Answers in Spanish
- Clinical context, not generic

**Critical Rule:** AI doesn't see patient data, only reference texts.

---

## 2.2 Theoretical Consultation Assistant

### Examples

- "What do authors say about lumbar pain and pronated gait?"
- "Relationship between knee valgus and plantar fasciitis?"

### Hard Limitations

- ❌ No treatment suggestions
- ❌ No patient mentions
- ❌ No diagnoses

---

## 2.3 Automatic Summaries

- Session summary
- Patient evolution (generated text)
- **Always editable by the professional**

---

## Success Criteria

**The system is ready when:**

1. ✅ Knowledge base contains 5+ key textbooks
2. ✅ Search returns relevant passages 80% of the time
3. ✅ Therapist uses search feature 3+ times per week
4. ✅ Zero hallucinations (all answers cite sources)

---

**Last Updated:** $(date +%Y-%m-%d)
