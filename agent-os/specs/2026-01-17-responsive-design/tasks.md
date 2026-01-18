# Task Breakdown: Responsive Design for Mobile/Tablet

## Overview

Total Tasks: 5 Task Groups, 24 Sub-tasks

This is a **frontend-only** feature focused on responsive CSS and React component updates. No database or API changes required.

## Task List

### Foundation Layer

#### Task Group 1: Responsive Utilities & Sheet Component

**Dependencies:** None

- [ ] 1.0 Complete responsive foundation
  - [ ] 1.1 Write 4 focused tests for responsive hooks
    - Test `useMediaQuery` returns correct boolean for matching/non-matching queries
    - Test `useBreakpoint` returns correct breakpoint name (`phone`, `tablet`, `desktop`)
    - Test SSR-safety (no errors during server render)
    - Test resize event listener cleanup
  - [ ] 1.2 Create `use-media-query.ts` hook
    - SSR-safe implementation with `useState` and `useEffect`
    - Accept media query string parameter
    - Return boolean indicating match status
    - Follow pattern from existing `use-debounce.ts`
  - [ ] 1.3 Create `use-breakpoint.ts` hook
    - Wrapper around `useMediaQuery` for named breakpoints
    - Return: `'phone' | 'tablet' | 'desktop'`
    - Breakpoints: phone (<768px), tablet (768-1023px), desktop (1024px+)
    - Export both hooks from hooks directory
  - [ ] 1.4 Install Shadcn Sheet component
    - Run `npx shadcn@latest add sheet`
    - Verify component added to `apps/client/src/components/ui/sheet.tsx`
    - Test basic Sheet rendering
  - [ ] 1.5 Update AppShell with responsive padding
    - Change main padding: `p-4 sm:p-6 lg:p-8`
    - Add safe area support: `env(safe-area-inset-bottom)` or Tailwind plugin
    - Ensure header stays fixed and accessible
  - [ ] 1.6 Ensure foundation tests pass
    - Run ONLY the 4 tests written in 1.1
    - Verify hooks work correctly
    - Verify Sheet component renders

**Acceptance Criteria:**

- The 4 tests in 1.1 pass
- `useMediaQuery` and `useBreakpoint` hooks work correctly
- Sheet component is installed and functional
- AppShell has responsive padding

---

### Core Layout Layer

#### Task Group 2: CaseDetailLayout & CaseTimeline Responsive

**Dependencies:** Task Group 1

- [ ] 2.0 Complete core layout responsiveness
  - [ ] 2.1 Write 6 focused tests for responsive layout
    - Test CaseTimeline renders as sidebar on desktop (lg+)
    - Test CaseTimeline renders as Sheet on mobile (<lg)
    - Test toggle button appears on mobile/tablet
    - Test Sheet opens/closes correctly
    - Test header toolbar wraps on small screens
    - Test touch targets are 48px+ on mobile
  - [ ] 2.2 Create responsive CaseTimeline wrapper
    - Use `useBreakpoint` hook to detect screen size
    - Desktop: Render existing sidebar at `w-80`
    - Mobile/Tablet: Wrap in Sheet component with `side="left"`
    - Add floating toggle button (`lg:hidden`) to trigger Sheet
  - [ ] 2.3 Update CaseDetailLayout header
    - Toolbar buttons: hide text on phone (`hidden sm:inline`)
    - Ensure minimum 48px touch targets on all buttons
    - Back button always visible and accessible
    - "Grabar Evolucion" button: icon-only on phone
  - [ ] 2.4 Update CaseDetailLayout content area
    - Remove fixed sidebar space on mobile
    - Full-width content when sidebar is hidden
    - Proper padding adjustments for mobile
  - [ ] 2.5 Add timeline toggle button
    - Floating button in bottom-left or header area
    - Icon: Menu or Sidebar icon from lucide-react
    - Visible only on `<lg` screens
    - Opens Sheet with CaseTimeline content
  - [ ] 2.6 Ensure core layout tests pass
    - Run ONLY the 6 tests written in 2.1
    - Verify responsive behavior works correctly

