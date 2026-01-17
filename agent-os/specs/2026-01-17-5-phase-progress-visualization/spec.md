# Specification: 5-Phase Progress Visualization

## Goal

Update the treatment phase model from 4 phases to 5 phases, aligning with the clinical treatment flow defined by the expert (doctor), with proper visualization in the Cronograma and PhaseProgress components.

## User Stories

- As a physiotherapist, I want to see 5 treatment phases in the progress visualization so that I can track patient progress through the complete clinical treatment flow (Initial → Early-Intermediate → Intermediate → Late-Intermediate → Advanced).
- As a physiotherapist, I want to assign sessions to any of the 5 phases so that I can accurately document which phase of treatment each session belongs to.

## Specific Requirements

**Default 5-Phase Definition**

- Phase 1: "Inicial" - Mobilizations, pain relief (durationWeeks configurable by doctor)
- Phase 2: "Temprana Intermedia" - Begin stretching
- Phase 3: "Intermedia" - Flexibility gains
- Phase 4: "Tardía Intermedia" - Therapeutic exercises
- Phase 5: "Avanzada" - Functional strengthening
- Default `durationWeeks` values are placeholders (e.g., 3 weeks each); doctor configures actual duration
- Default `techniques` and `objectives` arrays populated with clinically relevant starter values

**Backend Default Phases Update**

- Update `patients.service.ts` to create TreatmentPlan with 5 default phases instead of empty array
- Each default phase includes: number, name, durationWeeks, techniques[], objectives
- No database migration needed (phases stored as JSON field)

**PhaseProgress Component Update**

- Component already renders phases dynamically from `phases` prop array
- No changes needed to PhaseProgress component logic itself
- Will automatically display 5 phases when fed 5-phase array

**SessionForm Phase Selector Update**

- Update SessionForm to allow phaseNumber values 1-5
- Phase dropdown populated from `phases` prop (already dynamic)
- No hardcoded phase limits to update

**Test Data Updates**

- Update test mock data (`mockPhases`) from 4 phases to 5 phases
- Update phase-related tests to expect 5 phases
- Affected test files: PhaseProgress.test.tsx, TimelineSidebar.test.tsx, CaseTimeline.test.tsx, SessionDetailView.test.tsx, CaseDetailLayout.test.tsx, PatientProfile.test.tsx

## Visual Design

No visual mockups provided. Follow existing PhaseProgress component styling patterns exactly:

- Same circular button pattern (40x40px, rounded-full)
- Same color scheme: emerald for completed, teal for active, slate for pending
- Same session count display below each phase
- Same horizontal connector lines between phases

## Existing Code to Leverage

**PhaseProgress.tsx (`apps/client/src/components/patients/treatment-timeline/PhaseProgress.tsx`)**

- Already renders phases dynamically from props
- Uses `phases.map()` to render all phases
- No hardcoded phase count - will work with 5 phases automatically
- Reuse styling, completed/active logic, session count display

**TreatmentPhase interface (`apps/client/src/types/patient.ts` lines 207-213)**

- Interface unchanged: `number`, `name`, `durationWeeks`, `techniques[]`, `objectives`
- No TypeScript changes needed to interface itself

**SessionForm.tsx (`apps/client/src/components/patients/treatment-timeline/SessionForm.tsx`)**

- Phase selector dropdown populated from `phases` prop (line 209)
- Already dynamic - will show 5 phases automatically
- No changes needed to component logic

**patients.service.ts (`apps/server/src/modules/patients/patients.service.ts` line 77)**

- Currently creates TreatmentPlan with `phases: []`
- Update to create 5 default phases with name, techniques, objectives

## Out of Scope

- Database migration (user will dump database)
- Prisma schema changes (phases stored as JSON, no schema change needed)
- Phase editing UI (user configures duration via separate mechanism)
- New phase-specific UI elements, icons, or badges
- Phase reordering functionality
- Custom phase colors per phase number
- Phase deletion or dynamic phase count management
- Validation of phase count (trusting TypeScript types)
