# Spec Requirements: Frontend Performance Optimization

## Initial Description

Implement Vercel React Best Practices recommendations for the Mamirri React + Vite SPA:

1. **TanStack Query**: Add for data fetching, caching, and automatic request deduplication (replace manual useEffect patterns)
2. **Code Splitting**: Use React.lazy() for heavy routes (Biblioteca, Plantillas, Analisis)
3. **useTransition**: Add for non-urgent UI updates (filtering/searching large lists)
4. **Defer Sentry**: Load after hydration to reduce initial bundle
5. **Barrel Import Audit**: Ensure direct imports from packages

## Requirements Discussion

### First Round Questions

**Q1:** What's the priority order for implementing these optimizations?
**Answer:** All together, Data fetching first, Bundle size first - "All together" - implement all 4 in one effort

**Q2:** For TanStack Query migration, how extensive should the initial scope be?
**Answer:** Full migration - migrate all API calls (patients, users, media, analysis) to TanStack Query

**Q3:** How should we handle testing for these changes?
**Answer:** Add tests - add new tests for TanStack Query hooks and updated components

**Q4:** Are there existing data fetching patterns I should reference for consistency?
**Answer:** Yes, show patterns - reference existing API files in apps/client/src/api/

**Q5:** Are there any optimizations you'd like to exclude from this spec?
**Answer:** Include all 4 - implement TanStack Query, code splitting, useTransition, and Sentry deferral

### Existing Code to Reference

**Similar Features Identified:**

- **API Files to Migrate:**
  - `apps/client/src/api/patients.ts` - Patient CRUD operations
  - `apps/client/src/api/users.ts` - User profile operations
  - `apps/client/src/api/media.ts` - Media upload operations
  - `apps/client/src/api/ai-analysis.ts` - AI analysis operations

- **Current Fetching Patterns:**
  - Manual `useEffect` + `useCallback` in pages (Patients.tsx, PatientDetail.tsx, CaseDetail.tsx)
  - No request deduplication
  - No automatic stale-while-revalidate
  - No background refetching

- **Components to Update:**
  - `apps/client/src/pages/Dashboard.tsx`
  - `apps/client/src/pages/Patients.tsx`
  - `apps/client/src/pages/PatientDetail.tsx`
  - `apps/client/src/pages/CaseDetail.tsx`
  - `apps/client/src/pages/Perfil.tsx`
  - `apps/client/src/context/AuthProvider.tsx`

- **Routes for Code Splitting:**
  - `/biblioteca` - Biblioteca page
  - `/plantillas` - Plantillas page
  - `/analisis` - Analisis page

### Follow-up Questions

No follow-up questions required - all requirements clarified in first round.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - Technical refactoring, no visual changes.

## Requirements Summary

### Functional Requirements

#### 1. TanStack Query Integration

- Install `@tanstack/react-query` package
- Create QueryClient provider in App.tsx
- Replace manual `useEffect` + `useCallback` patterns with `useQuery` hooks
- Replace manual mutation handlers with `useMutation` hooks
- Configure proper stale times for each data type:
  - Patients: 5 minutes
  - User profile: 10 minutes
  - Media: No cache (upload-only)
  - AI Analysis: 1 minute
- Implement query invalidation on mutations
- Add request deduplication via TanStack Query's built-in mechanism

#### 2. Code Splitting (React.lazy)

- Use `React.lazy()` for route components:
  - Biblioteca
  - Plantillas
  - Analisis
- Add Suspense boundaries with loading fallbacks
- Consider lazy loading heavy components:
  - Charts (recharts)
  - PDF generation (jspdf, html2canvas)
  - 3D viewer (future)
- Verify bundle size reduction via Vite build analysis

#### 3. useTransition for Non-Urgent Updates

- Add `useTransition` to list filtering operations:
  - Patient list search/filter
  - Biblioteca search
  - Any large list sorting
- Ensure loading states don't block UI
- Set `isPending` states for loading indicators

#### 4. Sentry Deferral

- Modify Sentry initialization to load after initial render
- Use dynamic import pattern:

  ```ts
  // Instead of static import
  import * as Sentry from '@sentry/react';

  // Use dynamic import after hydration
  if (typeof window !== 'undefined') {
    import('@sentry/react').then((module) => {
      module.init({
        /* config */
      });
    });
  }
  ```

- Verify error tracking still works after deferral

#### 5. Barrel Import Audit

- Scan `apps/client/src/` for barrel imports (index.ts re-exports)
- Verify direct imports from packages in:
  - Component files
  - Hook files
  - API files
- Fix any indirect imports that increase bundle size

### Reusability Opportunities

- **TanStack Query hooks**: Create reusable query keys and custom hooks
- **Error handling**: Standardize error toast patterns across mutations
- **Loading states**: Create reusable loading skeleton components

### Scope Boundaries

**In Scope:**

1. Install and configure TanStack Query
2. Migrate all 4 API files (patients, users, media, ai-analysis) to use TanStack Query
3. Add React.lazy() for Biblioteca, Plantillas, Analisis routes
4. Add useTransition for patient list filtering
5. Defer Sentry initialization
6. Audit barrel imports and fix if needed
7. Add tests for new patterns

**Out of Scope:**

- Any UI/UX changes beyond loading states
- Backend changes
- Database schema changes
- React Server Components (not applicable - Vite SPA)
- Server-side caching (React.cache - not applicable)

### Technical Considerations

- **Framework**: React 19 + Vite (NOT Next.js)
- **Routing**: React Router 7
- **Current State**: Manual useEffect fetching, no deduplication, full bundle load
- **Target State**: TanStack Query + code splitting + deferred Sentry

- **Existing Patterns to Follow**:
  - Current API files use axios instance from `../lib/axios`
  - Pages use `useToast` hook for error feedback
  - Protected routes via `ProtectedRoute` component

- **Dependencies to Add**:
  - `@tanstack/react-query`

- **Configuration Files to Update**:
  - `apps/client/src/App.tsx` - Add QueryClientProvider
  - `apps/client/src/main.tsx` - Potentially move provider setup
  - `apps/client/vite.config.ts` - Build analysis

- **Testing Requirements**:
  - Add tests for TanStack Query hooks (useQuery, useMutation)
  - Verify query invalidation works
  - Verify loading states display correctly

### Implementation Order

1. Install TanStack Query
2. Set up QueryClient provider
3. Migrate patients API to useQuery/useMutation
4. Migrate users API
5. Migrate media API
6. Migrate ai-analysis API
7. Add React.lazy for routes
8. Add useTransition for filtering
9. Defer Sentry
10. Audit barrel imports
11. Add tests

### Estimated Effort

- TanStack Query setup: 1-2 hours
- API migration (4 files): 4-6 hours
- Code splitting: 1-2 hours
- useTransition: 1 hour
- Sentry deferral: 1 hour
- Barrel audit: 1 hour
- Tests: 2-3 hours

**Total Estimate**: 11-16 hours
