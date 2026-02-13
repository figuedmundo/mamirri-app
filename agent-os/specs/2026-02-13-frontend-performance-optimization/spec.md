# Specification: Frontend Performance Optimization

## Final Results

- **TanStack Query**: Implemented across all API modules (Patients, Users, Media, AI Analysis). Automatic request deduplication and caching added.
- **Code Splitting**: Biblioteca, Plantillas, and Analisis routes are now lazy-loaded with Suspense boundaries.
- **useTransition**: Added to `PatientList` for non-blocking search and filter experience.
- **Sentry Deferral**: Initialization moved to `lib/sentry-init.ts` and deferred until after hydration in `main.tsx`.
- **Barrel Audit**: Verified direct imports and fixed directory-based imports in `App.tsx` and `CaseDetailLayout.tsx`.
- **Bundle Size**: Initial `index.js` was 1,200.87 kB. Final is 1,212.75 kB. Slight increase due to TanStack Query addition, but features are now properly chunked.
- **Testing**: 355/355 tests passing. Added tests for `use-patients` and `use-users` hooks. Updated existing component tests to support `QueryClientProvider`.

## Goal

Implement Vercel React Best Practices recommendations for the Mamirri React + Vite SPA to improve data fetching, reduce bundle size, and optimize rendering performance.

## User Stories

- As a developer, I want automatic request deduplication so that multiple component mounts don't trigger redundant API calls.
- As a user, I want faster initial page loads so that the app feels more responsive on slower connections.
- As a user, I want smooth list filtering so that searching through patients doesn't block the UI.

## Specific Requirements

**1. TanStack Query Integration**

- Install `@tanstack/react-query` package to the client app
- Create QueryClient with default stale times: Patients (5min), Users (10min), Media (0min), AI Analysis (1min)
- Wrap app with QueryClientProvider in App.tsx
- Replace manual `useEffect` + `useCallback` in Patients.tsx, PatientDetail.tsx, CaseDetail.tsx, Perfil.tsx with useQuery hooks
- Replace manual mutation handlers with useMutation hooks
- Implement queryKeyFactory for type-safe query keys: ['patients'], ['users'], ['media'], ['ai-analysis']
- Add query invalidation on mutations (invalidate 'patients' after create/update/delete)

**2. Code Splitting (React.lazy)**

- Convert static imports in App.tsx to React.lazy() for: Biblioteca, Plantillas, Analisis routes
- Wrap lazy components with Suspense boundaries showing loading spinner
- Add loading fallback component that matches app design (existing loading states in Patients.tsx)
- Consider lazy loading heavy dependencies: recharts, jspdf, html2canvas, framer-motion

**3. useTransition for List Filtering**

- Add useTransition hook to Patients.tsx for search/filter operations
- Update isLoading state to use isPending from useTransition
- Apply same pattern to Biblioteca search when implemented
- Ensure loading indicator doesn't block user interaction with other UI elements

**4. Sentry Deferral**

- Move Sentry initialization from main.tsx to a separate initialization file
- Load Sentry after first render using useEffect with empty dependency array
- Verify DSN exists before initializing (maintain existing behavior)
- Keep PII scrubbing logic (beforeSend hook)
- Handle case where Sentry import fails gracefully

**5. Barrel Import Audit**

- Scan apps/client/src/ directory for index.ts barrel exports
- Verify direct imports from packages (lucide-react, recharts, etc.) are not going through barrel files
- Fix any indirect imports that cause larger bundle sizes
- Run vite build before/after to measure bundle size changes

## Existing Code to Leverage

**apps/client/src/api/patients.ts**

- Current pattern: manual axios calls with mapPatient transformation
- Reuse: keep axios calls in API layer, wrap with useQuery/useMutation in components
- Pattern to replicate for users.ts, media.ts, ai-analysis.ts

**apps/client/src/hooks/use-toast.ts**

- 47 usages across app for error feedback
- Reuse: continue using useToast for mutation error handling in TanStack Query onError callbacks

**apps/client/src/pages/Patients.tsx**

- Current loading state pattern using manual loading state
- Reuse: match existing loading UI for Suspense fallback

**apps/client/src/main.tsx**

- Current Sentry initialization with DSN check, PII scrubbing, environment config
- Reuse: preserve all existing Sentry config in deferred initialization

## Out of Scope

- React Server Components (not applicable to Vite SPA)
- Server-side caching with React.cache
- Backend API changes
- Database schema modifications
- UI/UX changes beyond loading state updates
- TanStack Query devtools in production
- Service Worker updates (existing PWA setup out of scope)
