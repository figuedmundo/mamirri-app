# Spec Requirements: Biblioteca Search Hybrid Results

## Initial Description

From `agent-os/specs/2026-02-18-biblioteca-search-hybrid-results/planning/initialization.md`:

"please draw a flow diagram and lets use @agent-os/commands/shape-spec/shape-spec.md to address the issues, if I search for a simple term I should see answers , and I should be able to handle the protocols, to be honest I still dont undertand why do we need protocols to search in the library we have"

"because I was search a term \"huesos\" but I dont get nothing, what should I get, how I can control protocls ? just a simple search is not related with a protocol what should I see ?"

## Requirements Discussion

### First Round Questions

**Q1:** I assume the Biblioteca search results should always show two sections: `Answer (AI-assisted)` from `ragResults` + `Protocols (Curated)` from the protocol DB. Is that correct, or should we add more result types (e.g., diagrams/books/pages)?

**Answer:** User agreed with 1 and 2 answers (two sections + behavior for simple term search).

**Q2:** For a simple term like `huesos`, I assume you want: (a) 1–3 evidence snippets with citations, (b) “0 protocols” message if none match, (c) suggestions like “fractura / osteoporosis / osteología”. Confirm?

**Answer:** User agreed with 1 and 2 answers.

**Q3:** “Handle protocols”: I assume you mean an editorial workflow (Draft → Review → Published → Archived) + roles (Author/Reviewer/Admin). Who should be allowed to create/edit/publish?

**Answer:** User wants MVP simple: 2 roles only: therapist + admin. No full protocol CRUD UI for MVP.

**Q4:** Should users be able to filter results: `All | Answers only | Protocols only` (default All)?

**Answer:** Pending confirmation. Default recommendation: Yes, default `All`.

**Q5:** Protocol matching: today tags require exact match; do you want synonym/normalization so `huesos` can match “oseo/osteologia/fractura”, or should synonyms only affect the Answer section?

**Answer:** Pending confirmation. Default recommendation: normalization + synonyms for both Answers and Protocol discovery.

**Q6:** When a protocol is Published, should the UI show trust metadata (Reviewed on/by, version), to clearly separate “curated protocol” vs “AI-assisted answer”?

**Answer:** Pending confirmation. Default recommendation: show minimal trust metadata (version + “Curated”) without multi-role workflow in MVP.

**Q7:** What should be out of scope for this improvement (e.g., full protocol CRUD UI, adding new content types, multilingual UI, offline mode)?

**Answer:** User wants future-proof but MVP simple. Confirmed: translation is needed; protocol roles should stay minimal (therapist + admin). Full protocol CRUD UI is not MVP.

### Existing Code to Reference

**Similar Features Identified:**

- Evidence/citations UI patterns: `apps/client/src/components/patients/analysis/CitationsSection.tsx`, `apps/client/src/components/patients/analysis/AnalysisResultsPanel.tsx`
- Library bibliography panel: `apps/client/src/components/library/BibliographyPanel.tsx`
- Library search + API surfaces: `apps/client/src/pages/Biblioteca.tsx`, `apps/client/src/hooks/use-library.ts`, `apps/client/src/api/library.ts`
- Backend library module: `apps/server/src/modules/library/`
- Treatment plan baseline model: `apps/server/prisma/schema.prisma` (`TreatmentPlan`, `TreatmentPlanProtocol`, `TreatmentSession`)

**Note (current gap to address):**

- The client has `useAddProtocolToPlan()` in `apps/client/src/hooks/use-library.ts:50`, but there is no UI call-site wiring (no components invoke the hook). This must be addressed as part of making protocols meaningful in the patient flow.

### Follow-up Questions

No follow-up questions recorded yet.

## Visual Assets

### Files Provided:

No visual files found.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- Hybrid search results: for any query (including simple terms like "huesos"), show:
  - `Answers` section (AI-assisted) sourced from `ragResults` with citations
  - `Protocols` section (curated) sourced from protocol DB (may be empty)
- No-results behavior:
  - If no protocols match, do not show a dead-end; show evidence answers + suggestions (synonyms/categories)
- Protocol meaning (domain semantics):
  - Protocol = reusable curated technique/intervention card with steps + rationale + references
  - TreatmentPlan = patient-specific plan (objectives + phases) for a clinical case
  - TreatmentSession = execution record (what happened in a session)
  - (Future) Program/CarePathwayTemplate = multi-session blueprint that can generate a patient plan
- Add-to-plan flow:
  - User can add a protocol to a patient TreatmentPlan from Biblioteca results
  - Patient view should show which protocols are attached to the plan
- Roles:
  - MVP roles only: therapist + admin
  - No in-app full protocol CRUD UI required for MVP (admin can manage protocol records out-of-band)
- Translation:
  - Spanish-first UX for Bolivia; evidence/books may be in English but must be summarized in Spanish with an "Original" toggle

### Reusability Opportunities

- Reuse citations UI patterns for `ragResults` rendering (citations + excerpt + source)
- Reuse existing bibliography panel behavior for references display

### Scope Boundaries

**In Scope:**

- Display `ragResults` in Biblioteca UI (answers + citations)
- Improve empty state for searches like "huesos" so users always see useful results when evidence exists
- Wire “Add protocol to plan” UI and ensure the patient plan can display attached protocols
- Spanish-first output for answers with optional English original toggles

**Out of Scope:**

- Full protocol CRUD UI for therapists
- Multi-role editorial workflow (draft/review/publish) in MVP
- Full multi-session program/pathway builder (future entity)

### Technical Considerations

- Data integrity / auditability:
  - Prefer snapshotting protocol steps into sessions when executed, so future protocol edits do not rewrite historical session records.
- Backend already returns `{ protocols, ragResults }` for search; frontend must render both.
- Protocol-to-plan relation exists (`TreatmentPlanProtocol`), but patient fetch/types must include it for UI to show plan protocols.
- AI research tooling:
  - If Exa MCP rate limits are hit during development/research, configure an Exa API key and use the MCP URL format documented in `.documentation/technical/exa-mcp-setup.md`.
