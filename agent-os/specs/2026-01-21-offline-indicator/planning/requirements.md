# Spec Requirements: Offline Indicator

## Initial Description

From roadmap task **8.2**: "Offline indicator (connection status)" under Week 8: PWA Basics.

The goal is to add a visible, persistent indicator that shows users when they are offline and when connectivity is restored, providing confidence about their connection state before they attempt actions.

## Requirements Discussion

### First Round Questions

**Q1:** The codebase already has `isOnline()` and `onOnline()` utilities in `photo-queue.ts`, plus an axios interceptor that shows an error toast when offline. Is the goal to add a persistent, visible indicator that appears when the user goes offline and disappears when they come back online?

**Answer:** Yes, a persistent indicator. The existing axios interceptor only shows toasts on failed API requests (reactive). Task 8.2 adds a proactive, persistent indicator that appears immediately when `navigator.onLine` becomes `false`, stays visible until connection is restored, and gives users confidence about their connection state before they try actions.

**Q2:** For the UI pattern, should we use a persistent toast (like `UpdateNotification.tsx`), a fixed banner at the top/bottom of the screen, or something else?

**Answer:** Fixed banner at top of screen. Rationale:

- `UpdateNotification.tsx` uses a toast for action-required scenarios (user must decide to update)
- Offline status is informational — it shouldn't compete with action toasts or require dismissal
- A slim fixed banner is always visible without blocking content, non-dismissible (reflects actual state), and is a standard UX pattern (Gmail, Slack, etc.)

**Q3:** Should we show the offline indicator immediately when connection is lost and hide it when connection is restored (with a brief "Back online" confirmation)?

**Answer:** Yes. Immediate show on offline, brief "restored" confirmation:

- **Offline**: Show banner immediately when `offline` event fires
- **Online**: Show brief "Conexión restaurada" success banner for 3 seconds, then hide

**Q4:** The existing `offline.html` fallback page has English text, but the PWA update toast uses Spanish. Should the offline indicator use Spanish?

**Answer:** Spanish. The primary user persona is the mother (45-60, Spanish-speaking physiotherapist). The app's UI is primarily in Spanish.

**Q5:** Should the offline indicator appear on all pages, or only on specific pages?

**Answer:** All pages, including login. Connection status is relevant everywhere. Even on login, users need to know if they're offline before attempting authentication.

**Q6:** Is there anything that should NOT be included in this feature?

**Answer:** Out of scope (defer to future tasks):

- "Pending uploads" indicator (queued photos count) — separate feature
- Offline data sync progress — Part 4 of roadmap (full IndexedDB sync)
- Updating `offline.html` language — could be a quick follow-up but not core to 8.2

### Existing Code to Reference

**Similar Features Identified:**

- Feature: PWA Update Notification - Path: `apps/client/src/components/pwa/UpdateNotification.tsx`
  - Pattern for persistent PWA-related notifications
  - Uses `useToast` hook with `duration: Infinity`
- Feature: Online/Offline utilities - Path: `apps/client/src/lib/photo-queue.ts`
  - Contains `isOnline()` and `onOnline()` functions
  - Basic `navigator.onLine` wrapper and event listener
- Feature: Toast utilities - Path: `apps/client/src/lib/toast.ts`
  - `showSuccessToast`, `showErrorToast`, `showWarningToast` helpers
- Feature: Axios offline handling - Path: `apps/client/src/lib/axios.ts`
  - Request interceptor that blocks API calls when offline
  - Shows error toast: "Estás desconectado. Revisa tu conexión a internet."
- Feature: Service Worker hook - Path: `apps/client/src/hooks/useServiceWorker.ts`
  - Pattern for PWA-related React hooks
- Feature: Offline fallback page - Path: `apps/client/public/offline.html`
  - Static HTML fallback when navigation fails offline
  - Uses app's CSS variables and styling

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

Based on research and existing patterns, the recommended design is:

```
┌────────────────────────────────────────────────────────────────┐
│ ⚠️ Sin conexión a internet                                     │
└────────────────────────────────────────────────────────────────┘
```

