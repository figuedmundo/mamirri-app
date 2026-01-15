# Requirements: Cronograma Enhancement (Task 6.2)

## Overview

Enhance the existing `Timeline.tsx` component to become a full-featured treatment schedule (Cronograma) with phase indicators, progress visualization, and session management.

## Current State Analysis

### Existing Components

1. **`Timeline.tsx`** (183 lines)
   - Basic vertical timeline of sessions
   - Session cards with date, phase, procedures, pain level
   - Add/Edit/View session callbacks
   - Empty state handling

2. **`CaseTimeline.tsx`** (91 lines)
   - Sidebar timeline for session navigation
   - Phase-grouped sessions
   - Used in `CaseDetailLayout`

### Gaps to Address

- No phase progress indicators
- No session form (add/edit)
- No pain level trend visualization
- No phase transition handling
- Limited mobile responsiveness

## Functional Requirements

### FR-1: Phase Progress Visualization

- Display treatment phases as horizontal or vertical progress steps
- Show current phase highlighted
- Display phase completion status (pending/active/completed)
- Show phase objectives and duration
- Allow phase navigation to filter sessions

### FR-2: Session Management

- **Create Session**: Modal form with fields:
  - Date (default: today)
  - Phase (dropdown from treatment plan phases)
  - Procedures (multi-select or tags input)
  - Patient Response (textarea)
  - Pain Level (END scale slider 0-10)
  - Observations (textarea)
  - Voice Note (placeholder for recording)
- **Edit Session**: Same form pre-populated
- **Delete Session**: Confirmation dialog

### FR-3: Pain Level Trend

- Mini chart showing pain level progression over sessions
- Color-coded trend (green = improving, red = worsening)
- Last N sessions visualization (configurable, default 5)

### FR-4: Session Statistics Summary

- Total sessions count
- Average pain level
- Current phase indicator
- Time since case started
- Estimated remaining phases

### FR-5: Mobile Responsiveness

- Stack layout for mobile (< 768px)
- Touch-friendly tap targets (44px min)
- Swipe gestures for phase navigation (optional)

## Non-Functional Requirements

### NFR-1: Performance

- Lazy load session details on expand
- Virtualize list for > 20 sessions
- Debounce form inputs

### NFR-2: Accessibility

- Keyboard navigation through timeline
- Screen reader announcements for phase changes
- Focus management in modals
- ARIA labels on interactive elements

### NFR-3: Design Consistency

- Follow existing component patterns (Shadcn/UI)
- Use project color palette (teal-500 primary, emerald/amber/rose for status)
- Match existing card and form styling

## User Stories

### US-1: View Treatment Progress

**As a** physiotherapist  
**I want to** see visual progress through treatment phases  
**So that** I can quickly understand where the patient is in their treatment plan

### US-2: Record Session

**As a** physiotherapist  
**I want to** quickly record a treatment session after completing it  
**So that** I have documentation of what was done and the patient's response

### US-3: Track Pain Improvement

**As a** physiotherapist  
**I want to** see the pain level trend over sessions  
**So that** I can assess if the treatment is effective

### US-4: Plan Next Session

**As a** physiotherapist  
**I want to** see the phase objectives and techniques  
**So that** I know what to focus on in the next session

## Technical Constraints

- Use existing `TreatmentSession`, `TreatmentPhase`, `ClinicalCase` types
- Wire to existing `patientsApi` endpoints
- Follow React useState + Zod validation pattern (no React Hook Form)
- Use Shadcn/UI Dialog for modals
- Keep component under 500 lines (extract sub-components if needed)

## Out of Scope

- Voice note recording (Week 7)
- Google Calendar integration (existing via `onSchedule` callback)
- Session export/printing
- Multi-patient session scheduling

## Success Metrics

- Phase progress visible at a glance
- Session can be added in < 30 seconds
- Pain trend visible without scrolling
- Works on iPad landscape (primary use case)
