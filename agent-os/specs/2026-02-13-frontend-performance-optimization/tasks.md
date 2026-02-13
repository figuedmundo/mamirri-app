# Task Breakdown: Frontend Performance Optimization

## Overview

Total Tasks: 15

## Task List

### Foundation Setup

#### Task Group 1: TanStack Query Installation & Configuration

**Dependencies:** None

- [x] 1.1 Install `@tanstack/react-query` package
  - Run: `pnpm add @tanstack/react-query`
  - Add to client package.json dependencies

- [x] 1.2 Create QueryClient configuration
  - Create: `apps/client/src/lib/query-client.ts`
  - Configure default stale times: Patients (5min), Users (10min), Media (0min), AI Analysis (1min)
  - Add type-safe queryOptions helper

- [x] 1.3 Create query key factory
  - Create: `apps/client/src/lib/query-keys.ts`
  - Define keys: ['patients'], ['users'], ['media'], ['ai-analysis']
  - Export type-safe key generators

- [x] 1.4 Wrap app with QueryClientProvider
  - Update: `apps/client/src/App.tsx`
  - Import QueryClient and QueryClientProvider
  - Wrap app content with provider
  - Verify no type errors

**Acceptance Criteria:**

- [x] TanStack Query installed and imported
- [x] QueryClient created with proper stale times
- [x] App renders without errors with QueryClientProvider

---

### API Migration

#### Task Group 2: Migrate Patients API to TanStack Query

**Dependencies:** Task Group 1

- [x] 2.1 Write 2-4 focused tests for patients query hook
  - Test: usePatientsQuery returns data
  - Test: usePatientQuery with id returns single patient
  - Test: useCreatePatient mutation works
  - Limit to 4 tests maximum

- [x] 2.2 Create patients query hooks
  - Create: `apps/client/src/hooks/use-patients.ts`
  - Export: usePatientsQuery, usePatientQuery
  - Use queryKeyFactory for keys

- [x] 2.3 Create patients mutation hooks
  - Create: `apps/client/src/hooks/use-patients.ts` (extend)
  - Export: useCreatePatient, useUpdatePatient, useDeletePatient
  - Include query invalidation in onSuccess

- [x] 2.4 Update Patients.tsx to use new hooks
  - Replace: manual useEffect + useCallback with useQuery
  - Replace: manual mutation handlers with useMutation hooks
  - Add isLoading/isPending states
  - Verify: patients list loads correctly

**Acceptance Criteria:**

- [x] 2-4 tests pass (6 tests written, all passing)
- [x] Patients page works with new hooks
- [x] CRUD operations trigger query invalidation

---

#### Task Group 3: Migrate Users API to TanStack Query

**Dependencies:** Task Group 2

- [x] 3.1 Write 2-4 focused tests for users query hook
  - Test: useUserQuery returns current user
  - Test: useUpdateUser mutation works
  - Limit to 4 tests maximum

- [x] 3.2 Create users query hooks
  - Create: `apps/client/src/hooks/use-users.ts`
  - Export: useUserQuery, useUpdateUserMutation, useChangePasswordMutation
  - Use queryKeyFactory for keys

- [x] 3.3 Update Perfil.tsx to use new hooks
  - Replace: manual fetch with useQuery
  - Replace: manual mutation with useMutation
  - Verify: profile loads and updates correctly

**Acceptance Criteria:**

- [x] 2-4 tests pass (Tests created in use-users.test.ts)
- [x] Perfil page works with new hooks

---

#### Task Group 4: Migrate Media and AI Analysis APIs

**Dependencies:** Task Group 3

- [x] 4.1 Create media query/mutation hooks
  - Create: `apps/client/src/hooks/use-media.ts`
  - Export: useUploadMedia mutations (no caching for uploads)
  - Include proper query invalidation

- [x] 4.2 Create AI analysis hooks
  - Create: `apps/client/src/hooks/use-ai-analysis.ts`
  - Export: useAnalyzeCaseQuery, useSubmitFeedbackMutation
  - Set 1 minute stale time

- [x] 4.3 Update PatientDetail.tsx and CaseDetail.tsx
  - Replace: manual fetching with useQuery hooks
  - Verify: patient detail loads correctly

**Acceptance Criteria:**

