# Task Breakdown: PosturogramViewer

## Overview

Total Tasks: 16

## Task List

### Frontend Components

#### Task Group 1: Component Architecture & Data Structure

**Dependencies:** None

- [x] 1.1 Create enhanced PosturogramViewer component structure
  - Merge existing BeforeAfterSlider with anatomical marker overlay
  - Props: { clinicalCase, onPosturogramChange, initialPosturogramUrl, currentPosturogramUrl }
  - State: { sliderPosition, activePoint, posturogram, showDeviationPopover }
  - Reuse: PosturogramViewer.tsx slider logic, BodySilhouette.tsx marker pattern

- [x] 1.2 Implement nested PosturalView data structure alignment
  - Initialize posturogram state with anteriorView: { head, shoulders, spine, pelvis, knees, feet }
  - Each point contains { deviation: string, severity: 'normal' | 'mild' | 'severe' }
  - Migrate from flat legacy keys (head, shoulders, spine, pelvis, knees, feet) to nested structure
  - Maintain backward compatibility with EvaluationForm during migration

- [x] 1.3 Add anatomical marker overlay to comparison interface
  - Display 6 interactive points: head, shoulders, spine, pelvis, knees, feet
  - Render markers on SVG overlay positioned over before/after images
  - Calculate coordinates using getBoundingClientRect() for accurate positioning
  - Set marker colors: emerald-500 (normal), amber-500 (mild), rose-500 (severe)

**Acceptance Criteria:**

- Component structure supports simultaneous slider and marker interaction
- PosturalView nested structure is used for type safety
- Markers render correctly over image comparison
- Data migrations from flat to nested structure complete

#### Task Group 2: Interactive Marker Functionality

**Dependencies:** Task Group 1

- [x] 2.1 Replace custom dropdown with Shadcn Popover component
  - Use apps/client/src/components/ui/popover.tsx for deviation selection
  - Provide collision detection for iPad screen edges
  - Ensure 48px minimum touch targets for popover trigger
  - Replace ~30 lines of custom positioning logic from BodySilhouette.tsx

- [x] 2.2 Implement deviation type selection dropdown
  - Use Shadcn Select component from apps/client/src/components/ui/select.tsx
  - Options: normal, scoliosis, lordosis, kyphosis, rotation, lateralization
  - Support keyboard navigation and arrow key selection
  - Integrate with Popover trigger on marker click

- [x] 2.3 Implement severity level selection dropdown
  - Use Shadcn Select component for severity: normal (normal), mild (leve), severe (severo)
  - Use Badge component from apps/client/src/components/ui/badge.tsx for severity display
  - Display with emerald/amber/rose color coding in dropdown

- [x] 2.4 Add interactive marker labels with Tooltip
  - Use Shadcn Tooltip component from apps/client/src/components/ui/tooltip.tsx
  - Show deviation type and severity on marker hover/click
  - Include aria-labels on all markers: "{point}: {deviation} ({severity})"
  - Support keyboard focus for accessibility

**Acceptance Criteria:**

- Shadcn Popover renders with collision detection on all screen sizes
- Deviation and severity selections work with keyboard navigation
- Markers show descriptive tooltips with both deviation name and severity
- ARIA labels present on all interactive markers

#### Task Group 3: Auto-Save Integration

**Dependencies:** Task Group 2

- [x] 3.1 Implement debounced auto-save with useDebounce hook
  - Reuse pattern from apps/client/src/components/patients/EvaluationForm.tsx (lines 86-94)
  - Set 300ms debounce delay to prevent excessive API calls
  - Save trigger: any posturogram point deviation or severity change

- [x] 3.2 Integrate patientsApi.updateEvaluation endpoint
  - Reuse existing API client from apps/client/src/api/patients.ts
  - Send partial update: { posturogram: updatedData }
  - Handle success response with toast: "Posturograma guardado"
  - Handle error response with toast: "No se pudo guardar el posturograma. Intenta de nuevo."

- [x] 3.3 Wire onPosturogramChange callback to parent
  - Merge new point status into existing posturogram object
  - Pass complete updated posturogram to parent component
  - Trigger debounced save function on each change

**Acceptance Criteria:**

- Auto-save triggers with 300ms debounce
- API endpoint returns success/error responses correctly
- Toast notifications display on save success/failure
- Parent component receives updated posturogram data via callback

#### Task Group 4: Slider & Image Display

**Dependencies:** Task Group 1

