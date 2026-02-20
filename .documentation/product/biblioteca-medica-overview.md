# Biblioteca Médica (Medical Library)

## Smart Clinical Research Assistant

---

## Current Mode (Books-Only)

**Status (2026-02-18):** Biblioteca is currently a **books-only semantic search** experience.

- The UI shows **relevant book passages** (RAG results) grouped by book.
- The Protocol/Categories/Bibliography panels are **quarantined (hidden in the UI)** to avoid manual maintenance risk.
- The backend still contains protocol endpoints/models so the feature can be re-enabled later, but it is not part of the user workflow right now.

## Overview

The Biblioteca Médica is a digital clinical research assistant that helps physiotherapists find evidence-based treatment techniques quickly and reliably. Think of it as having a medical library expert available at your fingertips during patient consultations — one that understands your questions in plain language and instantly connects you with proven protocols and scientific literature.

---

## Why This Matters

### The Challenge

Every day, physiotherapists face these questions:

- _"What's the best technique for this 75-year-old patient with chronic lumbar pain?"_
- _"Is there a specific McKenzie protocol for hyperkyphosis?"_
- _"I remember a study about stretching for plantar fasciitis — where was it?"_

Traditional approaches have limitations:

| Approach           | Problem                                                        |
| ------------------ | -------------------------------------------------------------- |
| **Memory**         | Fallible; techniques get mixed up or forgotten                 |
| **Google**         | Overwhelming; information quality varies, takes time to filter |
| **Physical Books** | Time-consuming to flip through pages; not portable             |
| **Personal Notes** | Scattered across different places; hard to search              |

### Our Solution

Biblioteca Médica solves these problems by:

✅ **Natural Language Search** — Ask questions the way you think
✅ **Instant Results** — Relevant book passages appear in seconds
✅ **Evidence-First** — Every result is backed by a source book and page number
✅ **Cross-Language** — Reads English research, explains in Spanish
✅ **Visual Aids** — Anatomy diagrams and step-by-step procedures

---

## What is a Protocol?

A **protocol** is a complete treatment technique with everything you need to apply it correctly.

**Note:** the protocol catalog is currently **disabled in the UI** (books-only mode). This section describes a possible future/optional overlay.

### Example: "Posición de la Esfinge"

Here's what you see when you select this protocol:

#### **Definition**

> "Ejercicio de extensión pasiva en decúbito prono."

#### **Why Use It? (Justification)**

> "Indicado para rectificación lumbar y hernias discales posteriores. Busca centralizar el dolor y restaurar la lordosis fisiológica."

#### **Step-by-Step Procedure**

1. Paciente en decúbito prono.
2. Apoyar los antebrazos en el suelo manteniendo los codos debajo de los hombros.
3. Relajar la musculatura glútea y lumbar.
4. Mantener la posición durante 15 segundos a 3 minutos según tolerancia.

#### **Tags for Quick Reference**

`Lumbar` · `Hernia` · `Extensión` · `McKenzie`

#### **Scientific References**

- McKenzie, R.A. (1981). _The Lumbar Spine: Mechanical Diagnosis and Therapy_. Spinal Publications.

---

## How It Works

### User Journey

#### 1. **Enter Your Question**

You're with a patient. You need to find the right technique. You type:

> _"88-year-old patient with hyperkyphosis and cervical pain"_

#### 2. **System Searches Your Ingested Books**

The Biblioteca Médica searches your ingested library using hybrid retrieval (dense + full-text) and returns the most relevant passages with citations.

#### 3. **Results Appear**

You see:

```
Encontramos N pasajes relevantes en M libros.
```

The results show:

- **Book cards** (title/author)
- **Top passages** per book (with page number)
- Quick scan snippets (expand/collapse)

#### 4. **Explore and Apply**

Click **Abrir libro** to open the full source Markdown at the cited page.

The UI keeps the search results visible while the book opens in a side panel so you can compare multiple sources without re-running the search.

#### 5. **Use It as a Research Tool**

The goal is to help the clinician quickly decide which book to consult and where to start reading.

Notes:

- Search results are cached client-side for a few hours to avoid repeated retrieval requests when navigating to/from the book viewer.
- External links inside the book content open in a new tab.

---

## Browsing by Categories

Sometimes you don't have a specific question — you want to explore what's available.

**Note:** category browsing is currently **not exposed in the UI** (books-only mode). Categories remain in the database as an optional future overlay.

### Available Categories

| Category                      | Description                                   | Example Protocols               |
| ----------------------------- | --------------------------------------------- | ------------------------------- |
| **Osteologia y Artrologia**   | Bone structure and joints                     | Pelvis anatomy, spine alignment |
| **Miologia**                  | Muscles and muscle chains                     | Back muscles, hip flexors       |
| **Test de Elasticidad**       | Flexibility evaluation tests                  | Thomas test, hamstring stretch  |
| **Test Funcionales**          | Mobility and function tests                   | Range of motion assessments     |
| **Protocolos de Tratamiento** | Intervention techniques (McKenzie, RPG, etc.) | Sphinx position, frog posture   |

