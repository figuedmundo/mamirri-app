# Specification: Offline Indicator

## Goal

Add a persistent visual indicator that shows users when they are offline and confirms when connectivity is restored, giving them confidence about their connection state before attempting network-dependent actions.

## User Stories

- As a physiotherapist, I want to see immediately when I lose internet connection so that I know not to attempt actions that require the server.
- As a user, I want confirmation when my connection is restored so that I can resume normal app usage with confidence.

## Specific Requirements

**`useOnlineStatus` Hook**

- Create a reusable React hook at `apps/client/src/hooks/useOnlineStatus.ts`
- Return `{ isOnline: boolean, isOffline: boolean }` for consumer convenience
- Use `navigator.onLine` for initial state with SSR safety check (`typeof navigator !== 'undefined'`)
- Listen to `window.addEventListener('online', ...)` and `window.addEventListener('offline', ...)`
- Clean up event listeners in `useEffect` return function
- Track `wasOffline` state to trigger restoration message only after actual offline→online transition

**`OfflineBanner` Component**

- Create component at `apps/client/src/components/pwa/OfflineBanner.tsx`
- Use fixed positioning at top of viewport (`fixed top-0 left-0 right-0 z-[99]`)
- Display warning state when offline: amber/yellow background with "Sin conexión a internet" text
- Display success state when restored: green background with "Conexión restaurada" text
- Success state auto-dismisses after 3 seconds using `setTimeout`
- Include appropriate icon (WifiOff for offline, CheckCircle for restored) from lucide-react
- Do NOT include a dismiss button for offline state (reflects actual system state)

**Integration**

- Add `OfflineBanner` to `App.tsx` alongside existing `UpdateNotification` and `Toaster`
- Place banner outside `BrowserRouter` so it renders on all pages including auth pages
- Ensure z-index (99) is below toast viewport (100) but above all other content

**Styling**

- Follow existing Tailwind patterns from `offline.html` CSS variables
- Offline: `bg-amber-50 border-amber-200 text-amber-800`
- Restored: `bg-green-50 border-green-200 text-green-800`
- Slim height with appropriate padding (`py-2 px-4`)
- Flex layout with icon and text centered

**Accessibility**

- Use `role="alert"` for screen reader announcement
- Use `aria-live="polite"` for status changes
- Ensure sufficient color contrast (4.5:1 minimum)

**Language**

- Offline message: "Sin conexión a internet"
- Restored message: "Conexión restaurada"
- Match existing Spanish UI patterns in the app

**Testing**

- Unit test `useOnlineStatus` hook: initial state, event handling, cleanup
- Unit test `OfflineBanner` component: renders offline state, renders restored state, auto-dismisses

## Visual Design

No mockups provided. Design derived from:

- Existing `offline.html` styling (amber warning colors, DM Sans font)
- Standard banner patterns (Gmail, Slack offline indicators)
- Existing toast component styling for consistency

Reference layout:

```
┌─────────────────────────────────────────────────────────────┐
│ [WifiOff icon] Sin conexión a internet                      │
└─────────────────────────────────────────────────────────────┘
```

## Existing Code to Leverage

**`apps/client/src/lib/photo-queue.ts`**

- Contains `isOnline()` function wrapping `navigator.onLine`
- Contains `onOnline()` function for event listener pattern
- New hook will provide a more complete React-friendly implementation
- Consider deprecating these utilities in favor of the new hook in future

**`apps/client/src/components/pwa/UpdateNotification.tsx`**

- Reference for PWA-related component structure
- Pattern for integrating with `App.tsx`
- Shows how to use hooks with toast system

**`apps/client/src/hooks/useServiceWorker.ts`**

- Reference for hook structure and naming conventions
- Pattern for PWA-related React hooks
- Shows `useCallback` and `useEffect` patterns

**`apps/client/public/offline.html`**

- CSS variables for consistent styling (`--primary`, `--background`, etc.)
- Color scheme reference for offline state
- Icon styling patterns (WifiOff SVG)

**`apps/client/src/App.tsx`**

- Integration point for the new component (lines 142-143 pattern)
- Shows placement outside router for global visibility
- Existing `UpdateNotification` placement as reference

## Out of Scope

- Pending uploads indicator (queued photos count) — separate future feature
- Offline data sync progress UI — deferred to Part 4 of roadmap
- Updating `offline.html` language to Spanish — separate task
- Network quality indicators (slow connection warnings)
- Retry/reload button on the banner
- Integration with existing axios interceptor offline toast — keep both for now
- Service worker offline detection via `vite-plugin-pwa` — current manual SW is sufficient
- PWA manifest file (task 8.3)
- Animated pulsing indicator — keep it simple for MVP
