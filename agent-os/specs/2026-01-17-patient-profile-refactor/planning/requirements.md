# Spec Requirements: Patient Profile Refactor

## Initial Description

Refactor the `PatientProfile` component to align with the original design mockup. The current implementation has diverged significantly from the intended design, adding features not in the mockup and missing key UI elements that were specified.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the main goal is component extraction - splitting the 438-line file into smaller, focused components (ProfileHeader, ActiveCaseSection, ClinicalHistory, QuickActions). Is that correct, or is this about something else (performance, architecture, fixing bugs)?
**Answer:** Refactor AND update UI to match the original mockup design.

**Q2:** MediaGallery - should it be removed entirely, moved to CaseDetail, or kept somewhere?
**Answer:** Review what MediaGallery does. CaseDetailView should have its own posturogram view for pictures. MediaGallery is likely not needed in PatientProfile.

**Q3:** What is the Lightbox component?
**Answer:** MediaLightbox is a full-screen modal image/video viewer with navigation. Keep it as a reusable UI component, but remove from PatientProfile.

**Q4:** Clinical History sidebar - should past cases be removed, collapsed, or kept as sidebar?
**Answer:** Remove entirely. The mockup doesn't show clinical history - this was added incorrectly.

**Q5:** Does the Patient type have all required fields (email, diagnosis, treatment phases)?
**Answer:** Reviewed - all fields exist in types. No type changes needed.

**Q6:** Quick Actions grid - keep both header actions and grid, or remove grid?
**Answer:** Remove the action grid entirely. Implement header buttons matching the reference design (vertical stack).

### Existing Code to Reference

**Similar Features Identified:**

- Feature: PacienteProfile (design prototype) - Path: `product-plan/sections/pacientes/components/PacienteProfile.tsx`
- Components to potentially reuse: Button styling patterns, status badge styling, pain scale progress bars
- Backend logic to reference: No changes needed - all API handlers already exist

### Follow-up Questions

**Follow-up 1:** The reference has actions in header. Should we remove the action grid entirely?
**Answer:** Yes, remove the 4-card action grid. Match the header button layout from reference.

## Visual Assets

### Files Provided:

- `PatientProfilePreview.png`: Original design mockup showing intended PatientProfile layout

### Visual Insights:

- **Layout**: Single-column card-based design (NOT 3-column grid with sidebar)
- **Header**: Patient initials with "Activo" badge, vertical action buttons on right side
- **Patient Info**: Shows age, occupation, phone, email, birth date, record creation date
- **Case Section**: Full diagnosis details, 3-bar pain scale, treatment objectives, numbered phases with technique chips
- **Footer**: Sessions count + last session date
- **Fidelity level**: High-fidelity mockup - should be followed closely

## Requirements Summary

### Functional Requirements

#### Components to REMOVE from PatientProfile:

1. **MediaGallery** - Delete component entirely (`apps/client/src/components/patients/MediaGallery.tsx`)
2. **MediaLightbox import** - Remove from PatientProfile (keep component in `ui/` for reuse elsewhere)
3. **Clinical History Sidebar** - Remove the right column with past cases list
4. **Quick Actions Grid** - Remove the 4-card action grid (Dictar Notas, Capturar Huella, Video Postura, Nueva Evaluación)
5. **ActionCard component** - Remove inline component definition
6. **MetricCard component** - Remove inline component definition (replaced by new UI)

#### UI to ADD/MODIFY:

**1. Header Section:**

- Top color bar indicating patient status (teal for active, gray for inactive)
- Patient name with "Activo/Inactivo" badge
- Patient info grid (2x2):
  - Age + Occupation
  - Phone number
  - Email (or "Sin email")
  - Birth date (formatted)
- Record creation date ("Expediente creado el...")
- Vertical action button stack (right side):
  - "Dictar nota" - Primary teal button with mic icon
  - "Huella" + "Video" - Side-by-side sky blue buttons
  - "Agendar" - Outlined button
  - "Editar" - Gray button

**2. Clinical Cases Section:**

- Section header: "Casos Clínicos"
- Empty state when no cases
- Case card for each case containing:

**3. Case Card Content:**

- Case title + status badge + start date
- Consultation reason (truncated)
- **Diagnosis section** (2-column span):
  - Indicador funcional
  - Aspecto clínico
  - Anatomopatología
- **Pain Scale section** (3 progress bars):
  - Actividad: X/10 with gradient bar
  - Reposo: X/10 with gradient bar
  - Palpación: X/10 with gradient bar
  - Type indicator (Crónico/Agudo)
- **Objectives section:**
  - Therapeutic objective text
- **Treatment Phases section** (2-column span):
  - Numbered phase cards (1, 2, 3...)
  - Phase name + duration in weeks
  - Phase objectives
  - Technique chips (max 3 shown + "+N" overflow)
- **Sessions Footer:**
  - "Sesiones registradas: N"
  - "Última sesión: [date]"

### Data Mapping (Types → UI)

