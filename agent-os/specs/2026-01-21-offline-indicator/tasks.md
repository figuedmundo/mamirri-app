# Task Breakdown: Offline Indicator

## Overview

Total Tasks: 12

## Task List

### Frontend Hooks

#### Task Group 1: useOnlineStatus Hook

**Dependencies:** None

- [x] 1.0 Complete useOnlineStatus hook
  - [x] 1.1 Write 3 focused tests for useOnlineStatus hook
    - Test initial state returns `navigator.onLine` value
    - Test state updates to `false` when `offline` event fires
    - Test state updates to `true` when `online` event fires
  - [x] 1.2 Create useOnlineStatus hook at `apps/client/src/hooks/useOnlineStatus.ts`
    - Return `{ isOnline: boolean, isOffline: boolean, wasOffline: boolean }`
    - SSR safety: check `typeof navigator !== 'undefined'` before accessing `navigator.onLine`
    - Use `useState` for `isOnline` and `wasOffline` state
    - Reuse pattern from: `apps/client/src/hooks/useServiceWorker.ts`
  - [x] 1.3 Implement event listeners with cleanup
    - Add `online` and `offline` event listeners in `useEffect`
    - Update `wasOffline` to `true` when transitioning from offline→online
    - Clean up listeners in useEffect return function
  - [x] 1.4 Ensure hook tests pass
    - Run ONLY the 3 tests written in 1.1
    - Verify hook behavior matches expected state transitions

**Acceptance Criteria:**

- The 3 tests written in 1.1 pass
- Hook returns correct initial state based on `navigator.onLine`
- State updates correctly on online/offline events
- Event listeners are properly cleaned up

---

### Frontend Components

#### Task Group 2: OfflineBanner Component

**Dependencies:** Task Group 1

- [x] 2.0 Complete OfflineBanner component
  - [x] 2.1 Write 4 focused tests for OfflineBanner component
    - Test renders nothing when online and wasOffline is false
    - Test renders offline banner when isOffline is true
    - Test renders "Conexión restaurada" banner when online after being offline
    - Test success banner auto-dismisses after 3 seconds
  - [x] 2.2 Create OfflineBanner component at `apps/client/src/components/pwa/OfflineBanner.tsx`
    - Use `useOnlineStatus` hook for state
    - Implement conditional rendering based on `isOffline` and `wasOffline`
    - Follow component pattern from: `apps/client/src/components/pwa/UpdateNotification.tsx`
  - [x] 2.3 Implement offline state UI
    - Fixed positioning: `fixed top-0 left-0 right-0 z-[99]`
    - Warning styling: `bg-amber-50 border-b border-amber-200 text-amber-800`
    - Icon: `WifiOff` from lucide-react
    - Text: "Sin conexión a internet"
    - Layout: flex with centered icon and text, `py-2 px-4`
  - [x] 2.4 Implement restored state UI
    - Success styling: `bg-green-50 border-b border-green-200 text-green-800`
    - Icon: `CheckCircle` from lucide-react
    - Text: "Conexión restaurada"
    - Auto-dismiss after 3 seconds using `setTimeout` in `useEffect`
    - Reset `wasOffline` state after dismiss
  - [x] 2.5 Add accessibility attributes
    - Add `role="alert"` to banner container
    - Add `aria-live="polite"` for screen reader announcements
    - Ensure color contrast meets 4.5:1 minimum
  - [x] 2.6 Ensure component tests pass
    - Run ONLY the 4 tests written in 2.1
    - Verify all rendering states work correctly

**Acceptance Criteria:**

- The 4 tests written in 2.1 pass
- Offline banner displays with correct styling when offline
- Restored banner displays and auto-dismisses after 3 seconds
- Component is accessible with proper ARIA attributes

---

### Integration

#### Task Group 3: App Integration

**Dependencies:** Task Group 2

- [x] 3.0 Complete app integration
  - [x] 3.1 Write 1 focused integration test
    - Test that OfflineBanner renders in the app shell
  - [x] 3.2 Add OfflineBanner to App.tsx
    - Import OfflineBanner component
    - Place alongside `UpdateNotification` and `Toaster` (lines 142-143)
    - Ensure placement is outside `BrowserRouter` for global visibility
  - [x] 3.3 Verify z-index layering
    - Confirm banner (z-99) appears below toasts (z-100)
    - Confirm banner appears above all other content
  - [x] 3.4 Ensure integration test passes
    - Run ONLY the 1 test written in 3.1
    - Manually verify in browser with DevTools Network throttling

**Acceptance Criteria:**

- The 1 test written in 3.1 passes
- OfflineBanner renders on all pages including login
- Z-index layering is correct
- Manual testing confirms offline/online transitions work

---

### Testing

#### Task Group 4: Test Review & Verification

**Dependencies:** Task Groups 1-3

- [x] 4.0 Review and verify all tests
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review 3 tests from useOnlineStatus hook (Task 1.1)
    - Review 4 tests from OfflineBanner component (Task 2.1)
    - Review 1 test from App integration (Task 3.1)
    - Total existing tests: 8 tests
  - [x] 4.2 Analyze test coverage gaps
    - Identify any critical user workflows lacking coverage
    - Focus ONLY on this feature's requirements
    - Check if event cleanup is tested (memory leak prevention)
  - [x] 4.3 Write up to 2 additional tests if needed
    - Consider edge case: rapid online/offline toggling
    - Consider edge case: component unmount during timer
    - Maximum 2 additional tests
  - [x] 4.4 Run all feature-specific tests
    - Run all tests related to this feature (8-10 tests total)
    - Verify all tests pass
    - Do NOT run entire application test suite

**Acceptance Criteria:**

- All 8-10 feature-specific tests pass
- Critical user workflows are covered
- No memory leaks from event listeners
- Feature works correctly in manual browser testing

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: useOnlineStatus Hook** — Foundation hook with no dependencies
2. **Task Group 2: OfflineBanner Component** — UI component using the hook
3. **Task Group 3: App Integration** — Wire component into app shell
4. **Task Group 4: Test Review & Verification** — Final verification

## Files to Create/Modify

| File                                                    | Action                            |
| ------------------------------------------------------- | --------------------------------- |
| `apps/client/src/hooks/useOnlineStatus.ts`              | CREATE                            |
| `apps/client/src/hooks/useOnlineStatus.spec.ts`         | CREATE                            |
| `apps/client/src/components/pwa/OfflineBanner.tsx`      | CREATE                            |
| `apps/client/src/components/pwa/OfflineBanner.spec.tsx` | CREATE                            |
| `apps/client/src/App.tsx`                               | MODIFY (add import and component) |

## Estimated Effort

| Task Group   | Estimated Time |
| ------------ | -------------- |
| Task Group 1 | 30 minutes     |
| Task Group 2 | 45 minutes     |
| Task Group 3 | 15 minutes     |
| Task Group 4 | 15 minutes     |
| **Total**    | **~2 hours**   |
