# Spec Requirements: Patient Flow Evaluation

## Initial Description

Roadmap task 9.11 — Week 9: Field Testing ("The Truth") → Issues raised

**Pacient flow evaluation** — Rethink the flow of how to start the evaluation of the patient, add the diagnosis. The current flow is not friendly for the doctor, she gets lost. Related to GitHub Issue #40 ("No es posible añadir diagnóstico antes de definir las fases del tratamiento"). Also reconsidering the 1:N evaluation model (Initial/Final) given that 80% of patients don't complete treatments.

## Requirements Discussion

### First Round Questions

**Q1:** The roadmap says this was raised during field testing. What specific friction points did the therapist encounter?
**Answer:** The doctor gets lost when trying to start the evaluation and add the diagnosis. The flow is not friendly. She does many treatments but doesn't want to have so many tests to fill. The product owner had to explain that the tests are not mandatory — "if I have to explain, it's bad and we can improve." Related to Issue #40: there's no way to add a diagnosis before the treatment phases are defined. The flow jumps directly to predefined phases without a diagnosis step.

**Q2:** Is "patient flow evaluation" about the end-to-end UX journey or a specific part?
**Answer:** It's about the evaluation/diagnosis portion of the flow specifically — how the doctor starts an evaluation, adds a diagnosis, and the relationship between diagnosis and treatment phases.

**Q3:** Currently creating a patient auto-creates an initial clinical case + evaluation + 5-phase treatment plan. Is this helpful or overwhelming?
**Answer:** The 5-phase auto-creation is problematic. The doctor doesn't know how many phases a treatment will need until she starts. Phases need to be defined manually by the therapist after diagnosis, not auto-generated.

**Q4:** The industry standard is SOAP notes rather than a structured multi-section form. Should we restructure around SOAP?
**Answer:** Yes, agree to follow SOAP (Subjective → Objective → Assessment → Plan).

**Q5:** On simplifying evaluations from 1:N (Initial/Final) to 1:1 — one evolving evaluation per case?
**Answer:** Yes, simplify to 1:1. One evaluation per case that evolves over time.

**Q6:** On the 5-phase auto-creation — should the therapist define phases manually after diagnosis?
**Answer:** Yes. The doctor doesn't know how many phases will be needed until she starts the treatment, so phases must be defined manually. The current auto-creation of 5 phases is wrong.

**Q7:** Of the 8 orthopedic tests, which does the doctor use regularly?
**Answer:** The doctor felt overwhelmed when trying to think about which tests she uses regularly. The suggestion is to improve the UX so she doesn't have to confront all 8 at once. Need a better approach than showing all tests upfront.

**Q8:** Does the doctor use the Barthel + Lawton ADL scales (15 fields)?
**Answer:** The doctor doesn't really use them. Maybe 1 in 100 patients. But they're on screen and make the doctor feel overwhelmed. Also, many patient cases aren't even related to these tests — for example, her last patient had a jaw problem. Occasionally (1 in 100) she might need them for insurance purposes.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: EvaluationForm — Path: `apps/client/src/components/patients/EvaluationForm.tsx`
- Feature: CaseDetailLayout — Path: `apps/client/src/components/patients/CaseDetailLayout.tsx`
- Feature: TreatmentTimeline — Path: `apps/client/src/components/patients/TreatmentTimeline.tsx`
- Feature: BodySilhouette — Path: `apps/client/src/components/patients/BodySilhouette.tsx`
- Feature: SessionForm — Path: `apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`
- Feature: ComparisonBoard — Path: `apps/client/src/components/patients/ComparisonBoard.tsx`
- Feature: Evaluation utilities — Path: `apps/client/src/lib/evaluation-utils.ts`
- Feature: Patient types — Path: `apps/client/src/types/patient.ts`
- Backend: Patients service (wizard flow) — Path: `apps/server/src/modules/patients/patients.service.ts`
- Backend: Clinical cases service — Path: `apps/server/src/modules/clinical-cases/clinical-cases.service.ts`
- Backend: Prisma schema — Path: `apps/server/prisma/schema.prisma`
- Related spec: Cronograma — Path: `agent-os/specs/2026-01-15-cronograma/`
- Related spec: Paciente Profile — Path: `agent-os/specs/2026-01-15-paciente-profile/`
- Related spec: Evaluation 1:N Migration — Path: `agent-os/specs/2026-01-16-evaluation-1n-migration/`
- Related GitHub Issue: #40 — "No es posible añadir diagnóstico antes de definir las fases del tratamiento"

### Follow-up Questions

**Follow-up 1:** On the 8 orthopedic tests — the doctor felt overwhelmed trying to pick which ones she uses. How should we improve the UX?
**Answer:** Need to suggest an improved approach. Research indicates: show no tests by default, let the doctor search/add only the tests relevant to the current patient's condition. A "pick the tests you need" pattern instead of "here are all 8, fill what you want."

**Follow-up 2:** On Barthel + Lawton — the doctor doesn't use them (1 in 100), and many cases aren't related (e.g., jaw problems). What about insurance?
**Answer:** Maybe 1 in 100 patients need it for insurance. These scales should be completely hidden by default and only available on demand — not part of the primary evaluation flow.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

#### FR1: Restructure Evaluation Around SOAP Notes

The evaluation flow must follow the SOAP clinical documentation standard:

- **S (Subjective):** Chief complaint, patient history, symptoms — captured primarily via voice dictation
- **O (Objective):** Only the tests/measurements relevant to THIS patient — not all tests shown by default
- **A (Assessment):** Diagnosis — this is the FIRST clinical step after gathering S+O data. Must be prominent and easy to fill. Resolves Issue #40.
- **P (Plan):** Treatment plan with manually-defined phases. No auto-generated phases.

