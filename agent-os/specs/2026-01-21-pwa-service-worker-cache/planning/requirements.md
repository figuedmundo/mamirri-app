# Spec Requirements: PWA Service Worker Cache

## Initial Description

**Task 8.1: Service Worker - Cache static assets**

From Roadmap Week 8: PWA Basics (Offline Skeleton)

Implement a service worker to cache static assets (HTML, CSS, JavaScript, images) so the application can load and function without an internet connection. This is the foundational step for making the app a Progressive Web App (PWA) that works offline.

**Context:**

- This is part of "Offline Skeleton" implementation - a basic offline capability that caches static content only
- Full offline editing with IndexedDB sync is deferred to Part 4 (future work)
- The service worker should enable app to load and show cached data without internet connectivity
- Target milestone: "App loads offline, shows cached data"

**Related Tasks in Week 8:**

- 8.2: Offline indicator (connection status)
- 8.3: PWA manifest (install to home screen)
- 8.4: Test: Works without internet (static pages only)

## Requirements Discussion

### First Round Questions

**Q1:** I assume service worker should use a **cache-first strategy** for static assets (HTML, CSS, JS, images) to ensure fastest possible load times offline. Should we use network-first for any specific assets instead (e.g., API calls, dynamic content)?
**Answer:** Use **stale-while-revalidate** strategy for static assets (CSS, JS, images) to balance speed + freshness. Use network-first with cache fallback for HTML/entry points. Network-only for API responses (no caching until full offline editing implemented).

**Q2:** For cache management, I'm thinking we should implement **versioned caching** where a new cache version is created on each deploy and old caches are cleaned up automatically. Should we also support a manual "clear cache" option in UI?
**Answer:** Yes, implement **versioned caching** with automatic cleanup on service worker activation. Also add a manual "Clear Cache" button in Settings/About page for debugging and user control.

**Q3:** I assume we should cache **all build output files** from React/Vite build process. Should we exclude anything specific (e.g., large video files, test assets, development-only files)?
**Answer:** Cache build output (dist folder) but **exclude**:

- Video files >5MB (patient videos from media capture)
- Test files (`__tests__`, `.spec`)
- Source maps (`.map`) in production
- Large files exceeding configurable threshold

**Q4:** For offline experience, should we service worker show a **custom offline page** or just display whatever was last loaded? If custom, should it be a simple "You're offline" message or include cached data access?
**Answer:** Show a **custom "You're Offline" page** (`/offline.html`) with:

- Clear message indicating offline status
- Links to previously viewed cached content (patients, cases)
- Minimal navigation to browse cached data
- Visual indicator consistent with offline badge (Task 8.2)

**Q5:** Should we implement **background sync** for API requests that fail while offline (deferred to Week 11+), or just focus on static asset caching for now and queue failed requests for later processing?
**Answer:** **Do NOT implement background sync** in this task. If API request fails offline, show error message. User must retry manually. Background sync deferred to Part 4.

**Q6:** What should be the **cache expiration policy**? I'm assuming no expiration for static assets (until new deploy), but should we implement time-based invalidation for any specific types of content?
**Answer:** No time-based expiration for static assets. They only expire on new deployment (cache version change). Medical reference images could have time-based expiration (30 days) in future iteration, not Week 8.

**Q7:** Should we add **service worker update notifications** in the UI? For example, when a new version is available, should we show a banner prompting the user to refresh?
**Answer:** Yes, show **in-app notification** (banner or toast) when new version is detected. Include "Update Now" and "Later" buttons. Non-intrusive UX so therapist can finish current session.

**Q8:** Is there anything specific about PWA implementation we should **defer to future work**? For example, push notifications, complex offline editing, or background sync features?
**Answer:**

**Out of scope for Week 8:**

- IndexedDB offline storage (deferred to Part 4)
- Background sync (deferred to Part 4)
- Push notifications (not in roadmap)
- Offline form editing (deferred to Part 4)
- Request queuing (deferred to Part 4)
- Complex cache invalidation logic (deferred to future)

**In scope for Week 8:**

- Cache static assets (HTML, CSS, JS, images)
- Basic offline page
- Versioned cache management
- Service worker registration
- Update notifications (simple)

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

None required - user approved comprehensive recommendations.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

- Service worker implementation that caches static assets (HTML, CSS, JavaScript, images)
- **Cache Strategy:**
  - Stale-while-revalidate for CSS, JS, images (speed + freshness)
  - Network-first with cache fallback for HTML/entry points
  - Network-only for API responses
- **Cache Management:**
  - Versioned caching (cache names like `mamirri-v1`, `mamirri-v2`)
  - Automatic cleanup of old caches on service worker activation
  - Manual "Clear Cache" button in Settings/About page
- **Cache Scope:**
  - All build output files from Vite dist folder
  - Images from `/assets/` (icons, logos, UI graphics)
  - Medical reference images (posturogram, footprint)
  - Exclude: Video files >5MB, test files, source maps
- **Offline Experience:**
  - Custom offline.html page served when offline
  - Clear "You're currently offline" message
  - Links to previously viewed cached content (patients, cases)
  - Minimal navigation for browsing cached data
- **Service Worker Updates:**
  - In-app notification when new version is available
  - "Update Now" button to reload and activate new version
  - "Later" button to dismiss and continue on current version
  - Non-intrusive banner or toast notification
- **Service Worker Registration:**
  - Register service worker in main app initialization
  - Handle controller change events
  - Graceful degradation if service worker not supported
- **Error Handling:**
  - Show error message for failed API requests when offline
  - No automatic retry or queuing (deferred to Part 4)
  - Manual retry required by user

### Reusability Opportunities

- **Service Worker Utilities:** Create reusable cache helper functions (cacheStrategy, version management)
- **Network Status Monitor:** Shared utility for online/offline detection (can be reused by Task 8.2)
- **Offline UI Components:** Banner notification component can be reused for update alerts and offline status
- **Cache Management UI:** "Clear Cache" button pattern reusable for other cache-related features

### Scope Boundaries

**In Scope:**

- Service worker caching of static assets (HTML, CSS, JS, images)
- Custom offline fallback page
- Versioned cache management with automatic cleanup
- Manual cache clearing in UI
- Service worker update notifications
- Basic offline experience (read-only cached data)
- Cache size limits (exclude files >5MB)

**Out of Scope:**

- IndexedDB offline storage (deferred to Part 4)
- Background sync for failed API requests (deferred to Part 4)
- Offline form editing (deferred to Part 4)
- Request queuing and conflict resolution (deferred to Part 4)
- Push notifications (not in roadmap)
- Time-based cache expiration for medical images (future iteration)
- Complex cache invalidation strategies (future iteration)

### Technical Considerations

- **Service Worker API:** Use standard Service Worker API for caching and interception
- **Cache Storage API:** Use CacheStorage API for managing cached responses
- **Vite Build Integration:** Ensure service worker is built with Vite and works in production
- **File Size Filtering:** Implement logic to skip caching large files (>5MB)
- **Cache Versioning:** Use version strings in cache names for easy invalidation
- **Graceful Degradation:** Ensure app works without service worker (browsers that don't support SW)
- **Testing:** Test offline behavior by disabling network connection in browser DevTools
- **Compatibility:** Support modern browsers (Chrome, Firefox, Safari, Edge)
- **Security:** Ensure service worker is served from same origin as app
- **Performance:** Cache busting on deployment via cache version changes
- **Integration:** Work with existing MinIO media storage (separate from service worker cache)
