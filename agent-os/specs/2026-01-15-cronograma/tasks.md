# Task Breakdown: Cronograma Enhancement

## Overview

Total Tasks: 18 sub-tasks across 4 task groups

**Feature Summary:** Enhance the existing `Timeline.tsx` into a full Cronograma with phase progress visualization, session form, pain trend chart, and session management.

## Task List

### Foundation Layer

#### Task Group 1: Component Structure & Types

**Dependencies:** None

- [x] 1.0 Complete component structure and types
  - [x] 1.1 Create `cronograma/` folder structure
    - Create `apps/client/src/components/patients/cronograma/`
    - Create index.ts barrel export
  - [x] 1.2 Add API methods to `patients.ts`
    - Add `updateSession(sessionId, data)` method
    - Add `deleteSession(sessionId)` method
  - [x] 1.3 Create Zod validation schema
    - Create `session-form-schema.ts` in cronograma folder
    - Define `sessionFormSchema` with all field validations
  - [x] 1.4 Create shared types
    - `CreateSessionDto` interface
    - `SessionFormData` type

**Acceptance Criteria:**

- Folder structure exists
- API methods compile without errors
- Schema validates test data correctly

---

### UI Components Layer

#### Task Group 2: Sub-Components

**Dependencies:** Task Group 1

- [x] 2.0 Complete sub-components
  - [x] 2.1 Create `PhaseProgress.tsx`
    - Horizontal stepper with phase circles
    - Active phase teal highlight
    - Completed phases show checkmark icon
    - Session count badge per phase
    - Click handler to filter
    - Keyboard accessible (Tab + Enter)
  - [x] 2.2 Create `SessionCard.tsx`
    - Extract card layout from Timeline.tsx
    - Date, phase, procedures, pain level display
    - Edit/Delete action buttons
    - Hover state styling
    - Voice note indicator
  - [x] 2.3 Create `PainTrendChart.tsx`
    - SVG sparkline (no external library)
    - Color gradient based on values
    - Trend indicator arrow (↑↓→)
    - Responsive width
    - Fallback for < 2 sessions
  - [x] 2.4 Create `SessionStatsSummary.tsx`
    - Total sessions count
    - Average pain level badge
    - Current phase indicator
    - Days since start
    - Grid layout for stats

**Acceptance Criteria:**

- Each component renders correctly in isolation
- Proper TypeScript types
- Accessible markup

---

#### Task Group 3: Session Form

**Dependencies:** Task Group 1

- [x] 3.0 Complete session form modal
  - [x] 3.1 Create `SessionForm.tsx` component
    - Use Shadcn Dialog for modal
    - Form layout with all fields
    - Date picker (native HTML5)
    - Phase selector dropdown
    - Procedures tag input
    - Pain level slider
    - Observations textarea
  - [x] 3.2 Implement form validation
    - Wire Zod schema to form
    - Display inline error messages
    - Disable submit while invalid
  - [x] 3.3 Implement procedures input
    - Tag-style input with add/remove
    - Common procedures suggestions
    - Keyboard support (Enter to add, Backspace to remove)
  - [x] 3.4 Implement submit handling
    - Loading state on submit button
    - Call onSubmit callback with validated data
    - Error handling with toast
    - Close modal on success

**Acceptance Criteria:**

- Form validates all fields correctly
- Modal opens/closes properly
- Submit sends correct data format

---

### Integration Layer

#### Task Group 4: Cronograma Integration

**Dependencies:** Task Groups 2, 3

- [x] 4.0 Complete Cronograma integration
  - [x] 4.1 Refactor `Timeline.tsx` to `Cronograma.tsx`
    - Rename component and file
    - Import all sub-components
    - Add phase filtering state
    - Integrate PhaseProgress header
  - [x] 4.2 Integrate session management
    - Wire SessionForm modal
    - Handle add/edit modes
    - Implement delete with confirmation
    - Optimistic updates
  - [x] 4.3 Integrate statistics display
    - Add PainTrendChart to header area
    - Add SessionStatsSummary
    - Responsive layout adjustment
  - [x] 4.4 Add empty and loading states
    - Empty state per phase
    - Loading skeleton for data fetch
    - Error state with retry
  - [x] 4.5 Update exports and imports
    - Update barrel exports
    - Update consumers (CaseDetailLayout)
    - Ensure backward compatibility

**Acceptance Criteria:**

- All features work together
- Filtering by phase works
- Add/Edit/Delete sessions works
- Existing consumers still work

---

## Execution Order

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation                                             │
├─────────────────────────────────────────────────────────────────┤
│ Task Group 1: Structure & Types                                 │
├─────────────────────────────────────────────────────────────────┤
│ Phase 2: Components (Parallel)                                  │
├─────────────────────────────────────────────────────────────────┤
│ Task Group 2: Sub-Components  ──┐                               │
│ Task Group 3: Session Form    ──┼── Can run in parallel         │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3: Integration                                            │
├─────────────────────────────────────────────────────────────────┤
│ Task Group 4: Cronograma Integration                            │
│   (Depends on Groups 2, 3)                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Time Estimates:**

- Phase 1: ~30 minutes
- Phase 2: ~2 hours (parallel work)
- Phase 3: ~1.5 hours
- **Total: ~4 hours**

---

## Files to Create/Modify

| File                                                     | Action                     | Task Group |
| -------------------------------------------------------- | -------------------------- | ---------- |
| `components/patients/cronograma/index.ts`                | Create                     | 1          |
| `components/patients/cronograma/session-form-schema.ts`  | Create                     | 1          |
| `components/patients/cronograma/PhaseProgress.tsx`       | Create                     | 2          |
| `components/patients/cronograma/SessionCard.tsx`         | Create                     | 2          |
| `components/patients/cronograma/PainTrendChart.tsx`      | Create                     | 2          |
| `components/patients/cronograma/SessionStatsSummary.tsx` | Create                     | 2          |
| `components/patients/cronograma/SessionForm.tsx`         | Create                     | 3          |
| `components/patients/Cronograma.tsx`                     | Create (from Timeline.tsx) | 4          |
| `api/patients.ts`                                        | Modify                     | 1          |

## MUST NOT Do

- **DO NOT use external charting libraries** - Use simple SVG for pain trend
- **DO NOT implement drag-and-drop** - Out of scope
- **DO NOT implement voice recording** - Week 7 scope
- **DO NOT break existing Timeline consumers** - Maintain backward compatibility
- **DO NOT add comments to code** - Self-documenting code