Key design elements:

- Sticky/fixed position at top of viewport
- Warning color scheme (amber/yellow background)
- Icon + text layout
- No dismiss button (reflects actual state)
- Slim height (~40px) to minimize content displacement

For "back online" state:

```
┌────────────────────────────────────────────────────────────────┐
│ ✓ Conexión restaurada                                          │
└────────────────────────────────────────────────────────────────┘
```

- Success color scheme (green)
- Auto-dismisses after 3 seconds

## Requirements Summary

### Functional Requirements

**Core Functionality:**

- Detect online/offline status using `navigator.onLine` and `online`/`offline` window events
- Display a persistent banner when offline
- Display a temporary success banner when connection is restored
- Banner must be visible on all pages (including login)

**User Actions Enabled:**

- Users can see their connection status at a glance
- Users know when they can/cannot perform network-dependent actions
- Users receive confirmation when connectivity returns

**Data to be Managed:**

- Online/offline state (boolean, derived from browser API)
- "Was offline" flag (to trigger restoration message)
- Auto-dismiss timer for restoration banner

### Technical Deliverables

1. **`useOnlineStatus` hook** (`apps/client/src/hooks/useOnlineStatus.ts`)
   - Returns `{ isOnline, isOffline, wasOffline }`
   - Listens to `online`/`offline` events
   - SSR-safe (`typeof navigator !== 'undefined'`)

2. **`OfflineBanner` component** (`apps/client/src/components/pwa/OfflineBanner.tsx`)
   - Fixed position banner at top of viewport
   - Two states: offline (warning) and restored (success, auto-dismiss)
   - Uses existing Tailwind/Shadcn styling patterns
   - Accessible (proper ARIA attributes)

3. **Integration into app shell**
   - Add `OfflineBanner` to root layout (likely `App.tsx` or main layout component)
   - Ensure it renders above other content (high z-index)

4. **Unit tests**
   - Test `useOnlineStatus` hook behavior
   - Test `OfflineBanner` component rendering states

### Reusability Opportunities

- `useOnlineStatus` hook can replace/consolidate `isOnline()` and `onOnline()` from `photo-queue.ts`
- Banner component pattern can be reused for other system-wide status indicators
- Follow `UpdateNotification.tsx` pattern for PWA-related components

### Scope Boundaries

**In Scope:**

- `useOnlineStatus` React hook
- `OfflineBanner` component with offline/restored states
- Integration into app shell
- Spanish language copy
- Unit tests for hook and component

**Out of Scope:**

- Pending uploads indicator (queued items count)
- Offline data sync progress UI
- Updating `offline.html` to Spanish
- Network quality indicators (slow connection warnings)
- Retry/reload button on banner (keep it simple for MVP)

### Technical Considerations

**Browser APIs:**

- `navigator.onLine` for initial state
- `window.addEventListener('online', ...)` for state changes
- `window.addEventListener('offline', ...)` for state changes

**Integration Points:**

- Must work with existing service worker (`public/sw.js`)
- Should not conflict with existing axios offline handling
- Must render above all other content (z-index consideration)

**Existing Patterns to Follow:**

- Component location: `apps/client/src/components/pwa/`
- Hook location: `apps/client/src/hooks/`
- Styling: Tailwind CSS with Shadcn/UI patterns
- Testing: Vitest with React Testing Library

**Copy (Spanish):**

- Offline: "Sin conexión a internet"
- Restored: "Conexión restaurada"

### Implementation Notes

Based on research from production codebases:

1. **Hook pattern** (from Plane, WebDevSimplified):

```typescript
const [isOnline, setIsOnline] = useState(
  typeof navigator !== 'undefined' ? navigator.onLine : true,
);
```

2. **Banner pattern** (from clickhouse-monitoring):

- Sticky top positioning
- Animated indicator (optional pulsing dot)
- Clear message explaining impact
- Auto-reload consideration when back online

3. **Event cleanup** is critical:

```typescript
useEffect(() => {
  const handler = () => setIsOnline(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}, []);
```
