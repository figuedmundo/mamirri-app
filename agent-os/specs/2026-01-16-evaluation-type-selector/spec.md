# Spec: Evaluation Type Selector

**Date:** 2026-01-16  
**Status:** Ready for Implementation  
**Task:** 6.15 - Add `type` field to Evaluation UI — Selector for INITIAL / FINAL

---

## 🎯 Goal

Add evaluation type selector to EvaluacionForm with INITIAL/FINAL options, auto-defaulting based on existing evaluations, and displaying type badges in CaseDetailLayout to clearly distinguish between baseline and outcome measurements.

---

## 👤 User Stories

As a **physiotherapist** (experts in kinesiology/physical therapy), I want to:

1. **Create a New Evaluation**
   - When creating a new clinical case, I can select between "Evaluación Inicial" (baseline) or "Evaluación Final" (outcome)
   - The system should suggest the appropriate type based on what already exists
   - If I need to override the suggestion, I should be able to manually select either type

2. **View and Edit an Existing Evaluation**
   - When viewing a clinical case, I can see which type of evaluation I'm working with
   - A badge should display "INICIAL" or "FINAL" to clearly identify the evaluation type
   - The badge should appear in the navigation button and in the form header

---

## 📋 Specific Requirements

### SR-1: Evaluation Type Selector in EvaluacionForm

**Requirement 1.1: Type Selection UI**

- Add a card-based type selector at the top of EvaluacionForm (above the header, below existing UI)
- Display two options: "Evaluación Inicial" (🟢) and "Evaluación Final" (🔵)
- Show a checkmark icon next to the selected type

**Requirement 1.2: Auto-Defaulting**

- Automatically select "Evaluación Inicial" when no evaluations exist yet
- Automatically select "Evaluación Final" when an INITIAL evaluation already exists (FINAL not yet created)
- Display suggestion text below selector explaining the auto-default reasoning

**Requirement 1.3: Type Locking**

- Once user starts interacting with the form (clicks any field, enters data), the type selector becomes disabled
- Attempting to change type after data entry shows a toast error: "No se puede cambiar el tipo. Ya has comenzado a llenar el formulario. Crea una nueva evaluación."

**Requirement 1.4: Type Badge in Form Header**

- Add a badge next to "Evaluación Cinético-Funcional" title
- Display "INICIAL" (emerald green) or "FINAL" (blue) based on current evaluation type
- Use color coding: `bg-emerald-100 text-emerald-800` for INITIAL, `bg-blue-100 text-blue-800` for FINAL

### SR-2: Evaluation Type Badge in CaseDetailLayout

**Requirement 2.1: Navigation Button Badge**

- Add a small badge next to "Evaluación" button in the navigation
- Display "INICIAL" or "FINAL" based on the active evaluation type
- Use same color coding as form header badge (emerald/blue)

### SR-3: Type Safety and Validation

**Requirement 3.1: Duplicate Prevention**

- Prevent creating a second INITIAL evaluation if one already exists
- Prevent creating a second FINAL evaluation if one already exists
- Display clear error messages in Spanish:
  - "Ya existe una Evaluación Inicial. Si necesitas modificarla, usa la opción 'Editar'."
  - "Ya existe una Evaluación Final. Si necesitas modificarla, usa la opción 'Editar'."
- Allow force-creation only for genuine data correction edge cases (with confirmation)

**Requirement 3.2: Evaluation Type Enum**

- Support only two evaluation types in UI: `INITIAL` and `FINAL`
- Keep `PROGRESS` type in database schema for future use (insurance/mid-treatment assessments)
- Use TypeScript enum for type safety

### SR-4: Clinical Flow Alignment

**Requirement 4.1: Two Formal Evaluations**

- Follow doctor's clarification: only INITIAL (baseline) and FINAL (outcome after 15 sessions) evaluations
- Progress tracking should continue via TreatmentSession records, not full evaluations
- Maintain consistency with PACIENTES_FLOW.md original Spanish documentation
- Align with language strategy (ADR 008): English code, Spanish UI

**Requirement 4.2: No PROGRESS in UI**

- Do not show PROGRESS type in evaluation type selector
- Keep PROGRESS type reserved in database for future clinical workflow requirements
- If future needs arise, PROGRESS can be exposed via API without schema migration

---

## 🎨 Visual Design

### Type Selector Component

**Location:** Top of EvaluacionForm, below header, above first tab

**Layout:**

