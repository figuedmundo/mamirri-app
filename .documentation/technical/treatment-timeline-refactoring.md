# Treatment Timeline UI Refactoring

This document describes the refactoring of the Treatment Timeline UI to improve usability and eliminate information redundancy.

## Overview

The Treatment Timeline view was refactored from a side-by-side panel layout to a two-view navigation pattern that separates the timeline overview from session details.

## Problem Statement

The original implementation had several UX issues:

1. **Layout conflict**: The `TreatmentTimeline` component used `max-w-5xl mx-auto` which didn't integrate well with the flex parent layout
2. **Information redundancy**: Session cards displayed the same information that appeared in the detail panel
3. **Visual clutter**: Stats, phases, charts, AND session cards were all stacked in the left panel

## Solution

### New Navigation Flow

```
Timeline View (single-column)         Session Detail View (two-panel)
┌────────────────────────────┐       ┌────────────┬─────────────────────┐
│ Stats / Phases / Chart     │       │ Sidebar    │ Session Report      │
├────────────────────────────┤ click │ grouped    │ + Posturogram       │
│ ● Session Card             │ ────> │ by phase   │                     │
│ ● Session Card             │       │            │                     │
└────────────────────────────┘       └────────────┴─────────────────────┘
                                           ↑
                                     Back arrow returns to timeline
```

### Components Created

#### TimelineSidebar

Location: `apps/client/src/components/patients/treatment-timeline/TimelineSidebar.tsx`

A compact session navigator that groups sessions by treatment phase. Features:

- Phase headers with number badge, name, and duration
- Compact session cards showing session number, date, and observations
- Active session highlighting with teal border
- Voice note indicators

Props:

- `clinicalCase: ClinicalCase` - The clinical case data
- `activeSessionId?: string` - Currently selected session ID
- `onSelectSession: (id: string) => void` - Callback when session is clicked

#### SessionDetailView

Location: `apps/client/src/components/patients/treatment-timeline/SessionDetailView.tsx`

A two-panel layout showing the sidebar and session details. Features:

- Left: TimelineSidebar for navigation between sessions
- Right: Session report with pain level, techniques, patient response
- Posturogram comparison viewer (when images available)
- Voice note playback UI

Props:

- `clinicalCase: ClinicalCase` - The clinical case data
- `activeSessionId?: string` - Currently selected session ID
- `onSelectSession: (id: string) => void` - Callback when session changes

### Components Modified

#### TreatmentTimeline

- Renamed `onViewSession` prop to `onSelectSession` for clarity
- No structural changes - remains a single-column layout with stats, phases, chart, and session cards

#### CaseDetailLayout

- Added new view mode: `'session-detail'`
- Navigation flow:
  - `'timeline'`: Shows TreatmentTimeline as single-column centered layout
  - `'session-detail'`: Shows SessionDetailView with sidebar + content
  - `'evaluation'`: EvaluationForm (unchanged)
  - `'comparison'`: ComparisonBoard (unchanged)
- Back arrow behavior:
  - In timeline mode: Returns to patient profile
  - In session-detail mode: Returns to timeline view
- Tab highlighting: "Seguimiento" tab is active for both timeline and session-detail modes

## View Modes

| Mode             | Description                                    | Layout                  |
| ---------------- | ---------------------------------------------- | ----------------------- |
| `timeline`       | Overview of all sessions with stats and charts | Single-column, centered |
| `session-detail` | Detailed view of a specific session            | Two-panel with sidebar  |
| `evaluation`     | Clinical evaluation form                       | Single-column, centered |
| `comparison`     | Before/after postural comparison               | Single-column, centered |

## File Changes Summary

| File                                       | Change Type | Description                                  |
| ------------------------------------------ | ----------- | -------------------------------------------- |
| `treatment-timeline/TimelineSidebar.tsx`   | New         | Compact phase-grouped session navigator      |
| `treatment-timeline/SessionDetailView.tsx` | New         | Two-panel session detail layout              |
| `treatment-timeline/index.ts`              | Modified    | Added exports for new components             |
| `TreatmentTimeline.tsx`                    | Modified    | Renamed `onViewSession` to `onSelectSession` |
| `CaseDetailLayout.tsx`                     | Modified    | Refactored to support new navigation flow    |

## Design References

The implementation follows the mockups located at:

- `.documentation/ThreatmentTimeline.png` - Timeline view mockup
- `.documentation/PosturogramViewer.png` - Session detail view mockup

---

Last Modified: 2026-01-17
