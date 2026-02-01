# Specification: PWA Service Worker Cache

## Goal

Implement a service worker to cache static assets, enabling the application to load and function without an internet connection as the foundational step for PWA offline capability.

## User Stories

- As a physiotherapist, I want the app to load quickly from cache so that I can access patient data even with slow or no internet connectivity during consultations.
- As a physiotherapist, I want to be notified when a new app version is available so that I can update at a convenient time without interrupting my patient session.

## Specific Requirements

**Service Worker Implementation**

- Create `/public/sw.js` service worker file using standard Service Worker API
- Implement cache-first strategy with background revalidation (stale-while-revalidate) for CSS, JS, images
- Implement network-first with cache fallback for HTML/entry points to ensure latest content
- Exclude API requests from caching (network-only strategy)
- Implement versioned caching using cache names like `mamirri-static-v1`, `mamirri-static-v2`
- Automatically delete old caches on service worker activation
- File size filtering: skip caching files larger than 5MB to respect storage limits
- Exclude video files, test files, and source maps from caching
- Cache build output files from Vite dist folder including all HTML, CSS, JS, and assets

**Service Worker Registration**

- Register service worker in `main.tsx` during app initialization
- Handle service worker `controllerchange` event to detect when new version takes control
- Implement graceful degradation for browsers that don't support service workers
- Log service worker lifecycle events (install, activate, fetch) for debugging

**Offline Fallback Page**

- Create `/public/offline.html` page as fallback when offline
- Display clear "You're currently offline" message with appropriate icon
- Provide links or navigation to browse previously viewed cached patient data
- Style consistently with app's existing UI using same fonts and colors
- Serve offline.html as fallback for navigation requests when offline

**Update Notification System**

- Create in-app banner or toast notification when service worker detects new version waiting
- Display notification when `registration.waiting` state is detected
- Include "Update Now" button that triggers page reload to activate new version
- Include "Later" button to dismiss notification and continue on current version
- Ensure notification is non-intrusive and doesn't interrupt user workflow
- Persist notification state during session navigation until user acts

**Cache Management UI**

- Add "Clear Cache" button in Settings page (create if not exists)
- Execute cache clearing by triggering service worker to delete all caches
- Show success toast after cache is cleared
- Require user confirmation before clearing cache to prevent accidental data loss

**Network Status Integration**

- Reuse `isOnline()` function from `apps/client/src/lib/photo-queue.ts` for online status detection
- Integrate with existing toast system for error messages when offline
- Display appropriate error message when API requests fail due to offline status

**Error Handling**

- Show toast notification using existing `showErrorToast` when API request fails offline
- No automatic retry or request queuing (deferred to Part 4)
- Manual retry action required by user when connection restored
- Log service worker errors to console for debugging

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**isOnline() function** from `apps/client/src/lib/photo-queue.ts`

- Reuse this utility function for checking online status throughout the app
- Function returns boolean based on `navigator.onLine` with undefined fallback

**onOnline() function** from `apps/client/src/lib/photo-queue.ts`

- Reuse this event listener utility for detecting when connection is restored
- Returns cleanup function to remove event listener when component unmounts

**Toast system** from `apps/client/src/lib/toast.ts` and `apps/client/src/hooks/use-toast.ts`

- Use existing `showErrorToast`, `showSuccessToast`, `showWarningToast`, `showInfoToast` for notifications
- Leverage `useToast` hook for update notification banner component
- Toast components use Radix UI primitives and follow existing app patterns

**main.tsx** entry point

- Add service worker registration logic in this file during app initialization
- Follow existing app structure and import patterns

**index.html**

- Add script tag to register service worker if needed for fallback scenarios
- No existing PWA elements, add service worker registration

## Out of Scope

- IndexedDB offline storage for form data or sessions (deferred to Part 4)
- Background sync for failed API requests (deferred to Part 4)
- Offline form editing capabilities (deferred to Part 4)
- Request queuing and automatic retry logic (deferred to Part 4)
- Push notifications (not in product roadmap)
- Time-based cache expiration for static assets (use version-based invalidation only)
- Complex cache invalidation strategies (future iteration)
- PWA manifest file installation (separate Task 8.3)
- Offline indicator UI component (separate Task 8.2)
