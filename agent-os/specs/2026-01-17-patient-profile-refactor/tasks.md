# Task Breakdown: Patient Profile Refactor

## Overview

Total Tasks: 24

## Task List

### Cleanup Layer

#### Task Group 1: Remove Unused Components

**Dependencies:** None

- [x] 1.0 Complete cleanup of unused code
  - [x] 1.1 Delete MediaGallery component
    - Remove file: `apps/client/src/components/patients/MediaGallery.tsx`
    - Verify no other imports exist (grep for MediaGallery)
  - [x] 1.2 Remove MediaGallery and MediaLightbox imports from PatientProfile
    - Remove import statements
    - Remove related state (lightboxOpen, lightboxIndex, lightboxItems)
    - Remove handleMediaSelect function
    - Remove MediaLightbox JSX at bottom of component
  - [x] 1.3 Remove clinical history sidebar code
    - Remove pastCases variable
    - Remove right column div with "Historial Clinico" section
    - Remove past case mapping and click handlers
  - [x] 1.4 Remove quick actions grid
    - Remove 4-card grid section (Dictar Notas, Capturar Huella, Video Postura, Nueva Evaluacion)
    - Remove inline ActionCard component definition
  - [x] 1.5 Remove MetricCard component
    - Remove inline MetricCard component definition
    - Remove MetricCard usages in active case section
  - [x] 1.6 Verify cleanup compiles without errors
    - Run `npm run build` in apps/client
    - Fix any broken imports or references

**Acceptance Criteria:**

- MediaGallery.tsx file deleted
- PatientProfile has no MediaGallery/MediaLightbox imports
- No clinical history sidebar in PatientProfile
- No quick actions grid in PatientProfile
- Build succeeds with no type errors

### Sub-Component Layer

#### Task Group 2: Extract Reusable Sub-Components

**Dependencies:** Task Group 1

- [x] 2.0 Complete sub-component extraction
  - [x] 2.1 Create PainScaleDisplay component
    - File: `apps/client/src/components/patients/PainScaleDisplay.tsx`
    - Props: `painScale: PainScale`
    - Display 3 progress bars (activity, rest, palpation) with values
    - Show pain type indicator (Cronico/Agudo)
    - Use teal gradient for bars: `from-teal-500 to-teal-400`
  - [x] 2.2 Create DiagnosisSection component
    - File: `apps/client/src/components/patients/DiagnosisSection.tsx`
    - Props: `diagnosis: Diagnosis`
    - Display 3 fields: functionalIndicator, clinicalAspect, anatomopathology
    - Use label + value pattern with slate colors
  - [x] 2.3 Create TreatmentPhaseCard component
    - File: `apps/client/src/components/patients/TreatmentPhaseCard.tsx`
    - Props: `phase: TreatmentPhase`
    - Display numbered badge (teal), name, duration
    - Show objectives text
    - Display technique chips (max 3 + overflow indicator)
  - [x] 2.4 Create SessionsFooter component
    - File: `apps/client/src/components/patients/SessionsFooter.tsx`
    - Props: `sessions: TreatmentSession[]`
    - Display count on left, last session date on right
    - Handle empty sessions array gracefully
  - [x] 2.5 Verify sub-components compile
    - Run `npm run build` in apps/client
    - Check for type errors in new components

**Acceptance Criteria:**

- 4 new component files created
- All components have proper TypeScript types
- Components follow existing styling patterns
- Build succeeds with no type errors

### Frontend UI Layer

#### Task Group 3: Rewrite PatientProfile Component

**Dependencies:** Task Group 2