| UI Element            | Data Source                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| Patient name          | `patient.name`                                                                     |
| Status badge          | `patient.isActive`                                                                 |
| Age                   | `patient.age` or calculated from `patient.birthDate`                               |
| Occupation            | `patient.occupation`                                                               |
| Phone                 | `patient.phone`                                                                    |
| Email                 | `patient.email` (optional)                                                         |
| Birth date            | `patient.birthDate` (formatted)                                                    |
| Record created        | `patient.createdAt` (formatted)                                                    |
| Case title            | `clinicalCase.title`                                                               |
| Case status           | `clinicalCase.status`                                                              |
| Start date            | `clinicalCase.startDate`                                                           |
| Consultation reason   | `clinicalCase.consultationReason`                                                  |
| Diagnosis             | `evaluation.diagnosis.functionalIndicator`, `.clinicalAspect`, `.anatomopathology` |
| Pain - Activity       | `evaluation.painScale.activity`                                                    |
| Pain - Rest           | `evaluation.painScale.rest`                                                        |
| Pain - Palpation      | `evaluation.painScale.palpation`                                                   |
| Pain type             | `evaluation.painScale.type`                                                        |
| Therapeutic objective | `treatmentPlan.objectives.therapeutic`                                             |
| Treatment phases      | `treatmentPlan.phases[]`                                                           |
| Phase number          | `phase.number`                                                                     |
| Phase name            | `phase.name`                                                                       |
| Phase duration        | `phase.durationWeeks`                                                              |
| Phase objectives      | `phase.objectives`                                                                 |
| Phase techniques      | `phase.techniques[]`                                                               |
| Sessions count        | `clinicalCase.treatmentSessions.length`                                            |
| Last session date     | `clinicalCase.treatmentSessions[last].date`                                        |

### Reusability Opportunities

- Status badge styling is consistent across the app
- Pain scale progress bars can be extracted as `PainScaleBar` component
- Treatment phase card can be extracted as `TreatmentPhaseCard` component
- Action button styling from reference can be standardized

### Scope Boundaries

**In Scope:**

- Complete UI rewrite of PatientProfile to match mockup
- Remove MediaGallery component and its usage
- Remove clinical history sidebar
- Remove quick actions grid
- Add missing patient info fields (email, birth date, created date)
- Add diagnosis section with 3 fields
- Add proper 3-bar pain scale with progress bars
- Add treatment objectives section
- Add treatment phases with technique chips
- Add sessions footer
- Extract reusable sub-components as appropriate
- Keep existing callback props interface (onEdit, onVoiceDictation, onCaptureFootprint, onCaptureVideo, onSchedule, onRefresh, onViewCase)

**Out of Scope:**

- Type/interface changes (not needed)
- API changes (not needed)
- CaseDetailLayout changes
- Navigation changes
- Backend changes
- Adding new functionality not in mockup

### Technical Considerations

- **Integration points**: PatientProfile receives `patient` object with all nested data
- **Existing system constraints**: Must maintain same props interface for parent component compatibility
- **Technology preferences**: Use Lucide icons, Tailwind CSS, existing color palette
- **Similar code patterns to follow**: Reference implementation in `product-plan/sections/pacientes/components/PacienteProfile.tsx`

### File Changes Summary

| File                                                          | Action    | Notes                           |
| ------------------------------------------------------------- | --------- | ------------------------------- |
| `apps/client/src/components/patients/PatientProfile.tsx`      | REWRITE   | Major UI overhaul               |
| `apps/client/src/components/patients/PatientProfile.test.tsx` | UPDATE    | Update tests for new structure  |
| `apps/client/src/components/patients/MediaGallery.tsx`        | DELETE    | No longer needed                |
| `apps/client/src/types/patient.ts`                            | NO CHANGE | Types already complete          |
| `apps/client/src/pages/PatientDetail.tsx`                     | REVIEW    | May need minor prop adjustments |

### Component Extraction Plan

Extract these sub-components from PatientProfile:

1. **`PatientHeader.tsx`** - Patient info + action buttons
2. **`ClinicalCaseCard.tsx`** - Full case card with all sections
3. **`DiagnosisSection.tsx`** - 3-field diagnosis display
4. **`PainScaleDisplay.tsx`** - 3 progress bars + type
5. **`TreatmentPhaseCard.tsx`** - Single phase with techniques
6. **`SessionsFooter.tsx`** - Sessions count + last date

### Styling Reference

Colors from reference:

- Primary actions: `bg-teal-600 hover:bg-teal-700`
- Secondary actions: `bg-sky-600 hover:bg-sky-700`
- Outlined buttons: `border-2 border-sky-500 text-sky-600`
- Muted buttons: `bg-slate-100 hover:bg-slate-200`
- Status active: `bg-teal-100 text-teal-800`
- Pain scale gradient: `from-teal-500 to-teal-400`
- Phase number badge: `bg-teal-600 text-white`
- Technique chips: `bg-white text-slate-600` on light background

### Acceptance Criteria

1. PatientProfile visually matches the mockup (`PatientProfilePreview.png`)
2. All patient info fields displayed (age, occupation, phone, email, birth date, created date)
3. Diagnosis section shows all 3 fields
4. Pain scale shows 3 progress bars with values
5. Treatment phases display with numbered badges and technique chips
6. Sessions footer shows count and last session date
7. Action buttons in header match reference layout
8. No MediaGallery in PatientProfile
9. No clinical history sidebar
10. No quick actions grid
11. All existing callbacks still work
12. Tests pass
13. Build succeeds with no type errors