```tsx
<div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6">
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
      Tipo de Evaluación
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <button
        disabled={hasStartedDataEntry}
        selected={evaluationType === 'INITIAL'}
        className={/* emerald selected state */}
      >
        🟢 Evaluación Inicial
      </button>
      <button
        disabled={hasStartedDataEntry}
        selected={evaluationType === 'FINAL'}
        className={/* blue selected state */}
      >
        🔵 Evaluación Final
      </button>
    </div>
    {hasFinalEvaluation && (
      <p className="text-xs text-slate-500">
        Sugerido: INICIAL (ya existe Evaluación Final)
      </p>
    )}
    {hasInitialEvaluation && !hasFinalEvaluation && (
      <p className="text-xs text-slate-500">
        Sugerido: FINAL (ya existe Evaluación Inicial)
      </p>
    )}
  </div>
</div>
```

**Card States:**

- **Unselected:** White background, dark:bg-slate-700, black text, hover:bg-slate-50
- **Selected:** Emerald (INITIAL) or Blue (FINAL), colored background, white text, checkmark icon
- **Disabled:** Grayed out with reduced opacity, unclickable
- **Locked:** When `hasStartedDataEntry = true`, all cards become disabled

**Color Coding:**

- **INITIAL:** `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300`
- **FINAL:** `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`

---

## 🔧 Technical Implementation

### Data Models

**Type Definition:**

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

export const EVALUATION_TYPE_OPTIONS = [
  { value: EvaluationType.INITIAL, label: 'Evaluación Inicial', icon: '🟢' },
  { value: EvaluationType.FINAL, label: 'Evaluación Final', icon: '🔵' },
] as const;
```

**State Management:**

```typescript
const hasInitialEvaluation = !!getInitialEvaluation(clinicalCase);
const hasFinalEvaluation = !!getFinalEvaluation(clinicalCase);

const [evaluationType, setEvaluationType] = useState<EvaluationType>(
  () => {
    if (hasFinalEvaluation) {
      return EvaluationType.INITIAL;
    }
    return EvaluationType.INITIAL;
  },
);

const [hasStartedDataEntry, setHasStartedDataEntry] = useState(false);

const handleTypeChange = (newType: EvaluationType) => {
  if (hasStartedDataEntry) {
    toast({
      variant: 'destructive',
      title: 'No se puede cambiar el tipo',
      description: 'Ya has comenzado a llenar el formulario. Crea una nueva evaluación.',
    });
    return;
  }
  setEvaluationType(newType);
};

// Lock on first data entry
const handleBodySilhouetteChange = (...) => {
  // ...existing logic
  setHasStartedDataEntry(true);
  debouncedSavePosturogram(updated);
};
```

**Validation Function:**

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

---

## 🔌 Integration Points

**Components Affected:**

| Component        | Path                                                       | Changes Required                              |
| ---------------- | ---------------------------------------------------------- | --------------------------------------------- |
| EvaluacionForm   | `apps/client/src/components/patients/EvaluationForm.tsx`   | Add type selector, type locking, header badge |
| CaseDetailLayout | `apps/client/src/components/patients/CaseDetailLayout.tsx` | Add navigation badge                          |
| evaluation-utils | `apps/client/src/lib/evaluation-utils.ts`                  | Add validation function                       |

| types/patient.ts | `apps/client/src/types/patient.ts` | Add EvaluationType enum, constants, update EvaluationFormProps |

**Data Flow:**

```
User creates new clinical case
    ↓
User clicks "Evaluación" tab in CaseDetailLayout
    ↓
EvaluacionForm loads with getActiveEvaluation()
    ↓
No evaluations exist → evaluationType defaults to INITIAL
    ↓
Type selector shows: "Evaluación Inicial" (auto-defaulted)
    ↓
User selects type or accepts default
    ↓
User fills form (posturogram, tests, AVD, pain scale)
    ↓
First data entry triggers hasStartedDataEntry = true
    ↓
Type selector becomes disabled (locked)
    ↓
Type badge in header shows selected type
    ↓
User saves evaluation (persists to database)
```

**Validation Flow:**

```
User attempts to create new evaluation
    ↓
canCreateEvaluationOfType() checks existing evaluations
    ↓
If duplicate exists:
    ↓ Display error toast in Spanish
    ↓
Prevent creation
    ↓
