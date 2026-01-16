# Spec: Evaluation 1:N Migration

## Overview

Migrate the frontend `ClinicalCase` type from using singular `evaluation: Evaluation` to plural `evaluations: Evaluation[]` to match the database schema and support the clinical model requiring Initial, Progress, and Final evaluations.

## Problem Statement

The Prisma schema (line 69) correctly defines:

```prisma
evaluations         Evaluation[]
```

But the frontend TypeScript type (line 251) incorrectly uses:

```typescript
evaluation: Evaluation;
```

This prevents proper handling of the doctor's clinical model which requires:

- **Evaluación Inicial**: Comprehensive baseline at treatment start
- **Evaluación Final**: Comprehensive evaluation after 15-session intervention
- **Evolución Progress**: Optional mid-treatment evaluations

## Affected Files

Based on grep analysis, **9 files** need updates:

| File                                                        | Usages          | Priority |
| ----------------------------------------------------------- | --------------- | -------- |
| `apps/client/src/types/patient.ts`                          | Type definition | P0       |
| `apps/client/src/components/patients/EvaluationForm.tsx`    | 12 usages       | P0       |
| `apps/client/src/components/patients/CaseDetailLayout.tsx`  | 6 usages        | P0       |
| `apps/client/src/components/patients/PatientProfile.tsx`    | 15 usages       | P0       |
| `apps/client/src/components/patients/ComparisonBoard.tsx`   | 2 usages        | P0       |
| `apps/client/src/components/patients/PosturogramViewer.tsx` | 1 usage         | P0       |
| `apps/client/src/components/patients/PatientList.tsx`       | 1 usage         | P1       |
| `apps/client/src/lib/pdf/generateComparisonReport.ts`       | 5 usages        | P1       |
| `apps/client/src/components/patients/*.test.tsx`            | Test mocks      | P2       |

## Technical Design

### 1. Type Changes (`types/patient.ts`)

```typescript
// ADD: Evaluation type field (matches Prisma)
export interface Evaluation {
  id: string;
  clinicalCaseId: string;
  date: string;
  type: 'INITIAL' | 'PROGRESS' | 'FINAL'; // ADD THIS
  posturogram: Posturogram;
  orthopedicTests: OrthopedicTests;
  avdEvaluation: AVDEvaluation;
  painScale: PainScale;
  diagnosis: Diagnosis;
  footprints: Footprint[];
  postureVideos: PostureVideo[];
  voiceNotes?: VoiceNote[];
}

// CHANGE: ClinicalCase interface
export interface ClinicalCase {
  // ... other fields ...
  evaluations: Evaluation[]; // CHANGE FROM: evaluation: Evaluation
  // ... other fields ...
}
```

### 2. Utility Functions (`lib/evaluation-utils.ts`)

```typescript
import type { ClinicalCase, Evaluation } from '../types/patient';

/**
 * Get the initial evaluation from a clinical case.
 * Falls back to first evaluation if no INITIAL type found.
 */
export function getInitialEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  return (
    clinicalCase.evaluations.find((e) => e.type === 'INITIAL') ||
    clinicalCase.evaluations[0]
  );
}

/**
 * Get the final evaluation from a clinical case.
 */
export function getFinalEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  return clinicalCase.evaluations.find((e) => e.type === 'FINAL');
}

/**
 * Get the most recent evaluation from a clinical case.
 */
export function getLatestEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  if (clinicalCase.evaluations.length === 0) return undefined;
  return [...clinicalCase.evaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
}

/**
 * Get the active/working evaluation (latest or initial if none).
 */
export function getActiveEvaluation(
  clinicalCase: ClinicalCase,
): Evaluation | undefined {
  return (
    getLatestEvaluation(clinicalCase) || getInitialEvaluation(clinicalCase)
  );
}
```

### 3. Component Update Pattern

Each component accessing `clinicalCase.evaluation` should be updated to use utility functions:

**Before:**

```typescript
const painLevel = clinicalCase.evaluation?.painScale?.activity || 0;
```

**After:**

