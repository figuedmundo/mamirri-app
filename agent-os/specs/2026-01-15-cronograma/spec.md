# Technical Specification: Cronograma Enhancement

## Architecture Overview

The Cronograma enhancement will extend the existing `Timeline.tsx` component with modular sub-components for phase progress, session form, and pain trend visualization.

```
Cronograma (enhanced Timeline.tsx)
├── PhaseProgress.tsx          - Horizontal phase steps with progress
├── SessionForm.tsx            - Modal form for add/edit session
├── PainTrendChart.tsx         - Mini sparkline showing pain trend
├── SessionCard.tsx            - Extracted from Timeline.tsx
└── SessionStatsSummary.tsx    - Quick stats overview
```

## Component Design

### 1. Cronograma (Timeline.tsx enhancement)

**Props Interface:**

```typescript
interface CronogramaProps {
  clinicalCase: ClinicalCase;
  onAddSession: () => void;
  onEditSession: (id: string) => void;
  onViewSession: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  activePhase?: number;
  onPhaseChange?: (phaseNumber: number) => void;
}
```

**State:**

- `selectedPhase: number | null` - Filter sessions by phase (null = all)
- `isSessionFormOpen: boolean` - Modal visibility
- `editingSession: TreatmentSession | null` - Session being edited
- `isDeleting: boolean` - Delete confirmation state

### 2. PhaseProgress Component

**Props:**

```typescript
interface PhaseProgressProps {
  phases: TreatmentPhase[];
  currentPhase: number;
  sessions: TreatmentSession[];
  onPhaseClick: (phaseNumber: number) => void;
  selectedPhase: number | null;
}
```

**UI Design:**

- Horizontal stepper with phase circles
- Active phase highlighted with teal ring
- Completed phases show checkmark
- Session count badge on each phase
- Click to filter sessions

### 3. SessionForm Component

**Props:**

```typescript
interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: CreateSessionDto) => Promise<void>;
  phases: TreatmentPhase[];
  initialData?: TreatmentSession;
  isLoading?: boolean;
}

interface CreateSessionDto {
  date: string;
  phaseNumber: number;
  procedures: string[];
  patientResponse: string;
  finalPainLevel: number;
  observations: string;
}
```

**Form Fields:**
| Field | Component | Validation |
|-------|-----------|------------|
| Date | Input type="date" | Required, not future |
| Phase | Select | Required |
| Procedures | Tag input with suggestions | At least 1 |
| Patient Response | Textarea | Required, min 10 chars |
| Pain Level | Slider 0-10 | Required |
| Observations | Textarea | Optional |

### 4. PainTrendChart Component

**Props:**

```typescript
interface PainTrendChartProps {
  sessions: TreatmentSession[];
  maxSessions?: number; // Default: 5
  height?: number; // Default: 40px
}
```

**Implementation:**

- Simple SVG sparkline (no external charting library)
- Color gradient from green (low pain) to red (high pain)
- Show trend arrow (↑ worsening, ↓ improving, → stable)
- Tooltip on hover showing exact values

### 5. SessionStatsSummary Component

**Props:**

```typescript
interface SessionStatsSummaryProps {
  clinicalCase: ClinicalCase;
}
```

**Metrics Displayed:**

- Total sessions count
- Average pain level (with color indicator)
- Current phase name
- Days since case started
- Sessions remaining estimate (based on phase durations)

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Parent Component                           │
│                  (e.g., CaseDetailLayout)                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │ props: clinicalCase, callbacks
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Cronograma                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │PhaseProgress │  │SessionStats  │  │ PainTrendChart       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Session List (filtered by phase)                        │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │  │
│  │  │ SessionCard │ │ SessionCard │ │ SessionCard │ ...    │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SessionForm (Modal)                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## API Integration

### Existing Endpoints (from patientsApi)

```typescript
// Create session
patientsApi.addSession(clinicalCaseId: string, session: CreateSessionDto)

// Update session (needs to be added if not exists)
patientsApi.updateSession(sessionId: string, session: Partial<TreatmentSession>)

// Delete session
patientsApi.deleteSession(sessionId: string)
```

### Validation Schema (Zod)

```typescript
const sessionFormSchema = z.object({
  date: z
    .string()
    .refine((d) => new Date(d) <= new Date(), 'Date cannot be in the future'),
  phaseNumber: z.number().min(1).max(10),
  procedures: z.array(z.string()).min(1, 'At least one procedure required'),
  patientResponse: z
    .string()
    .min(10, 'Response must be at least 10 characters'),
  finalPainLevel: z.number().min(0).max(10),
  observations: z.string().optional(),
});
```

## Styling Specifications

### Color Palette

| Element            | Color          |
| ------------------ | -------------- |
| Active phase       | teal-500       |
| Completed phase    | emerald-500    |
| Pending phase      | slate-300      |
| Pain low (0-3)     | emerald-500    |
| Pain medium (4-6)  | amber-500      |
| Pain high (7-10)   | rose-500       |
| Session card hover | teal-50 border |

### Responsive Breakpoints

| Breakpoint | Layout Changes              |
| ---------- | --------------------------- |
| < 640px    | Stack all, hide stats chart |
| 640-1024px | 2-column grid               |
| > 1024px   | Full layout with sidebar    |

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

1. **PhaseProgress**: Renders phases, handles click, shows active state
2. **SessionForm**: Validates inputs, submits data, handles errors
3. **PainTrendChart**: Renders sparkline, calculates trend direction
4. **SessionCard**: Displays session data, handles actions
5. **Cronograma**: Filters by phase, opens modal, integrates sub-components

### Accessibility Tests

1. Keyboard navigation through phases
2. Focus trap in modal
3. Screen reader announcements for phase changes
4. Color contrast verification

## Implementation Priorities

1. **P0 (Must have)**
   - Phase progress stepper
   - Session form modal
   - Session filtering by phase

2. **P1 (Should have)**
   - Pain trend chart
   - Session statistics
   - Delete confirmation

3. **P2 (Nice to have)**
   - Procedure suggestions autocomplete
   - Session drag-to-reorder
   - Export functionality

## Files to Create/Modify

| File                                                     | Action                           | Priority |
| -------------------------------------------------------- | -------------------------------- | -------- |
| `components/patients/cronograma/PhaseProgress.tsx`       | Create                           | P0       |
| `components/patients/cronograma/SessionForm.tsx`         | Create                           | P0       |
| `components/patients/cronograma/SessionCard.tsx`         | Create                           | P0       |
| `components/patients/cronograma/PainTrendChart.tsx`      | Create                           | P1       |
| `components/patients/cronograma/SessionStatsSummary.tsx` | Create                           | P1       |
| `components/patients/cronograma/index.ts`                | Create                           | P0       |
| `components/patients/Timeline.tsx`                       | Modify (rename to Cronograma)    | P0       |
| `api/patients.ts`                                        | Add updateSession, deleteSession | P0       |
