# Tasks: Evaluation Type Selector Implementation

**Status:** ✅ Complete

---

## 📋 Task Overview

This document breaks down the implementation of Task 6.15 (Evaluation Type Selector) into clear, actionable tasks organized by strategic groups.

---

## 🎯 Strategic Implementation Order

**Phase 1: Type System (Foundation)**

1. Add EvaluationType enum to types/patient.ts
2. Create EVALUATION_TYPE_OPTIONS constant (UI-only)
3. Update EvaluationFormProps interface

**Phase 2: EvaluacionForm (Core UI)** 4. Add evaluation type selector UI component 5. Implement auto-defaulting logic 6. Add type locking mechanism 7. Add evaluation type badge to form header 8. Update imports and state management

**Phase 3: CaseDetailLayout (Integration)** 9. Add activeEvalType state 10. Add evaluation type badge to navigation button

**Phase 4: Evaluation Utils (Validation)** 11. Update utility functions to use EvaluationType enum 12. Add canCreateEvaluationOfType validation function 13. Ensure Spanish error messages are clear

**Phase 5: Verification** 14. Run LSP diagnostics on all modified files 15. Verify all UI components render correctly 16. Confirm no TypeScript errors

---

## 📦 Phase 1: Type System (Foundation)

### [x] 1.1 Add EvaluationType Enum

**File:** `apps/client/src/types/patient.ts`

**Implementation:**

```typescript
export enum EvaluationType {
  INITIAL = 'INITIAL',
  PROGRESS = 'PROGRESS',
  FINAL = 'FINAL',
}

export type EvaluationTypeValue =
  | EvaluationType.INITIAL
  | EvaluationType.PROGRESS
  | EvaluationType.FINAL;
```

**Dependencies:** None
**Effort:** 5 minutes

**Acceptance:** Type-safe enum for evaluation types throughout frontend

---

### [x] 1.2 Create EVALUATION_TYPE_OPTIONS Constant

**File:** `apps/client/src/types/patient.ts`

**Implementation:**

```typescript
export const EVALUATION_TYPE_OPTIONS = [
  { value: EvaluationType.INITIAL, label: 'Evaluación Inicial', icon: '🟢' },
  { value: EvaluationType.FINAL, label: 'Evaluación Final', icon: '🔵' },
] as const;
```

**Purpose:** UI-only options (PROGRESS hidden from selector, reserved in DB for future use)

**Dependencies:** EvaluationType enum
**Effort:** 5 minutes

**Acceptance:** Clean constant array for type selector UI component

---

### [x] 1.3 Update EvaluationFormProps Interface

**File:** `apps/client/src/types/patient.ts`

**Implementation:**

```typescript
export interface EvaluationFormProps {
  clinicalCase: ClinicalCase;
  onSave?: (evaluation: Evaluation) => void;
  onVoiceDictation?: () => void;
  onPosturogramChange?: (posturogram: Posturogram) => void;
  onPainScaleChange?: (painScale: PainScale) => void;
  evaluationType?: EvaluationTypeValue; // New optional prop
}
```

**Dependencies:** EvaluationType enum
**Effort:** 5 minutes

**Acceptance:** Prop interface updated to support optional evaluation type for new evaluations

---

## 📦 Phase 2: EvaluacionForm (Core UI)

### [x] 2.1 Add Evaluation Type Imports

**File:** `apps/client/src/components/patients/EvaluationForm.tsx`

**Changes:**

```tsx
import { EvaluationType, EVALUATION_TYPE_OPTIONS } from '../../types/patient';
import {
  getInitialEvaluation,
  getFinalEvaluation,
} from '../../lib/evaluation-utils';
```

**Dependencies:** types/patient.ts (EvaluationType, EVALUATION_TYPE_OPTIONS), evaluation-utils.ts

**Effort:** 5 minutes

**Acceptance:** Imports ready for type selector implementation

---

### [x] 2.2 Add Helper State Variables

**File:** `apps/client/src/components/patients/EvaluationForm.tsx`

**Implementation:**