**Acceptance Criteria:**

- The 6 tests in 2.1 pass
- CaseTimeline works as drawer on mobile/tablet
- Header toolbar is touch-friendly
- Toggle button works correctly

---

### Forms & Interactions Layer

#### Task Group 3: EvaluationForm & BodySilhouette Responsive

**Dependencies:** Task Group 1

- [ ] 3.0 Complete form responsiveness
  - [ ] 3.1 Write 6 focused tests for form components
    - Test orthopedic tests grid stacks to 1 column on phone
    - Test tabs are scrollable horizontally
    - Test tab touch targets are 48px+ height
    - Test BodySilhouette touch points are 44px+
    - Test pain scale slider is touch-friendly
    - Test form is completable on mobile viewport
  - [ ] 3.2 Update EvaluationForm grid layouts
    - Orthopedic tests: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
    - AVD evaluation: `grid-cols-1 md:grid-cols-2`
    - Posturogram section: stack on phone
    - Consistent `gap-4 md:gap-6` spacing
  - [ ] 3.3 Make tabs touch-friendly
    - Increase tab button height to `min-h-[48px]`
    - Add `overflow-x-auto` to tab container
    - Add `scrollbar-hide` class for clean mobile appearance
    - Ensure active tab indicator works on scroll
  - [ ] 3.4 Enlarge BodySilhouette touch targets
    - Increase anatomical point click areas to 44px minimum
    - Add invisible expanded hit areas if needed
    - Responsive container: `max-w-full` on mobile
    - Maintain aspect ratio with `aspect-[3/4]` or similar
  - [ ] 3.5 Improve pain scale slider for touch
    - Increase slider thumb size to 44px
    - Add visible thumb styling for touch
    - Ensure gradient track is visible
    - Test on actual touch device
  - [ ] 3.6 Ensure form tests pass
    - Run ONLY the 6 tests written in 3.1
    - Verify forms are usable on mobile

**Acceptance Criteria:**

- The 6 tests in 3.1 pass
- Forms stack properly on phone
- Touch targets meet 44-48px minimum
- BodySilhouette is usable on touch devices

---

### Patient Navigation Layer

#### Task Group 4: PatientList & Touch Actions

**Dependencies:** Task Group 1

- [ ] 4.0 Complete patient navigation responsiveness
  - [ ] 4.1 Write 4 focused tests for patient components
    - Test card actions are visible on touch devices (not hover-only)
    - Test card touch targets are 48px+
    - Test filter pills scroll horizontally
    - Test patient grid adapts to screen size
  - [ ] 4.2 Replace hover-only card actions
    - Remove `opacity-0 group-hover:opacity-100` on mobile
    - Option: Always-visible action bar on mobile
    - Alternative: Add dropdown menu with MoreHorizontal icon
    - Use `useBreakpoint` or CSS to switch behavior
  - [ ] 4.3 Increase card touch targets
    - Action buttons: `p-3` instead of `p-2` (48px touch area)
    - Card clickable area clearly defined
    - Adequate spacing between action buttons
  - [ ] 4.4 Verify responsive grid
    - Confirm: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
    - Test filter horizontal scroll on overflow
    - Ensure empty states work on all sizes
  - [ ] 4.5 Ensure patient navigation tests pass
    - Run ONLY the 4 tests written in 4.1
    - Verify touch-friendly behavior

**Acceptance Criteria:**

- The 4 tests in 4.1 pass
- Card actions accessible without hover
- Touch targets are adequate
- Grid adapts correctly

---

### Polish & Testing Layer

#### Task Group 5: Offline Indicator, Polish & Cross-Device Testing

**Dependencies:** Task Groups 1-4

