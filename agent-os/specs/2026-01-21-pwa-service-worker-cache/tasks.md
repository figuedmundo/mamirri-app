# Task Breakdown: PWA Service Worker Cache

## Overview

Total Tasks: 4 task groups, 16 total tasks

## Task List

### Service Worker Core

#### Task Group 1: Service Worker Implementation

**Dependencies:** None

- [x] 1.0 Complete service worker implementation
  - [x] 1.1 Write 2-4 focused tests for service worker caching strategies
    - Limit to 2-4 highly focused tests maximum
    - Test only critical service worker behaviors (e.g., install, activate, fetch handlers)
    - Skip exhaustive testing of all cache scenarios
  - [x] 1.2 Create `/public/sw.js` service worker file
    - Implement stale-while-revalidate strategy for CSS, JS, images
    - Implement network-first with cache fallback for HTML/entry points
    - Exclude API requests from caching (network-only)
    - Implement versioned caching with names like `mamirri-static-v1`
    - Add automatic cleanup of old caches on activation
    - File size filtering: skip files >5MB
    - Exclude video files, test files, source maps
  - [x] 1.3 Add service worker lifecycle logging
    - Log install, activate, fetch events for debugging
    - Use console.log with descriptive messages
  - [x] 1.4 Ensure service worker tests pass
    - Run ONLY the 2-4 tests written in 1.1
    - Verify caching strategies work correctly
    - Do NOT run entire application test suite at this stage

**Acceptance Criteria:**

- The 2-4 tests written in 1.1 pass
- Service worker caches static assets with correct strategies
- Old caches are cleaned up on activation
- File size filtering works correctly

### Offline Page

#### Task Group 2: Offline Fallback Page

**Dependencies:** Task Group 1

- [x] 2.0 Complete offline page implementation
  - [x] 2.1 Write 1-2 focused tests for offline fallback
    - Limit to 1-2 highly focused tests maximum
    - Test only critical offline page rendering
    - Skip exhaustive testing of all offline scenarios
  - [x] 2.2 Create `/public/offline.html` page
    - Display clear "You're currently offline" message with icon
    - Style consistently with existing app UI (same fonts, colors)
    - Provide links to browse cached patient data
    - Use semantic HTML elements for accessibility
  - [x] 2.3 Update service worker to serve offline.html
    - Modify fetch handler to serve offline.html as fallback when offline
    - Apply only to navigation requests
  - [x] 2.4 Ensure offline page tests pass
    - Run ONLY the 1-2 tests written in 2.1
    - Verify offline page loads correctly
    - Do NOT run entire application test suite at this stage

**Acceptance Criteria:**

- The 1-2 tests written in 2.1 pass
- Offline page displays with correct styling
- Service worker serves offline.html when offline

### Frontend Components

#### Task Group 3: Service Worker Integration UI

**Dependencies:** Task Groups 1-2

- [x] 3.0 Complete service worker integration components
  - [x] 3.1 Write 3-6 focused tests for UI components
    - Limit to 3-6 highly focused tests maximum
    - Test only critical component behaviors (e.g., update notification display, cache clearing)
    - Skip exhaustive testing of all component states
  - [x] 3.2 Create UpdateNotification component
    - Banner or toast notification using existing `useToast` hook
    - Detect `registration.waiting` state
    - Include "Update Now" button that triggers page reload
    - Include "Later" button to dismiss notification
    - Make notification non-intrusive (doesn't interrupt workflow)
    - Persist state during navigation until user acts
  - [x] 3.3 Add service worker registration in main.tsx
    - Register `/sw.js` during app initialization
    - Handle `controllerchange` event
    - Implement graceful degradation for browsers without service worker support
    - Log registration events for debugging
  - [x] 3.4 Create Settings page (if not exists)
    - Simple layout with navigation from main app
    - Add "Clear Cache" button
    - Include confirmation dialog before clearing
    - Show success toast after cache is cleared
    - Reuse existing toast system (`showSuccessToast`, `showErrorToast`)
  - [x] 3.5 Integrate network status detection
    - Reuse `isOnline()` from `apps/client/src/lib/photo-queue.ts`
    - Display toast notification when API requests fail offline
    - Use existing `showErrorToast` for error messages
  - [x] 3.6 Ensure UI component tests pass
    - Run ONLY the 3-6 tests written in 3.1
    - Verify update notification displays correctly
    - Verify cache clearing works
    - Do NOT run entire application test suite at this stage

**Acceptance Criteria:**

- The 3-6 tests written in 3.1 pass
- Update notification shows when new version is available
- Service worker registers successfully on app load
- Settings page allows clearing cache with confirmation
- Offline status triggers appropriate error messages

### Testing

#### Task Group 4: End-to-End Testing & Validation

**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete offline testing and validation
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-4 tests written by Task 1.1
    - Review the 1-2 tests written by Task 2.1
    - Review the 3-6 tests written by Task 3.1
    - Total existing tests: approximately 6-12 tests
  - [x] 4.2 Analyze test coverage gaps for PWA functionality
    - Identify critical offline workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end offline workflows over unit test gaps
  - [x] 4.3 Write up to 8 additional strategic tests maximum
    - Add maximum of 8 new tests to fill identified critical gaps
    - Focus on integration points and offline workflows
    - Test scenarios: offline navigation, cache version update, manual cache clearing
    - Do NOT write comprehensive coverage for all scenarios
  - [x] 4.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, and 4.3)
    - Expected total: approximately 14-20 tests maximum
    - Verify critical offline workflows pass
    - Test in offline mode using browser DevTools
  - [x] 4.5 Manual testing checklist
    - Test app loads offline from cache
    - Test offline.html displays correctly
    - Test update notification appears for new version
    - Test "Update Now" reloads app
    - Test "Later" dismisses notification
    - Test "Clear Cache" removes all cached content
    - Verify app works without service worker (graceful degradation)

**Acceptance Criteria:**

- All feature-specific tests pass (approximately 14-20 tests total)
- Critical offline workflows are covered
- No more than 8 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements
- Manual testing confirms all offline scenarios work correctly

## Execution Order

Recommended implementation sequence:

1. Service Worker Core (Task Group 1)
2. Offline Page (Task Group 2)
3. Service Worker Integration UI (Task Group 3)
4. End-to-End Testing & Validation (Task Group 4)
