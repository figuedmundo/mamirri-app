# Spec Requirements: 5-Phase Progress Visualization

## Initial Description

Update the treatment phase model from 4 phases to 5 phases, with proper visualization in the UI.

**From Roadmap (Task 6.18):**

5-Phase Progress Visualization — Update phase model from 4 to 5 phases:

- Phase 1: Initial (mobilizations, pain relief)
- Phase 2: Early-Intermediate (begin stretching)
- Phase 3: Intermediate (flexibility gains)
- Phase 4: Late-Intermediate (therapeutic exercises)
- Phase 5: Advanced (functional strengthening)

## Requirements Discussion

### First Round Questions

**Q1:** I assume this involves updating the `TreatmentPhase` interface and `TreatmentPlan.phases` JSON field from 4 to 5 phases, while keeping existing cases with 4-phase data intact. Is that correct, or should we migrate/transform all existing cases to 5 phases?
**Answer:** There are no existing cases yet. We can dump the database. No migration needed - just update the code.

**Q2:** I'm thinking the phase visualization in `PhaseProgress.tsx` should dynamically render all 5 phases (showing session count per phase), with the same circular button pattern and styling (completed/active states). Should we add any new visual indicators for the additional Phase 5, such as a special "Advanced" badge or different icon?
**Answer:** Follow the same pattern that other phases have. Keep consistent styling.

**Q3:** For the 5 new phase names, I'll use these labels from the roadmap: "Fase 1: Inicial", "Fase 2: Temprana Intermedia", "Fase 3: Intermedia", "Fase 4: Tardía Intermedia", "Fase 5: Avanzada". Are these correct?
**Answer:** Agreed with these names.

**Q4:** I assume `TreatmentSession.phaseNumber` values 1-4 remain valid for existing sessions, and new sessions can use value 5. Should the UI prevent selecting Phase 5 until it has at least one session?
**Answer:** Will dump the database and start again. No migration needed, just update code.

**Q5:** I assume `durationWeeks` for Phase 5 should be set to approximately 3-4 weeks (similar to other phases). Is that correct?
**Answer:** Why should phases have a fixed weeks length? It should be up to the doctor to set up.

**Resolution:** The user is correct. The `durationWeeks` field in `TreatmentPhase` is already configurable per-phase. Default phases will have placeholder durations that the doctor can modify. No schema change needed.

**Q6:** The existing `TreatmentPlan.phases` JSON field stores an array of phase objects. Should we ensure the JSON schema validation allows up to 5 phases?
**Answer:** Please suggest and explain.

**Resolution:** Recommended Option A - Trust TypeScript interface. Since `phases` is a Prisma `Json` field:

- TypeScript interfaces ensure correct structure at compile time
- Backend DTOs with `class-validator` handle API validation at runtime
- No additional JSON schema validation needed
- This matches the current pattern used for other JSON fields (objectives, posturogram, etc.)

### Existing Code to Reference

**Similar Features Identified:**

- `apps/client/src/components/patients/treatment-timeline/PhaseProgress.tsx` - Current 4-phase visualization component
- `apps/client/src/types/patient.ts` - TreatmentPhase interface (lines 207-213)
- `apps/server/prisma/schema.prisma` - TreatmentPlan model with phases JSON field (line 108)
- `apps/client/src/components/patients/treatment-timeline/Cronograma.tsx` - Uses PhaseProgress component

### Follow-up Questions

None needed. All requirements are clear.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - Following existing PhaseProgress component pattern.

## Requirements Summary

### Functional Requirements

1. **Update TreatmentPhase count from 4 to 5**
   - Add Phase 5: "Avanzada" (Advanced - functional strengthening)
   - Keep existing phase structure and interface unchanged

2. **Update default phase definitions**
   - Phase 1: Inicial (mobilizations, pain relief)
   - Phase 2: Temprana Intermedia (begin stretching)
   - Phase 3: Intermedia (flexibility gains)
   - Phase 4: Tardía Intermedia (therapeutic exercises)
   - Phase 5: Avanzada (functional strengthening)

3. **UI updates to PhaseProgress component**
   - Render 5 phases instead of 4
   - Same circular button pattern (completed/active/pending states)
   - Same session count display per phase
   - Same responsive overflow handling

4. **Session phase selector**
   - Allow phaseNumber values 1-5 when creating/editing sessions
   - Update any phase selection dropdowns

### Reusability Opportunities

- PhaseProgress component already handles dynamic phase arrays - minimal changes needed
- TreatmentPhase interface remains unchanged
- No new UI components required

### Scope Boundaries

**In Scope:**

- Update default phase definitions (names, techniques, objectives)
- Update PhaseProgress component to display 5 phases
- Update session forms to allow phase 1-5 selection
- Update any hardcoded "4 phases" references
- Update tests to reflect 5 phases

**Out of Scope:**

- Database migration (user will dump database)
- Phase duration validation (doctor sets this)
- New phase-specific UI elements or icons
- Phase editing UI (already exists or deferred)

### Technical Considerations

- No Prisma migration needed (phases stored as JSON)
- No database schema changes required
- TypeScript interface update sufficient for type safety
- Backend DTO validation via class-validator (if applicable)
- Follow existing PhaseProgress styling patterns exactly