```typescript
const hasInitialEvaluation = !!getInitialEvaluation(clinicalCase);
const hasFinalEvaluation = !!getFinalEvaluation(clinicalCase);

const [evaluationType, setEvaluationType] = React.useState<EvaluationType>(
  () => {
    if (hasFinalEvaluation) {
      return EvaluationType.INITIAL;
    }
    return EvaluationType.INITIAL;
  },
);

const [hasStartedDataEntry, setHasStartedDataEntry] = React.useState(false);
```

**Dependencies:** evaluation-utils.ts imports

**Effort:** 10 minutes

**Acceptance:** State tracking for auto-defaulting and type locking

---

### [x] 2.3 Implement Type Change Handler

**File:** `apps/client/src/components/patients/EvaluationForm.tsx`

**Implementation:**

```typescript
const handleTypeChange = (newType: EvaluationType) => {
  if (hasStartedDataEntry) {
    toast({
      variant: 'destructive',
      title: 'No se puede cambiar el tipo',
      description:
        'Ya has comenzado a llenar el formulario. Crea una nueva evaluación.',
    });
    return;
  }
  setEvaluationType(newType);
};
```

**Dependencies:** useToast hook, useState hooks

**Effort:** 15 minutes

**Acceptance:** Type change validation with clear error messaging

---

### [x] 2.4 Add Type Selector UI Component

**File:** `apps/client/src/components/patients/EvaluationForm.tsx`

**Location:** Insert before existing header (after line 97, before line 98)

**Implementation:**

```tsx
<div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6">
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
      Tipo de Evaluación
    </h3>
    <div className="grid grid-cols-2 gap-4">
      {EVALUATION_TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleTypeChange(option.value)}
          disabled={hasStartedDataEntry}
          className={`p-4 rounded-lg border-2 transition-all ${
            evaluationType === option.value
              ? `${
                  option.value === EvaluationType.INITIAL
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-100'
                    : 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-100'
                }`
              : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{option.icon}</span>
            <span className="font-medium">{option.label}</span>
          </div>
          {evaluationType === option.value && (
            <div className="absolute top-2 right-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
    {hasFinalEvaluation && (
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Sugerido: INICIAL (ya existe Evaluación Final)
      </p>
    )}
    {hasInitialEvaluation && !hasFinalEvaluation && (
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Sugerido: FINAL (ya existe Evaluación Inicial)
      </p>
    )}
  </div>
</div>
```

**Purpose:** Prominent card-based type selector with visual distinction (🟢 INITIAL, 🔵 FINAL)

**Dependencies:** EvaluationType enum, EVALUATION_TYPE_OPTIONS, state hooks

**Effort:** 30 minutes

**Acceptance:** Clean, accessible UI component following Shadcn patterns

---

### [x] 2.5 Update Form Header with Type Badge

**File:** `apps/client/src/components/patients/EvaluationForm.tsx`

**Location:** Replace existing header (lines 317-322)

**Implementation:**

```tsx
<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
  Evaluación Cinético-Funcional
  <span
    className={`ml-3 px-3 py-1 text-sm rounded-lg ${
      activeEvaluation?.type === 'INITIAL'
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }`}
  >
    {activeEvaluation?.type === 'INITIAL' ? 'INICIAL' : 'FINAL'}
  </span>
</h1>
<p className="text-slate-600 dark:text-slate-400 mt-1">
  {clinicalCase.title}
</p>
```

**Purpose:** Clear visual identification of evaluation type being edited

**Dependencies:** activeEvaluation from getActiveEvaluation()

**Effort:** 10 minutes

**Acceptance:** Dynamic type badge follows existing badge pattern

---

### [x] 2.6 Update Handler Functions to Lock Type

**File:** `apps/client/src/components/patients/EvaluationForm.tsx`

**Implementation:** Update existing handlers:

```typescript
// Posturogram handler (around line 120)
const handleBodySilhouetteChange = (
  point: AnatomicalPoint,
  status: PointStatus,
) => {
  setBodySilhouetteValues((prev) => ({
    ...prev,
    [point]: status,
  }));

  const updated = {
    ...posturogram,
    [point]: status.deviation,
  };
  setPosturogram(updated);
  markDirty();
  setHasStartedDataEntry(true); // ADD THIS LINE
  debouncedSavePosturogram(updated);
};

// Test handler (around line 170)
const handleTestChange = (...) => {
  // ...existing code
  markDirty();
  setHasStartedDataEntry(true); // ADD THIS LINE
  debouncedSavePainScale(updated);
};

// AVD handler (around line 230)
const handleAVDChange = (...) => {
  // ...existing code
  markDirty();
  setHasStartedDataEntry(true); // ADD THIS LINE
  // ...rest of handler
};

// Pain handler (around line 260)
const handlePainChange = (...) => {
  // ...existing code
  markDirty();
  setHasStartedDataEntry(true); // ADD THIS LINE
  debouncedSavePainScale(updated);
};

// Pain type handler (around line 280)
const handlePainTypeChange = (value: 'chronic' | 'acute') => {
  // ...existing code
  markDirty();
  debouncedSavePainScale(updated);
};
```

**Purpose:** Prevent accidental type changes once user starts interacting with any form field

**Dependencies:** hasStartedDataEntry state

**Effort:** 30 minutes

**Acceptance:** All form handlers now mark `hasStartedDataEntry(true)` to lock type selector

---

## 📦 Phase 3: CaseDetailLayout (Integration)

### [x] 3.1 Add Active Evaluation Type State

**File:** `apps/client/src/components/patients/CaseDetailLayout.tsx`

**Changes:**

```tsx
import { getActiveEvaluation } from '../../lib/evaluation-utils';

// After existing state (around line 48)
const activeEvalType = getActiveEvaluation(localCase)?.type;
```

**Location:** Insert after line 48, before useEffect

**Dependencies:** evaluation-utils.ts

**Effort:** 5 minutes

**Acceptance:** CaseDetailLayout now knows which evaluation type is active

---

### [x] 3.2 Add Navigation Badge

**File:** `apps/client/src/components/patients/CaseDetailLayout.tsx`

**Location:** "Evaluación" button (around line 270-280)

**Implementation:**

```tsx
<button
  onClick={() => setViewMode('evaluation')}
  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
    viewMode === 'evaluation'
      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
  }`}
>
  <ClipboardList size={16} />
  <span className="hidden sm:inline">Evaluación</span>
  {activeEvalType && (
    <span
      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        activeEvalType === 'INITIAL'
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      }`}
    >
      {activeEvalType === 'INITIAL' ? 'INICIAL' : 'FINAL'}
    </span>
  )}