- [ ] 5.0 Complete polish and testing
  - [ ] 5.1 Write 4 focused tests for polish items
    - Test offline indicator appears when `navigator.onLine` is false
    - Test offline indicator hides text on phone
    - Test ComparisonBoard stacks vertically on phone
    - Test safe area padding applied on notched devices
  - [ ] 5.2 Add offline indicator to AppShell
    - Add `useOnlineStatus` hook or inline check
    - Show WifiOff icon + "Sin conexión" text when offline
    - Hide text on phone: `hidden sm:inline`
    - Position in header, non-intrusive styling
  - [ ] 5.3 Update ComparisonBoard for mobile
    - Vertical stack on phone: `flex-col` on `<md`
    - Side-by-side on tablet+: `flex-row` on `md+`
    - BeforeAfterSlider: full width on phone
    - Add "View on tablet for best experience" hint if needed
  - [ ] 5.4 Add safe area support
    - Install `tailwindcss-safe-area` plugin if needed
    - Or use CSS: `padding-bottom: env(safe-area-inset-bottom)`
    - Apply to AppShell and fixed elements
    - Test on iPhone simulator with notch
  - [ ] 5.5 Cross-device verification
    - Test on Android tablet (primary device)
    - Test on phone (portrait and landscape)
    - Test on iPad simulator
    - Document any device-specific issues
  - [ ] 5.6 Ensure all feature tests pass
    - Run ALL tests from Task Groups 1-5
    - Total expected: ~24 focused tests
    - Verify no regressions

**Acceptance Criteria:**

- The 4 tests in 5.1 pass
- Offline indicator works correctly
- ComparisonBoard is responsive
- All devices tested and working
- All 24 feature tests pass

---

## Execution Order

Recommended implementation sequence:

```
1. Foundation Layer (Task Group 1)
   └── Hooks, Sheet component, AppShell padding

2. Core Layout Layer (Task Group 2)
   └── CaseDetailLayout, CaseTimeline drawer

3. Forms Layer (Task Group 3) [Can run parallel with 4]
   └── EvaluationForm, BodySilhouette, tabs

4. Patient Navigation Layer (Task Group 4) [Can run parallel with 3]
   └── PatientList touch actions

5. Polish & Testing Layer (Task Group 5)
   └── Offline indicator, ComparisonBoard, final testing
```

**Note:** Task Groups 3 and 4 can be executed in parallel since they have no dependencies on each other, only on Task Group 1.

## Files to Modify

| File                                                       | Task Group | Changes                               |
| ---------------------------------------------------------- | ---------- | ------------------------------------- |
| `apps/client/src/hooks/use-media-query.ts`                 | 1          | CREATE                                |
| `apps/client/src/hooks/use-breakpoint.ts`                  | 1          | CREATE                                |
| `apps/client/src/components/ui/sheet.tsx`                  | 1          | CREATE (via shadcn)                   |
| `apps/client/src/components/shell/AppShell.tsx`            | 1, 5       | Responsive padding, offline indicator |
| `apps/client/src/components/patients/CaseDetailLayout.tsx` | 2          | Header responsive, sidebar logic      |
| `apps/client/src/components/patients/CaseTimeline.tsx`     | 2          | Sheet wrapper, toggle                 |
| `apps/client/src/components/patients/EvaluationForm.tsx`   | 3          | Grid stacking, tabs                   |
| `apps/client/src/components/patients/BodySilhouette.tsx`   | 3          | Touch targets                         |
| `apps/client/src/components/patients/PatientList.tsx`      | 4          | Touch actions                         |
| `apps/client/src/components/patients/ComparisonBoard.tsx`  | 5          | Vertical stacking                     |

## Test Summary

| Task Group | Tests Written | Focus Area                     |
| ---------- | ------------- | ------------------------------ |
| 1          | 4 tests       | Hooks, Sheet                   |
| 2          | 6 tests       | CaseDetailLayout, CaseTimeline |
| 3          | 6 tests       | EvaluationForm, BodySilhouette |
| 4          | 4 tests       | PatientList touch              |
| 5          | 4 tests       | Offline, ComparisonBoard       |
| **Total**  | **24 tests**  | Responsive behavior            |