```typescript
import { getActiveEvaluation } from '../../lib/evaluation-utils';

const evaluation = getActiveEvaluation(clinicalCase);
const painLevel = evaluation?.painScale?.activity || 0;
```

### 4. ComparisonBoard Special Case

The ComparisonBoard needs both Initial and Final:

```typescript
import {
  getInitialEvaluation,
  getFinalEvaluation,
} from '../../lib/evaluation-utils';

export function ComparisonBoard({
  clinicalCase,
  onExport,
}: ComparisonBoardProps) {
  const initialEval = getInitialEvaluation(clinicalCase);
  const finalEval = getFinalEvaluation(clinicalCase);

  const initialFootprint = initialEval?.footprints.find(
    (f) => f.type === 'initial',
  );
  const finalFootprint =
    finalEval?.footprints.find((f) => f.type === 'final') ||
    initialEval?.footprints.find((f) => f.type === 'final'); // fallback

  // ... rest of component
}
```

### 5. API Layer Compatibility

The API layer should already return evaluations as an array (matching Prisma). Verify in `apps/client/src/api/patients.ts` that responses are properly typed.

## Implementation Tasks

### Task 1: Create Utility Functions

- [ ] Create `apps/client/src/lib/evaluation-utils.ts`
- [ ] Add `getInitialEvaluation()`, `getFinalEvaluation()`, `getLatestEvaluation()`, `getActiveEvaluation()`
- [ ] Add unit tests for utility functions

### Task 2: Update Type Definition

- [ ] Update `ClinicalCase.evaluation` → `ClinicalCase.evaluations` in `types/patient.ts`
- [ ] Add `type: 'INITIAL' | 'PROGRESS' | 'FINAL'` to `Evaluation` interface

### Task 3: Update EvaluationForm

- [ ] Import utility functions
- [ ] Replace all `clinicalCase.evaluation` with `getActiveEvaluation(clinicalCase)`
- [ ] Handle case where no evaluation exists (create new)

### Task 4: Update CaseDetailLayout

- [ ] Import utility functions
- [ ] Replace all `localCase.evaluation` with utility function calls
- [ ] Update `handleSaveEvaluation` to work with evaluations array

### Task 5: Update PatientProfile

- [ ] Import utility functions
- [ ] Replace all `activeCase.evaluation` with utility function calls
- [ ] Update save handlers

### Task 6: Update ComparisonBoard

- [ ] Import utility functions
- [ ] Use `getInitialEvaluation` and `getFinalEvaluation` for comparison
- [ ] Handle missing evaluations gracefully

### Task 7: Update PosturogramViewer

- [ ] Import utility functions
- [ ] Replace `clinicalCase.evaluation.posturogram` with utility function

### Task 8: Update PatientList

- [ ] Import utility functions
- [ ] Replace `activeCase?.evaluation?.painScale` with utility function

### Task 9: Update PDF Generator

- [ ] Import utility functions
- [ ] Replace all `clinicalCase.evaluation` usages

### Task 10: Update Test Mocks

- [ ] Update all test files to provide `evaluations: Evaluation[]` instead of `evaluation: Evaluation`
- [ ] Add `type` field to mock evaluations

## Verification

### Build Check

```bash
pnpm --filter client build
```

### Test Check

```bash
pnpm --filter client test
```

### Manual Verification

1. Open patient list → verify pain levels display
2. Open patient profile → verify evaluation data displays
3. Open case detail → verify timeline and evaluation form work
4. Open comparison board → verify Initial vs Final comparison works

## Rollback Plan

If issues arise:

1. Revert type changes in `types/patient.ts`
2. Revert utility function imports in components
3. The database already supports 1:N, so no backend changes needed

## Dependencies

- None. This is a frontend-only change.
- Database already supports 1:N (Prisma schema line 69)
- Backend API should already return evaluations array

## Estimated Effort

| Task                        | Estimate     |
| --------------------------- | ------------ |
| Task 1: Utility Functions   | 15 min       |
| Task 2: Type Definition     | 5 min        |
| Task 3-9: Component Updates | 45 min       |
| Task 10: Test Updates       | 30 min       |
| Verification                | 15 min       |
| **Total**                   | **~2 hours** |
