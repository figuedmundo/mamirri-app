# Tasks: Evaluation 1:N Migration

## Task Checklist

### Phase 1: Foundation

- [x] **1.1** Create `apps/client/src/lib/evaluation-utils.ts` with utility functions
- [x] **1.2** Add unit tests for evaluation utility functions
- [x] **1.3** Update `Evaluation` interface to add `type` field
- [x] **1.4** Update `ClinicalCase` interface: `evaluation` → `evaluations`

### Phase 2: Core Components

- [x] **2.1** Update `EvaluationForm.tsx` (12 usages)
- [x] **2.2** Update `CaseDetailLayout.tsx` (6 usages)
- [x] **2.3** Update `PatientProfile.tsx` (15 usages)
- [x] **2.4** Update `ComparisonBoard.tsx` (2 usages)
- [x] **2.5** Update `PosturogramViewer.tsx` (1 usage)

### Phase 3: Supporting Files

- [x] **3.1** Update `PatientList.tsx` (1 usage)
- [x] **3.2** Update `generateComparisonReport.ts` (5 usages)

### Phase 4: Tests

- [x] **4.1** Update `CaseDetailLayout.test.tsx` mock data
- [x] **4.2** Update `PosturogramViewer.test.tsx` mock data
- [x] **4.3** Update `EvaluationForm.test.tsx` mock data
- [x] **4.4** Update `ComparisonBoard.test.tsx` mock data
- [x] **4.5** Update `PatientProfile.test.tsx` mock data

### Phase 5: Verification

- [x] **5.1** Run TypeScript build: `pnpm --filter client build`
- [x] **5.2** Run tests: `pnpm --filter client test`
- [x] **5.3** Manual verification of patient flows

## Execution Order

```
1.1 → 1.2 → 1.3 → 1.4 (Foundation - sequential)
    ↓
2.1, 2.2, 2.3, 2.4, 2.5 (Core - can be parallel)
    ↓
3.1, 3.2 (Supporting - can be parallel)
    ↓
4.1-4.5 (Tests - can be parallel)
    ↓
5.1 → 5.2 → 5.3 (Verification - sequential)
```

## Done When

- [ ] TypeScript build passes with no errors related to `evaluation`
- [ ] All existing tests pass
- [ ] New utility function tests pass
- [ ] Manual verification shows:
  - Patient list displays pain levels correctly
  - Evaluation form loads and saves correctly
  - Comparison board compares Initial vs Final
  - PDF export generates correctly