### How Categories Help

- **Discovery** — Find techniques you didn't know existed
- **Learning** — Systematically explore a clinical area
- **Teaching** — Show students or junior therapists categorized resources
- **Quality Control** — Ensure comprehensive treatment planning

---

## Search Capabilities

### What You Can Search For

✅ **Symptoms and conditions**

- "Lumbar pain"
- "Plantar fasciitis"
- "Hip flexor tightness"

✅ **Patient scenarios**

- "88-year-old patient with hyperkyphosis"
- "Post-surgical shoulder rehabilitation"

✅ **Technique names**

- "McKenzie extension"
- "RPG posture"
- "Static stretching"

✅ **Anatomical terms**

- "Psoas muscle"
- "Hamstring flexibility"
- "Cervical spine"

✅ **Scientific references**

- "McKenzie 1981"
- "Kendall muscle testing"

### How Search Works Behind the Scenes

When you type a query, Biblioteca searches only the ingested knowledge base:

1. **Dense retrieval (embeddings)** — semantic similarity over chunk vectors.
2. **Sparse retrieval (BM25)** — keyword search over chunk text.
3. **Fusion + reranking** — results are merged (RRF) and reranked (Cohere) when configured.

The output is a set of cited passages grouped by book.

Idea future dev
1. **Direct Database Search**
   - Looks for exact matches in protocol titles
   - Searches definitions and descriptions
   - Matches tags
   - Case-insensitive (doesn't matter if you type upper or lower case)

2. **AI-Powered Semantic Search**
   - Understands the _meaning_ of your question
   - Translates Spanish symptoms to English medical terminology
   - Searches across all literature (not just our database)
   - Ranks results by clinical relevance
### Example Search Flow

**Your Query:**

> "fascitis plantar"

**What Happens:**

1. System understands: "plantar fasciitis" (English)
2. Searches protocols in database
3. Searches medical literature using AI
4. Returns combined results

**You See:**

- Top passages per book (with page number)
- A focused snippet (match) plus expandable context
- "Abrir libro" to open the full Markdown at the cited page

---

## Language Bridge

### The Problem

Most high-quality medical literature is published in English. Spanish-speaking physiotherapists face a language barrier when accessing current research.

### Our Solution

The Biblioteca Médica automatically:

1. **Reads English literature**
2. **Summarizes in Spanish**
3. **Shows the original source**
4. **Lets you toggle between languages**

### Example

**Spanish Summary:**

> "Método de diagnóstico y terapia mecánica para el dolor lumbar, enfatizando la centralización del dolor mediante movimientos repetidos."

**Toggle Switch → English Original:**

> "The centralization phenomenon describes movement of pain from a distal to a more central location..."

### Why This Matters

- **No Translation Barrier** — Access international research without needing to be bilingual
- **Scientific Accuracy** — Original text preserved for verification
- **Clinical Confidence** — Make decisions based on primary sources

---

## Evidence Verification

Every returned passage includes its source metadata (book title/author + page number). You never have to wonder, _"Where did this come from?"_

### Bibliography Panel

When you view a protocol, you see:

**Referencias Bibliográficas:**

1. **Latarjet, M. & Ruiz Liard, A. (2019).** _Anatomía Humana_. Editorial Médica Panamericana.
   - Summary in Spanish available

2. **McKenzie, R.A. (1981).** _The Lumbar Spine: Mechanical Diagnosis and Therapy_. Spinal Publications.
   - ✅ Original text in English
   - ✅ Spanish summary available

3. **Kendall, F.P. (2005).** _Muscles: Testing and Function_. Lippincott Williams & Wilkins.

### Click to Explore

- Click any reference to see full details
- Links to original sources when available
- Author, year, title, and source clearly displayed

---

## Security and Access

### Who Can Use It?

**✅ All authenticated physiotherapists** with an account can access the Biblioteca Médica for book search.

**Why?**

- Every therapist needs access to evidence-based techniques
- No premium tiers — complete library for everyone
- Encourages shared knowledge and best practices

### What's Restricted?

This feature is a research tool: it does not expose patient data, and it only returns content from the ingested book corpus.

### Protocol Curation Flow (Quarantined)

The protocol curation UI is currently hidden to avoid maintenance burden until we have a stable references workflow.

### Data Privacy

- Patient data is never shared
- Treatment plans are private to the therapist
- Biblioteca Médica contains only medical literature content (no personal health information)

---

## Real-World Scenarios

### Scenario 1: New Graduate Physiotherapist

**Challenge:** You've just graduated. A patient presents with a condition you haven't treated before.

**Without Biblioteca Médica:**

- Search Google → 10,000+ results
- Try to filter reliable sources
- Cross-reference textbooks
- Takes 30+ minutes

**With Biblioteca Médica:**

- Type patient's symptoms
- See relevant book passages instantly
- Jump to a specific book + page number
- Verify by reading the source context
- **Total time: 2 minutes**

**Outcome:** Confidence in treatment, faster patient care.

---

### Scenario 2: Experienced Therapist Learning New Technique

**Challenge:** A colleague mentions "RPG posture" — you've never heard of it.

**Without Biblioteca Médica:**

- Remember the name later (maybe)
- Try to find information online
- Uncertain if sources are reliable

**With Biblioteca Médica:**

- Type "RPG" during the conversation
- Immediately see relevant book passages
- Open the source markdown at the cited page

**Outcome:** Continuous learning, improved patient outcomes.

---

### Scenario 3: Treatment Planning Session

**Challenge:** You're creating a treatment plan for a complex patient. You need evidence for multiple interventions.

**Without Biblioteca Médica:**

- Gather multiple textbooks
- Search through academic databases
- Copy references manually
- Time-consuming, error-prone

**With Biblioteca Médica:**

- Search each condition separately
- Find relevant passages for each question
- Keep a short list of source books to consult
- **Total time: 10 minutes**

**Outcome:** Comprehensive, evidence-based treatment plan quickly created.

---

## Technical Details (for Curious Stakeholders)

### What Powers It?

| Component         | Technology                  | Purpose                                  |
| ----------------- | --------------------------- | ---------------------------------------- |
| **Database**      | PostgreSQL with Prisma      | Stores documents + embeddings for search |
| **Search Engine** | pgvector embeddings         | Semantic search in natural language      |
| **AI**            | Cohere Reranker v4-pro      | Intelligent result ranking               |
| **Translation**   | HyDE + Translation pipeline | English ↔ Spanish translation            |
| **Frontend**      | React + TypeScript          | User interface                           |
| **Backend**       | NestJS                      | API and business logic                   |

### Data Structure

Search results return book passages with citations:

```
- Book title / author
- Page number
- Passage text (context-rich chunk)
- Optional: section type + relevance scores
```

### Search Algorithm

1. **Keyword Matching** — Exact words in title, definition, tags
2. **Semantic Understanding** — AI understands meaning of your query
3. **Cross-Language** — Spanish query → English search
4. **Relevance Ranking** — Best clinical results first

---

## Future Enhancements

### What's Coming

| Feature                  | Description                                        | Value                  |
| ------------------------ | -------------------------------------------------- | ---------------------- |
| **AI Suggestions**       | System suggests protocols based on patient profile | Personalized treatment |
| **Video Demonstrations** | Embedded videos showing technique application      | Visual learning        |
| **User Ratings**         | Therapists rate protocol effectiveness             | Community validation   |
| **Case Studies**         | Real-world examples of protocol application        | Clinical context       |
| **Mobile App**           | Access Biblioteca Médica on tablet/phone           | Point-of-care access   |

### Feedback Welcome

We want to make the Biblioteca Médica the best clinical research assistant possible. Please share:

- ✅ What's working well?
- ✅ What's confusing or difficult?
- ✅ What protocols are missing?
- ✅ How can we improve the user experience?

---

## Summary

### Key Takeaways

1. **Instant Access** — Find evidence-based protocols in seconds, not hours
2. **Natural Language** — Ask questions the way you think
3. **Evidence-Based** — Every technique backed by scientific literature
4. **Cross-Language** — Read English research in Spanish
5. **Clinical Confidence** — Make decisions based on reliable sources

### Business Impact

| Metric                  | Expected Outcome                           |
| ----------------------- | ------------------------------------------ |
| **Time Saved**          | 30+ minutes/day in literature research     |
| **Treatment Quality**   | Evidence-based protocols for every patient |
| **Learning Curve**      | Faster onboarding for new therapists       |
| **Decision Confidence** | Scientifically justified treatment plans   |

| **Patient Trust** - Transparent, evidence-based care

---

## Questions?

If you have questions about the Biblioteca Médica:

**For Implementation Details:**

- Review `.documentation/technical/knowledge-base-rag.md`
- Review `apps/server/src/modules/library/`

**For Product Questions:**

- Review `product-plan/sections/biblioteca-medica/`
- Review `apps/client/src/components/library/`

**For Test Scenarios:**

- Review `product-plan/sections/biblioteca-medica/tests.md`

---

**Last Updated:** 2026-02-18
**Document Version:** 1.0
**Audience:** Non-technical stakeholders (product owners, investors, clinical advisors)
