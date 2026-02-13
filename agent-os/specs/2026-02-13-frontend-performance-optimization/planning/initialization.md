# Frontend Performance Optimization

## Initial Description

Implement Vercel React Best Practices recommendations for the Mamirri React + Vite SPA:

1. **TanStack Query**: Add for data fetching, caching, and automatic request deduplication (replace manual useEffect patterns)
2. **Code Splitting**: Use React.lazy() for heavy routes (Biblioteca, Plantillas, Analisis)
3. **useTransition**: Add for non-urgent UI updates (filtering/searching large lists)
4. **Defer Sentry**: Load after hydration to reduce initial bundle
5. **Barrel Import Audit**: Ensure direct imports from packages

## Assessment Summary

| Category       | Current State                  | Target State            |
| -------------- | ------------------------------ | ----------------------- |
| Data Fetching  | Manual useEffect + useCallback | TanStack Query          |
| Code Splitting | None                           | React.lazy routes       |
| Re-render      | Inconsistent memo              | useTransition for lists |
| Bundle         | Sentry synchronous             | Deferred loading        |
| Imports        | Likely OK                      | Verify direct imports   |

## Tech Stack Context

- React 19 + Vite SPA (NOT Next.js)
- React Router 7 for routing
- Manual fetch via axios in api/ folder
- Sentry for error tracking
- TanStack Query NOT currently installed

## Why Now

The app is growing in complexity. Without these optimizations:

- Data refetching causes UI jank
- Full bundle loads on initial page load
- Large list filtering blocks the main thread
- Sentry adds to TTI (Time to Interactive)