The SOAP structure should be presented as clear, sequential steps or expandable sections — not one long form.

#### FR2: Simplify Evaluation Model from 1:N to 1:1

- Each ClinicalCase has exactly ONE Evaluation (not Initial/Final)
- The evaluation is a "living document" that evolves as the patient progresses
- Remove the EvaluationType concept (INITIAL/PROGRESS/FINAL)
- The ComparisonBoard should compare session-level data (e.g., pain scores per session) rather than Initial vs Final evaluations
- Migration required: ~30 client files + ~12 server files + DB schema change

#### FR3: Remove Auto-Generated Treatment Phases

- Stop auto-creating 5 treatment phases when a patient/case is created
- The therapist defines phases manually AFTER making a diagnosis
- The therapist decides how many phases are needed (could be 1, could be 10)
- Phases should be addable incrementally as treatment progresses (the doctor doesn't know upfront)

#### FR4: Diagnosis-First Flow (Issue #40 Resolution)

- Diagnosis must be fillable BEFORE treatment phases are defined
- The clinical flow should be: Patient → Evaluation (SOAP) → Diagnosis → Treatment Plan → Phases → Sessions
- The current flow skips diagnosis and jumps to pre-defined phases — this must be reversed

#### FR5: Progressive Disclosure for Tests

- **Orthopedic Tests:** Show ZERO tests by default. Provide a "search and add" or "pick relevant tests" interface where the doctor selects only the tests applicable to the current patient's condition. The 8 current tests (Adams, Thomas, Ober, Lasegue, Phalen, Tinel, Patrick/FABER, Apley) become a searchable library, not a mandatory checklist.
- **Barthel + Lawton ADL Scales:** Completely hidden by default. Available via an "Add assessment scale" action. Only shown when explicitly requested (rare — ~1% of cases, mainly for insurance).
- **Posturogram:** Keep accessible but as an optional expandable section, not a primary tab.
- **Pain Scale:** Keep as a primary element — the most universally relevant assessment tool.

#### FR6: Reduce Cognitive Load

- Current form has ~49-57 input fields across 5 sections with zero indication of what's required vs optional
- New design should present a minimal default view (chief complaint + pain scale + diagnosis)
- Additional assessments are opt-in, not opt-out
- Voice dictation should be the primary input method for subjective notes
- Large touch targets (60px+) for tablet use (iPad and Android tablets)

### Reusability Opportunities

- VoiceRecorder component already exists — promote to primary input method for Subjective section
- Pain scale sliders already built — keep as-is, they're the most relevant assessment
- BodySilhouette/Posturogram component — keep but make optional/expandable
- SessionForm — reuse for session-level data that replaces the comparison model
- Existing SOAP structure maps well to the current tab navigation pattern (replace current tabs with S/O/A/P)

### Scope Boundaries

**In Scope:**

- Restructure EvaluationForm around SOAP note pattern
- Simplify evaluation model from 1:N to 1:1 (schema + frontend + backend — clean DB reset, no migration needed)
- Remove auto-generated 5-phase treatment plan from patient creation
- Add diagnosis step before treatment phases (Issue #40)
- Implement progressive disclosure for orthopedic tests (search/add pattern)
- Hide Barthel/Lawton behind opt-in action
- Make posturogram an optional expandable section
- Update ComparisonBoard to use session-level data instead of Initial/Final evaluations
- Update evaluation-utils.ts (remove getInitialEvaluation/getFinalEvaluation)
- Update all ~30 client files + ~12 server files referencing evaluations[]
- DB schema change for 1:N → 1:1 (clean reset — no data migration needed, testing environment only)

**Out of Scope:**

- Patient list or patient creation flow changes (separate concern)
- Automated SMS reminders or patient engagement features
- Patient portal or home exercise programs
- New orthopedic test definitions beyond the existing 8
- Mobile-native app changes (PWA only)
- AI analysis flow changes (separate module)
- Billing/insurance integration

### Technical Considerations

- **Database Change:** Prisma schema change from `evaluations Evaluation[]` to `evaluation Evaluation?` with `@unique` on `clinicalCaseId`. No data migration needed — the app is in testing only with no production data. Database can be dumped and recreated cleanly.
- **Breaking Change:** The 1:N → 1:1 change affects ~40+ files across the monorepo. Suggest a phased approach: (1) schema + backend, (2) frontend types + utils, (3) UI components, (4) tests. No backward compatibility concerns since the DB will be reset.
- **No Production Data:** App is in testing phase only. Database can be dumped and recreated — no migration strategy or backward compatibility needed.
- **Auto-creation removal:** The `PatientsService.create()` method currently auto-creates a ClinicalCase + Evaluation + TreatmentPlan with 5 phases in a single transaction. This needs to be simplified to only create the Patient + ClinicalCase (empty).
- **Industry Alignment:** SOAP note structure is the industry standard (Jane App, WebPT, Cliniko). Aligning with SOAP improves learnability for any physiotherapist familiar with clinical documentation.
- **Tablet UX (iPad + Android):** Single-column layout, top-aligned labels, 60px+ touch targets, voice-first input, collapsible sections. No swipe gestures for critical actions. Must work well on both iOS Safari and Android Chrome.
- **Existing Specs to Respect:** Cronograma spec (2026-01-15) defines phase progress visualization — will need updates to support dynamic phase counts instead of fixed 5. Evaluation 1:N migration spec (2026-01-16) is now superseded by this spec's 1:1 simplification.