- [x] 4.1 Integrate BeforeAfterSlider component
  - Reuse existing component from apps/client/src/components/ui/BeforeAfterSlider.tsx
  - Pass initialPosturogramUrl and currentPosturogramUrl as props
  - Ensure slider handle is 48px minimum for iPad touch targets
  - Support mouse and touch drag events

- [x] 4.2 Display placeholder images for posturograms
  - Show placeholder: /placeholder/posture-initial.png for initial view
  - Show placeholder: /placeholder/posture-current.png for current view
  - Load from evaluation mock data for Week 6 demonstration
  - Use object-cover and object-fit-contain for proper image scaling

- [x] 4.3 Implement empty state for missing posturograms
  - Display message: "No hay posturogramas disponibles" when images are null
  - Show consistent empty state pattern from existing components
  - Provide clear visual indication to user

**Acceptance Criteria:**

- BeforeAfterSlider renders with draggable handle on mouse and touch
- Placeholder images display correctly over comparison interface
- Empty state shows clear message when no images available
- Slider handle meets 48px minimum touch target requirement

#### Task Group 5: Accessibility & Responsive Design

**Dependencies:** Task Groups 1-4

- [x] 5.1 Ensure minimum 48px touch targets for all interactive elements
  - Marker circles: 48px diameter minimum for iPad
  - Popover trigger: 48px touch target
  - Slider handle: 48px minimum for drag interaction
  - Verify with touch device testing

- [x] 5.2 Implement keyboard navigation for marker selection
  - Tab key moves to next anatomical point
  - Enter key activates Popover for current point
  - Escape key closes Popover
  - Arrow keys navigate deviation/severity dropdown options

- [x] 5.3 Test color contrast and colorblind accessibility
  - Verify emerald-500, amber-500, rose-500 have sufficient contrast with background
  - Ensure deviation labels in Tooltip provide text backup for color-only indicators
  - Test with screen reader to verify ARIA labels convey information

- [x] 5.4 Implement responsive layout for iPad breakpoints
  - Mobile: 320px - 768px - stack slider and markers vertically
  - Tablet: 768px - 1024px - side-by-side layout
  - Desktop: 1024px+ - maximize comparison interface width
  - Use Tailwind responsive prefixes: md:, lg:, xl:

**Acceptance Criteria:**

- All interactive elements pass 48px touch target validation
- Keyboard navigation works end-to-end without mouse
- Screen reader announces all marker statuses correctly
- Layout adapts to mobile (320px-768px) and tablet (768px-1024px) screens

### Testing

#### Task Group 6: Frontend Tests

**Dependencies:** Task Groups 1-5

- [x] 6.1 Write focused tests for PosturogramViewer component
  - Test 1: Marker click activates Popover with correct deviation type options
  - Test 2: Marker color updates correctly on severity change
  - Test 3: Slider drag updates image clipping to reveal/hide after image
  - Test 4: onPosturogramChange callback fires with updated posturogram data
  - Test 5: Empty state displays when posturogram images are null
  - Test 6: ARIA labels announce correct point status to screen readers
  - Maximum 6 tests covering critical component behaviors

- [x] 6.2 Write focused tests for auto-save integration
  - Test 1: useDebounce prevents multiple API calls within 300ms
  - Test 2: patientsApi.updateEvaluation receives correct posturogram JSON payload
  - Test 3: Success toast displays on save completion
  - Test 4: Error toast displays on save failure
  - Maximum 4 tests covering save workflow

- [x] 6.3 Run feature-specific tests only
  - Run tests from Task 6.1: PosturogramViewer tests (6 tests)
  - Run tests from Task 6.2: Auto-save tests (4 tests)
  - Expected total: 10 tests maximum
  - Do NOT run entire application test suite
  - Verify critical workflows pass before moving to implementation

**Acceptance Criteria:**

- All 10 PosturogramViewer-specific tests pass
- Marker interaction tests verify click, popover, color, and callback behavior
- Auto-save tests verify debounce, API call, and toast notification
- No more than 10 tests written (focused on feature requirements only)

## Execution Order

Recommended implementation sequence:

1. Component Architecture & Data Structure (Task Group 1)
2. Interactive Marker Functionality (Task Group 2)
3. Auto-Save Integration (Task Group 3)
4. Slider & Image Display (Task Group 4)
5. Accessibility & Responsive Design (Task Group 5)
6. Frontend Tests (Task Group 6)
