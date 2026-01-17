# Specification: Patient Profile Refactor

## Goal

Refactor the PatientProfile component to align with the original design mockup, removing features that weren't in the design (MediaGallery, clinical history sidebar, action grid) and adding missing UI elements (diagnosis section, proper pain scale, treatment phases, sessions footer).

## User Stories

- As a physiotherapist, I want to see a complete patient summary with diagnosis and treatment phases so that I can quickly understand their current clinical status
- As a physiotherapist, I want quick-access action buttons in the header so that I can efficiently capture clinical data without scrolling

## Specific Requirements

**Patient Header with Info Grid**

- Display patient name with active/inactive status badge
- Show 2x2 info grid: age+occupation, phone, email (or "Sin email"), formatted birth date
- Display record creation date ("Expediente creado el...")
- Add top color bar indicating patient status (teal for active, gray for inactive)

**Vertical Action Button Stack**

- Position action buttons vertically on the right side of the header
- "Dictar nota" - primary teal button with mic icon
- "Huella" + "Video" - side-by-side sky blue buttons
- "Agendar" - outlined button with border
- "Editar" - gray/muted button

**Diagnosis Section in Case Card**

- Display 3 diagnosis fields: Indicador funcional, Aspecto clinico, Anatomopatologia
- Source data from `evaluation.diagnosis` object
- Use 2-column span layout within case card grid

**Pain Scale with Progress Bars**

- Display 3 separate progress bars: Actividad, Reposo, Palpacion
- Show value as "X/10" with teal gradient bar visualization
- Display pain type indicator (Cronico/Agudo) below bars
- Source from `evaluation.painScale` object

**Treatment Objectives Section**

- Display therapeutic objective text
- Source from `treatmentPlan.objectives.therapeutic`

**Treatment Phases Display**

- Show numbered phase cards (1, 2, 3...) with teal badge
- Display phase name + duration in weeks
- Show phase objectives text
- Display technique chips (max 3 visible + "+N" overflow indicator)
- Source from `treatmentPlan.phases[]` array

**Sessions Footer**

- Display "Sesiones registradas: N" count
- Show "Ultima sesion: [formatted date]"
- Source from `clinicalCase.treatmentSessions` array

**Remove Unused Components**

- Delete MediaGallery component and its imports
- Remove MediaLightbox import from PatientProfile
- Remove clinical history sidebar (past cases list)
- Remove 4-card quick actions grid
- Remove inline ActionCard and MetricCard component definitions

## Visual Design

**`planning/visuals/PatientProfilePreview.png`**

- Single-column layout with card-based sections (no sidebar)
- Patient initials "M.H.Z." with green "Activo" badge in header
- Vertical action button stack on right side of header
- Case card with "Casos Clinicos" section header
- Diagnosis section with labeled fields in left column
- Pain scale with 3 horizontal progress bars in right column
- Treatment phases as numbered cards with technique chips
- Sessions footer with count on left, last date on right

## Existing Code to Leverage

**`product-plan/sections/pacientes/components/PacienteProfile.tsx`**

- Reference implementation matching the mockup design
- Copy button styling patterns (teal primary, sky secondary, outlined)
- Reuse pain scale progress bar markup with gradient styling
- Follow treatment phase card layout with numbered badges
- Use session footer layout pattern

**`apps/client/src/components/ui/card.tsx`**

- Use Card, CardHeader, CardContent components for section structure
- Leverage existing Shadcn/UI styling conventions

**`apps/client/src/components/ui/badge.tsx`**

- Use Badge component for status indicators
- Follow existing variant patterns (default, secondary, outline)

**`apps/client/src/components/patients/PatientProfile.tsx`**

- Keep existing callback props interface (onEdit, onVoiceDictation, etc.)
- Preserve getAge() utility function
- Maintain getStatusColor() function for case status badges

**`apps/client/src/types/patient.ts`**

- All required types already exist (Patient, ClinicalCase, Evaluation, PainScale, Diagnosis, TreatmentPlan, TreatmentPhase)
- No type modifications needed

## Out of Scope

- Type/interface changes to patient.ts
- Backend API modifications
- CaseDetailLayout component changes
- MediaGallery usage in other components (it will be deleted)
- Navigation or routing changes
- New functionality not shown in mockup
- Past cases history view (separate feature)
- Real-time data updates
- Mobile-specific responsive adjustments beyond current patterns
- Animation or transition effects beyond hover states