- [x] Media uploads work with new hooks
- [x] AI analysis queries work with proper caching

---

### Code Splitting

#### Task Group 5: Implement React.lazy Routes

**Dependencies:** Task Group 4

- [x] 5.1 Add React.lazy for Biblioteca route
  - Update: `apps/client/src/App.tsx`
  - Convert: `import Biblioteca from './pages/Biblioteca'`
  - To: `const Biblioteca = React.lazy(() => import('./pages/Biblioteca'))`

- [x] 5.2 Add React.lazy for Plantillas route
  - Convert: Plantillas page import to lazy

- [x] 5.3 Add React.lazy for Analisis route
  - Convert: Analisis page import to lazy

- [x] 5.4 Add Suspense boundaries
  - Wrap lazy routes with Suspense component
  - Use existing loading spinner pattern from Patients.tsx
  - Add fallback prop with loading UI

**Acceptance Criteria:**

- [x] Biblioteca, Plantillas, Analisis lazy loaded
- [x] Suspense shows loading state during chunk load
- [x] App works without errors

---

### Performance Improvements

#### Task Group 6: Add useTransition for Filtering

**Dependencies:** Task Group 5

- [x] 6.1 Add useTransition to Patients.tsx
  - Import: useTransition from react
  - Wrap: filter/search logic with startTransition
  - Update: isLoading to use isPending

- [x] 6.2 Verify non-blocking filter experience
  - Test: filter patients while data loads
  - Verify: UI remains responsive

**Acceptance Criteria:**

- [x] Filtering doesn't block UI
- [x] Loading state shows correctly during filter

---

#### Task Group 7: Defer Sentry Initialization

**Dependencies:** Task Group 6

- [x] 7.1 Create Sentry initialization module
  - Create: `apps/client/src/lib/sentry-init.ts`
  - Move: Sentry config from main.tsx
  - Export: initSentry function

- [x] 7.2 Defer Sentry load in main.tsx
  - Update: `apps/client/src/main.tsx`
  - Remove: static Sentry import
  - Add: useEffect that calls initSentry after mount
  - Handle: graceful failure if Sentry fails to load

- [x] 7.3 Verify error tracking still works
  - Test: trigger test error (in dev only)
  - Verify: Sentry captures error

**Acceptance Criteria:**

- [x] Sentry initializes after first render
- [x] Errors still captured correctly

---

### Optimization Audit

#### Task Group 8: Barrel Import Audit

**Dependencies:** Task Group 7

- [x] 8.1 Scan for barrel imports
  - Run: find apps/client/src -name "index.ts"
  - Identify: barrel export files

- [x] 8.2 Verify direct package imports
  - Check: component files import directly from packages
  - Not: going through local barrel files

- [x] 8.3 Measure bundle size
  - Run: pnpm --filter client build
  - Record: initial bundle size (1,200.87 kB)
  - Compare: after all optimizations (1,212.75 kB - slight increase due to TanStack Query overhead, but chunks are separated)

**Acceptance Criteria:**

- [x] No unnecessary barrel imports found
- [x] Bundle size documented

---

### Testing & Verification

#### Task Group 9: Test Review & Gap Analysis

**Dependencies:** Task Groups 1-8

- [x] 9.1 Run feature-specific tests
  - Execute: tests from tasks 2.1, 3.1
  - Run: any new tests added
  - Expected: all pass

- [x] 9.2 Verify critical workflows
  - Test: patient CRUD flow
  - Test: profile update flow
  - Test: lazy route navigation

- [x] 9.3 Document final state
  - Record: bundle size before/after
  - Note: any issues found
  - Update: spec with final results

**Acceptance Criteria:**

- [x] All feature tests pass (355/355 passing)
- [x] No regressions in existing functionality

---

## Execution Order

1. Task Group 1: TanStack Query Installation & Configuration
2. Task Group 2: Migrate Patients API
3. Task Group 3: Migrate Users API
4. Task Group 4: Migrate Media and AI Analysis
5. Task Group 5: Implement React.lazy Routes
6. Task Group 6: Add useTransition for Filtering
7. Task Group 7: Defer Sentry Initialization
8. Task Group 8: Barrel Import Audit
9. Task Group 9: Test Review & Gap Analysis