- [x] 3.0 Complete PatientProfile UI rewrite
  - [x] 3.1 Write 4-6 focused tests for PatientProfile
    - Test patient header renders name and status badge
    - Test patient info grid shows all fields (age, occupation, phone, email, birth date)
    - Test action buttons render and are clickable
    - Test active case card renders with diagnosis section
    - Test pain scale displays 3 bars
    - Test treatment phases render with technique chips
  - [x] 3.2 Implement new header section
    - Add top color bar (teal active, gray inactive)
    - Display patient name with status badge
    - Create 2x2 info grid (age+occupation, phone, email, birth date)
    - Add record creation date text
    - Match mockup: `planning/visuals/PatientProfilePreview.png`
  - [x] 3.3 Implement vertical action button stack
    - "Dictar nota" - primary teal button with Mic icon
    - "Huella" + "Video" - side-by-side sky blue buttons
    - "Agendar" - outlined button with Calendar icon
    - "Editar" - gray button with Edit2 icon
    - Wire up existing callback props (onVoiceDictation, onCaptureFootprint, etc.)
  - [x] 3.4 Implement case card structure
    - "Casos Clinicos" section header
    - Empty state when no cases
    - Case title + status badge + start date
    - Consultation reason text
  - [x] 3.5 Integrate sub-components into case card
    - Add DiagnosisSection (left column, 2-col span)
    - Add PainScaleDisplay (right column)
    - Add treatment objectives section
    - Add TreatmentPhaseCard for each phase (2-col span)
    - Add SessionsFooter at bottom
  - [x] 3.6 Update layout to single-column
    - Remove 3-column grid layout
    - Implement single-column card-based layout
    - Match mockup spacing and structure
  - [x] 3.7 Ensure PatientProfile tests pass
    - Run tests: `npm test -- PatientProfile`
    - Verify all 4-6 tests from 3.1 pass

**Acceptance Criteria:**

- All 4-6 tests from 3.1 pass
- UI matches mockup design
- All action buttons work with existing callbacks
- Diagnosis, pain scale, phases, and sessions footer display correctly
- Single-column layout implemented

### Testing Layer

#### Task Group 4: Test Updates & Verification

**Dependencies:** Task Group 3

- [x] 4.0 Complete test updates and verification
  - [x] 4.1 Update existing PatientProfile tests
    - Remove tests for MediaGallery integration
    - Remove tests for clinical history sidebar
    - Remove tests for quick actions grid
    - Update mock data to match current component expectations
  - [x] 4.2 Add tests for new sub-components
    - Tests included in PatientProfile.test.tsx covering all sub-components
  - [x] 4.3 Run all PatientProfile-related tests
    - Run: `npm test -- PatientProfile`
    - Verify all tests pass
    - Result: 9 tests passing
  - [x] 4.4 Run full build verification
    - Run `npm run build` in apps/client
    - Build successful

**Acceptance Criteria:**

- All PatientProfile-related tests pass (9 tests)
- No broken tests from removed features
- Build succeeds
- Lint passes

## Execution Order

Recommended implementation sequence:

1. Cleanup Layer (Task Group 1) - Remove unused code first to simplify
2. Sub-Component Layer (Task Group 2) - Create reusable pieces
3. Frontend UI Layer (Task Group 3) - Rewrite main component using sub-components
4. Testing Layer (Task Group 4) - Update tests and verify

## Files Changed Summary

| File                                                          | Action  | Status |
| ------------------------------------------------------------- | ------- | ------ |
| `apps/client/src/components/patients/MediaGallery.tsx`        | DELETE  | Done   |
| `apps/client/src/components/patients/PatientProfile.tsx`      | REWRITE | Done   |
| `apps/client/src/components/patients/PatientProfile.test.tsx` | UPDATE  | Done   |
| `apps/client/src/components/patients/PainScaleDisplay.tsx`    | CREATE  | Done   |
| `apps/client/src/components/patients/DiagnosisSection.tsx`    | CREATE  | Done   |
| `apps/client/src/components/patients/TreatmentPhaseCard.tsx`  | CREATE  | Done   |
| `apps/client/src/components/patients/SessionsFooter.tsx`      | CREATE  | Done   |
| `apps/client/src/types/patient.ts`                            | FIX     | Done   |
| `apps/client/src/components/patients/EvaluationForm.tsx`      | FIX     | Done   |
| `apps/client/src/lib/evaluation-utils.ts`                     | FIX     | Done   |

## Reference Files

- Mockup: `agent-os/specs/2026-01-17-patient-profile-refactor/planning/visuals/PatientProfilePreview.png`
- Reference implementation: `product-plan/sections/pacientes/components/PacienteProfile.tsx`
- Current component: `apps/client/src/components/patients/PatientProfile.tsx`
- Types: `apps/client/src/types/patient.ts`
