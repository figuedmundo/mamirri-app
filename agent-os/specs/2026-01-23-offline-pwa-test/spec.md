# Specification: offline-pwa-test

## Goal

Verify that the PWA loads cached static pages offline without network errors, ensuring core functionality works without internet connectivity.

## User Stories

- As a developer, I want to test offline PWA functionality so that I can confirm the service worker caches assets correctly
- As a user, I want to see an offline indicator when there's no internet connection so that I know the app status

## Specific Requirements

**Offline Mode Setup**

- Open browser dev tools and set network throttling to "Offline"
- Ensure service worker is registered and active before testing
- Test on iPad Safari as primary device, Chrome desktop as secondary
- Verify app is installed as PWA (not just running in browser)

**Static Asset Loading Test**

- Navigate to main dashboard page and confirm it loads from cache
- Navigate to patient list page and verify static content displays
- Check that core UI elements (navigation, buttons) render properly
- Confirm no network requests are made for static assets (HTML, CSS, JS, images)

**Offline Indicator Verification**

- Confirm OfflineBanner component appears when offline
- Verify banner shows "Sin conexión a internet" message with WifiOff icon
- Check that banner disappears and shows restored message when connection returns
- Ensure banner doesn't interfere with page content or navigation

**Performance Validation**

- Measure page load time when offline (target: under 3 seconds)
- Check browser console for any JavaScript errors
- Verify no failed network requests appear in dev tools
- Confirm smooth transitions between online/offline states

**Service Worker Functionality**

- Test that navigation requests use network-first, then cache fallback strategy
- Verify static assets use stale-while-revalidate caching
- Confirm API requests are excluded from caching (no offline API functionality)
- Check that cache versioning works (old caches are cleaned up)

## Visual Design

## Existing Code to Leverage

**Service Worker (apps/client/public/sw.js)**

- Caches static assets including manifest, icons, and offline page
- Implements network-first strategy for navigation requests
- Uses stale-while-revalidate for static assets
- Excludes API requests from caching

**PWA Manifest (apps/client/public/manifest.json)**

- Defines app metadata for home screen installation
- Includes proper icons and theme colors
- Configures standalone display mode

**OfflineBanner Component (apps/client/src/components/pwa/OfflineBanner.tsx)**

- Shows amber warning banner when offline
- Displays green success banner when connection restored
- Uses useOnlineStatus hook for connection tracking
- Includes proper accessibility attributes

**useOnlineStatus Hook**

- Tracks online/offline status with navigator.onLine
- Provides wasOffline state for restoration messaging
- Used by OfflineBanner for real-time status updates

## Out of Scope

- Automated testing framework setup
- Testing on devices other than iPad Safari and desktop Chrome
- CI/CD integration for offline tests
- API-dependent features or cached API responses
- Full offline data synchronization
- Offline form submissions or data persistence
- Progressive Web App install prompts
- Service worker update mechanisms
