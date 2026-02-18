# Specification: Biblioteca Search Hybrid Results

## Goal

Make Biblioteca searches useful for simple terms by always showing evidence-backed answers (Spanish-first) alongside curated protocols, and enable adding a protocol to a patient treatment plan.

## User Stories

- As a therapist, I want to search simple terms (e.g. "huesos") and get an immediate Spanish answer with citations so that I can understand and act during a consultation.
- As a therapist, I want to see related curated protocols and add one to the patient plan so that I can standardize treatment techniques across sessions.
- As an admin, I want to manage the curated protocol library out-of-band (MVP) so that the content stays trustworthy without building full CRUD UI.

## Specific Requirements

**Hybrid search results (Answers + Protocols)**

- Biblioteca search results must render two sections from the same query response: `Answers` (from `ragResults`) and `Protocols` (from DB).
- The default view shows both sections; filters may be added later (Answers only / Protocols only) but must not block MVP.
- The UI must clearly label `AI-assisted` vs `Curated protocol` to reduce clinical confusion.

**Answers section (ragResults rendering)**

- For any query where the knowledge base returns results, show 1-3 top `ragResults` as short snippets.
- Each snippet must show citation/source metadata when available (title/source, and a way to open/inspect details).
- Spanish-first display; if the source is English, provide an "Original" toggle per snippet when possible.
- If `ragResults` is empty, show a helpful message and suggestions (not a blank panel).

**Protocols section (curated protocol results)**

- Continue showing protocol cards (title, definition, tags) for matching protocols.
- If `protocols.length === 0`, the Protocols section must show "No curated protocols match" without blocking the Answers section.
- Selecting a protocol opens its detail view/modal with steps, rationale, tags, and references.

**Add protocol to patient plan (UI wiring)**

- Provide an "Add to plan" CTA from protocol detail and/or protocol card actions.
- The CTA must call `POST /library/treatment-plans/:planId/protocols` with `{ protocolId, notes? }`.
- If Biblioteca is opened without a plan context, the UI must either:
  - hide/disable "Add to plan" and prompt user to open Biblioteca from a patient case, or
  - prompt the user to select a patient case/treatment plan before adding.

**Patient plan shows attached protocols**

- The clinical case view must display which protocols are attached to the case treatment plan.
- The plan view should show protocol title + tags and optional notes captured when adding.
- Plan display must not require creating sessions; it is part of the case treatment plan overview.

**Search empty state and suggestions**

- Searching simple terms (e.g. "huesos") must not result in an empty experience if evidence exists.
- When no protocols match, provide suggested refinements (synonyms/categories) alongside Answers.
- Keep protocol DB matching simple in MVP; synonym expansion for protocol matching can be incremental.

**Language and translation rules (Bolivia, English books)**

- UI is Spanish-first.
- Evidence sources may be English; users must be able to view Spanish summary plus optionally the original English.
- Bibliography/reference language toggles must continue working and be consistent with Answers behavior.

**Roles and access (MVP)**

- Therapist: can search, view answers, view protocols, and add protocols to their patient plans.
- Admin: manages protocol content out-of-band for MVP; in-app protocol CRUD is out of scope.

**Data integrity for future-proofing**

- When a protocol is actually used in a session, the session should record a snapshot of performed steps (so future protocol edits do not rewrite historical care).

## Visual Design

**`planning/visuals/flow-diagram.md`**

- Show both sections (Answers + Protocols) on search results
- Make the "ragResults not rendered" current gap explicit
- Include "Add protocol to patient plan" as a first-class user action

## Existing Code to Leverage

**Biblioteca layout and protocol cards**

- `apps/client/src/components/library/LibraryDashboard.tsx` renders the main layout and protocol list
- `apps/client/src/components/library/ProtocolList.tsx` provides protocol cards + empty state to extend

**Bibliography and language toggle pattern**

- `apps/client/src/components/library/BibliographyPanel.tsx` already supports ES/EN toggling for references

**Search response shape and knowledge-base integration**

- `apps/server/src/modules/library/library.service.ts` returns `{ protocols, ragResults }` via `KnowledgeBaseService.findSimilar()`
- `apps/server/src/modules/library/library.controller.ts` exposes `GET /library/protocols` for search

**Add-to-plan backend + client hook (currently not wired to UI)**

- `apps/server/src/modules/library/library.controller.ts` exposes `POST /library/treatment-plans/:planId/protocols`
- `apps/client/src/hooks/use-library.ts` provides `useAddProtocolToPlan()`

**Patient case and treatment plan foundation**

- `apps/server/prisma/schema.prisma` defines `TreatmentPlan`, `TreatmentPlanProtocol`, and `TreatmentSession`

## Out of Scope

- Full protocol CRUD UI for therapists
- Multi-role editorial workflow (draft/review/publish) for protocols in MVP
- Multi-session program/pathway builder (care pathway templates) in this spec
- Offline support for Biblioteca search
- Broad medical ontology/synonym engine beyond minimal suggestions