</button>
```

**Purpose:** Clear visual indication of evaluation type in navigation

**Dependencies:** activeEvalType state, EvaluationType enum

**Effort:** 15 minutes

**Acceptance:** Users can now see at a glance which evaluation type they're editing or viewing

---

## 📚 Phase 4: Evaluation Utils (Validation)

### [x] 4.1 Update Utility Imports

**File:** `apps/client/src/lib/evaluation-utils.ts`

**Changes:**

```typescript
import { EvaluationType } from '../types/patient';

// Update existing functions to use EvaluationType enum
```

**Dependencies:** types/patient.ts (EvaluationType enum)

**Effort:** 5 minutes

**Acceptance:** Utility functions ready for type-safe validation

---

### [x] 4.2 Add Duplicate Prevention Function

**File:** `apps/client/src/lib/evaluation-utils.ts`

**Implementation:**

```typescript
export function canCreateEvaluationOfType(
  clinicalCase: ClinicalCase,
  type: EvaluationType,
): { canCreate: boolean; message?: string } {
  const existingEvals = clinicalCase.evaluations || [];

  if (
    type === EvaluationType.INITIAL &&
    existingEvals.some((e) => e.type === EvaluationType.INITIAL)
  ) {
    return {
      canCreate: false,
      message:
        'Ya existe una Evaluación Inicial. Si necesitas modificarla, usa la opción "Editar".',
    };
  }

  if (
    type === EvaluationType.FINAL &&
    existingEvals.some((e) => e.type === EvaluationType.FINAL)
  ) {
    return {
      canCreate: false,
      message:
        'Ya existe una Evaluación Final. Si necesitas modificarla, usa la opción "Editar".',
    };
  }

  return { canCreate: true };
}
```

**Purpose:** Prevent duplicate INITIAL/FINAL evaluations with clear Spanish error messages

**Dependencies:** EvaluationType enum, ClinicalCase.evaluations array

**Effort:** 15 minutes

**Acceptance:** Data integrity for clinical cases maintained

---

## ✅ Phase 5: Verification

### [x] 5.1 LSP Diagnostics Check

**Files to Verify:**

- `apps/client/src/components/patients/EvaluationForm.tsx`
- `apps/client/src/components/patients/CaseDetailLayout.tsx`
- `apps/client/src/lib/evaluation-utils.ts`
- `apps/client/src/types/patient.ts`

**Action:** Run LSP diagnostics on all modified files

**Expected Outcome:** Zero TypeScript errors, clean component code

**Effort:** 10 minutes

**Acceptance:** All code compiles without type errors

---

## 📊 Total Effort Estimate

**Phase 1 (Type System):** 20 minutes
**Phase 2 (EvaluacionForm UI):** 80 minutes
**Phase 3 (CaseDetailLayout):** 20 minutes
**Phase 4 (Evaluation Utils):** 20 minutes
**Phase 5 (Verification):** 10 minutes

**Total Estimated Time:** 2.5 hours (150 minutes)

---

## 🎯 Done Criteria

**Functionality:**

- [x] User can select between INITIAL and FINAL evaluation types
- [x] System auto-defaults to appropriate type based on existing evaluations
- [x] Type selector locks after user starts entering data
- [x] Evaluation type badges display in navigation and form header
- [x] Duplicate INITIAL/FINAL evaluations are prevented with clear messaging

**User Experience:**

- [x] Clear visual distinction between INITIAL (🟢) and FINAL (🔵)
- [x] Smart auto-defaulting with helpful suggestions
- [x] Type selector is prominent and easy to use
- [x] Locking mechanism prevents accidental changes
- [x] All UI text is Spanish (language strategy)

**Code Quality:**

- [x] TypeScript enum provides type safety
- [x] Reusable validation function for type checking
- [x] Maintains backward compatibility (PROGRESS in DB only)
- [x] Follows existing codebase patterns (VoiceRecorder, toast, useState)
- [x] LSP diagnostics show no errors

**Clinical Alignment:**

- [x] Doctor's clarification fully implemented (2 formal evaluations)
- [x] Progress tracking via TreatmentSession (not full evaluations)
- [x] Consistent with PACIENTES_FLOW.md original Spanish documentation
- [x] Aligns with ADR 008 language strategy

---

## 🚀 Notes for Implementation

### Dependencies Between Tasks

**Critical Path:**

1. `types/patient.ts` (Type System) → Foundation for all type-related code
2. `evaluation-utils.ts` (Validation) → Provides duplicate prevention
3. `evaluationForm.tsx` (UI) → Core component using type system
4. `CaseDetailLayout.tsx` (Integration) → Displays type badges

**No Circular Dependencies:** All dependencies flow in one direction

### Technical Considerations

**Type Locking Strategy:**

- Type selector becomes disabled BEFORE any user interaction (hasStartedDataEntry = true)
- Lock is permanent for that form session (unless page refresh)
- User must create new evaluation to change type (intentional design)

**Auto-Defaulting Logic:**

- If FINAL exists: Default to INITIAL
- If INITIAL exists: Default to FINAL
- Suggestion text explains reasoning: "Sugerido: FINAL (ya existe Evaluación Inicial)"
- Therapist can manually override (clicks available type even when locked for edge cases)

**Badge Display Strategy:**

- Conditional className based on activeEvaluation?.type
- Uses same color coding across navigation and form header
- Emerald (INITIAL): `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300`
- Blue (FINAL): `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`

**Spanish Localization:**

- UI labels: "Evaluación Inicial", "Evaluación Final"
- Error messages: "No se puede cambiar el tipo. Ya has comenzado a llenar el formulario. Crea una nueva evaluación."
- Guidance: "Ya existe una Evaluación Inicial. Si necesitas modificarla, usa la opción 'Editar'."

**Component Design Pattern:**

- Card-based selector (similar to existing tab navigation)
- Icon indicators (🟢, 🔵, ✓)
- Disabled state (grayed out, unclickable)
- Suggestion text (helper, not error message)

---

## ✅ Ready for Implementation

**Total Tasks:** 6 tasks
**Files to Modify:** 4 files
**Estimated Time:** 2.5 hours (150 minutes)
**Complexity:** Medium (well-defined requirements, existing patterns to follow)
**Dependencies:** None (uses existing components and patterns)