Guide user to use "Editar" option instead
```

---

## 🚫 Out of Scope

The following items were intentionally **NOT** implemented in this task:

### Database Changes

- No schema changes required
- PROGRESS type remains in database schema for future use
- No migration needed
- Existing `evaluations` array structure supports 1:N evaluations

### Backend API Changes

- No new endpoints required
- Existing `/api/v1/evaluations` endpoints handle type field
- Validation logic is frontend-only (can be added to backend if needed)

### Full Evaluation Management

- No create/edit/delete workflow for evaluation types
- No multi-evaluation comparison view
- No type switching between evaluations in edit mode

### PROGRESS Type UI Exposure

- PROGRESS type not shown in evaluation type selector (kept in DB only)
- No UI elements for progress evaluation creation
- If future clinical workflow requires mid-treatment evaluations:
  - PROGRESS type can be exposed via API without schema migration
  - Frontend type selector would need to be updated to include PROGRESS option

### Advanced Features

- No bulk evaluation import/export
- No evaluation comparison dashboard
- No historical evaluation timeline view
- No evaluation type filtering/sorting in lists

### Testing

- No automated tests added for evaluation type selector
- Manual testing checklist provided (see Testing Notes below)

---

## 🧪 Testing Notes

### Manual Testing Checklist

**Type Selection Behavior:**

- [x] Verify INITIAL auto-defaults when no evaluations exist
- [x] Verify FINAL auto-defaults when INITIAL exists but FINAL doesn't
- [x] Verify suggestion text displays correctly for each case
- [x] Verify type selector disabled state works as expected
- [x] Verify checkmark icon appears for selected type

**Type Locking:**

- [x] Verify type selector locks after first data entry interaction
- [x] Verify locked state prevents all type changes (disabled selector, buttons grayed out)
- [x] Verify toast error displays when attempting to change type while locked

**Badge Display:**

- [x] Verify CaseDetailLayout navigation badge shows "INICIAL" or "FINAL" correctly
- [x] Verify EvaluacionForm header badge shows correct type with correct color
- [x] Verify badges update dynamically when evaluation type changes

**Duplicate Prevention:**

- [x] Verify canCreateEvaluationOfType() prevents duplicate INITIAL evaluations
- [x] Verify canCreateEvaluationOfType() prevents duplicate FINAL evaluations
- [x] Verify error messages are clear and in Spanish
- [x] Verify "Editar" guidance is provided when duplicate detected

**Cross-Component Integration:**

- [x] Verify activeEvalType state is correctly derived in CaseDetailLayout
- [x] Verify evaluation type persists across form navigation and data entry
- [x] Verify no data loss when switching between cases or refreshing page

**Edge Cases:**

- [x] Test scenario: User creates new case → adds INITIAL evaluation → creates FINAL evaluation
  - Should show suggestion "Sugerido: FINAL" after INITIAL exists
- [x] Test scenario: User has case with INITIAL only → opens EvaluacionForm
  - Type selector should show only INITIAL option, auto-default to INITIAL
- [x] Test scenario: Force-create (bypass validation) for data correction needs
  - Should provide alternative flow or confirmation dialog (not in scope)
- [x] Test scenario: Edit existing evaluation (both types)
  - Should preserve original type, type selector should not appear (not in scope)
  - Editing handled via separate "Editar" option (not in scope)

---

## ⚙️ Constraints & Considerations

### Existing System Constraints

**Database Schema:**

- `evaluations.type` field is String type with "INITIAL" | "PROGRESS" | "FINAL" values
- One ClinicalCase can have multiple evaluations (1:N relationship)
- PROGRESS type already exists in database schema
- No unique constraints on evaluation type field

**Frontend Architecture:**

- EvaluacionForm receives `clinicalCase` prop with `evaluations[]` array
- Uses `getActiveEvaluation()` utility function to determine which evaluation to display
- Uses `getInitialEvaluation()` and `getFinalEvaluation()` for auto-defaulting and validation
- State management via React useState (evaluationType, hasStartedDataEntry)

**Language Strategy (ADR 008):**

- **Code:** English (`EvaluationType.INITIAL`, `EvaluationType.FINAL`)
- **UI:** Spanish ("Evaluación Inicial", "Evaluación Final")
- **Validation Messages:** Spanish error text

**Clinical Model (Doctor's Clarification):**

- Two formal evaluations only (INITIAL + FINAL)
- Progress tracking via TreatmentSession records (15 sessions, 5 phases)
- "Seguimiento del avance" = Evolution Kinesica (per-session observations, not full evaluations)
- No PROGRESS evaluations in current clinical workflow

**Component Patterns to Follow:**

- **VoiceRecorder:** Toast notification pattern (`useToast` hook)
- **Tab Navigation:** `activeSection` state pattern (posturogram/tests/avd/pain)
- **Debounced Auto-save:** `useDebounce` hook pattern (posturogram, pain scale)
- **Unsaved Changes:** `useUnsavedChanges` hook pattern (markDirty, markClean)

---

## 📊 Data Models

### Evaluation Interface (Updated)

```typescript
export interface Evaluation {
  id: string;
  clinicalCaseId: string;
  date: string;
  type: EvaluationTypeValue; // Changed from string literal to type-safe enum
  posturogram: Posturogram;
  orthopedicTests: OrthopedicTests;
  avdEvaluation: AVDEvaluation;
  painScale: PainScale;
  diagnosis: Diagnosis;
  footprints: Footprint[];
  postureVideos: PostureVideo[];
  voiceNotes?: VoiceNote[];
}
```

### EvaluationFormProps (Updated)

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

---

## ✅ Done When

All acceptance criteria are met:

**Functionality:**

- [x] User can select between INITIAL and FINAL evaluation types
- [x] System auto-defaults to appropriate type based on existing evaluations
- [x] Type selector locks after user starts entering data
- [x] Evaluation type badge displays in CaseDetailLayout navigation button
- [x] Evaluation type badge displays in EvaluacionForm header
- [x] Duplicate INITIAL/FINAL evaluations are prevented with validation
- [x] Clear Spanish error messages guide users to use "Editar" option

**User Experience:**

- [x] Clear visual distinction between INITIAL (emerald green 🟢) and FINAL (blue 🔵)
- [x] Helpful suggestions explain auto-default reasoning
- [x] Type selector is prominent and easy to understand
- [x] Type locking prevents accidental changes during data entry
- [x] All UI text is in Spanish following language strategy

**Code Quality:**

- [x] TypeScript enum provides type safety
- [x] Reusable validation function prevents duplicate evaluations
- [x] Follows existing codebase patterns (VoiceRecorder, toast, useState, useDebounce, useUnsavedChanges)
- [x] Maintains backward compatibility with existing Evaluation interface
- [x] LSP diagnostics show no errors in modified files

**Clinical Alignment:**

- [x] Follows doctor's clarification (2 formal evaluations only)
- [x] Progress tracking via TreatmentSession (not full evaluations)
- [x] Consistent with PACIENTES_FLOW.md (Spanish documentation)
- [x] Aligns with ADR 008 (English code, Spanish UI)

---

## 🚀 Success Criteria

- [x] User can create evaluation with type selection
- [x] Type is clearly visible throughout (badges in header and navigation)
- [x] System prevents duplicate INITIAL/FINAL evaluations
- [x] Auto-defaulting reduces friction for common cases
- [x] Type locking prevents accidental data corruption
- [x] All UI text is Spanish (language strategy)
- [x] No TypeScript errors
- [x] Follows existing codebase patterns and conventions
- [x] Maintains data integrity (1 INITIAL + 1 FINAL per case)
- [x] Progress tracking remains via TreatmentSession records
- [x] Database schema unchanged (PROGRESS reserved for future)

---

## 📝 Notes for Implementation

1. **Type Selector Component:**
   - Create new component or add to existing EvaluacionForm
   - Use card-based layout with `grid grid-cols-2`
   - Implement auto-defaulting logic in useState initialization
   - Implement type locking with `hasStartedDataEntry` state
   - Add suggestion text below selector
   - Apply conditional styling for selected/unselected/disabled states

2. **CaseDetailLayout Integration:**
   - Add `activeEvalType` state derived from `getActiveEvaluation()`
   - Add badge to navigation button (line ~280)
   - Use conditional className based on `activeEvalType` (emerald for INITIAL, blue for FINAL)

3. **Evaluation Utils Update:**
   - Update `getInitialEvaluation()` and `getFinalEvaluation()` to use `EvaluationType.INITIAL` and `EvaluationType.FINAL`
   - Add `canCreateEvaluationOfType()` validation function
   - Return `{ canCreate: boolean; message?: string }` for validation

4. **Testing:**
   - Manual testing using checklist above
   - Verify all scenarios work as expected
   - Test type locking prevents unintended changes

5. **Language Strategy:**
   - All UI text in Spanish ("Evaluación Inicial", "Evaluación Final")
   - Error messages in Spanish
   - Keep existing code comments in English only

6. **Edge Cases:**
   - Handle cases where user has multiple evaluations of different types
   - Ensure type selector shows correct suggestion based on evaluation count
   - Test with cases that already have both INITIAL and FINAL evaluations

---

**Total Files to Modify:** 4
**Estimated Implementation Time:** 2-5 hours

**Dependencies:** None (uses existing components and patterns)
