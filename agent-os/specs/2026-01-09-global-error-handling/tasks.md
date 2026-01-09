# Task Breakdown: Global Error Handling

## Overview

Total Tasks: 3 task groups (18 sub-tasks)

## Task List

### Backend Error Handling

#### Task Group 1: Correlation ID and Prisma Error Enhancement

**Dependencies:** None

- [x] 1.0 Complete backend error handling enhancements
  - [x] 1.1 Write 2-8 focused tests for correlation ID interceptor
    - Test UUID generation for each request
    - Test correlation ID attachment to request and response
    - Test persistence through request lifecycle
    - Test interceptor works for all HTTP methods
    - Test that interceptor doesn't modify request body
  - [x] 1.2 Create correlation ID interceptor
    - File: apps/server/src/common/interceptors/correlation-id.interceptor.ts
    - Use NestJS RandomUUID utility for ID generation
    - Attach to request context and response headers (X-Correlation-ID)
    - Reuse pattern: Follow NestJS Interceptor interface
  - [x] 1.3 Register correlation ID interceptor in main.ts
    - Add app.useGlobalInterceptors() before app.useGlobalFilters()
    - Pass interceptor instance to global registration
    - Ensure registration order: interceptor before filter
  - [x] 1.4 Update AllExceptionsFilter tests
    - Add test for correlation ID in error response body
    - Add tests for new Prisma error codes (P2014, P2000, P2023, P2011, P2013)
    - Verify existing P2002, P2025, P2003 tests still pass
    - Test logging includes correlation ID
  - [x] 1.5 Enhance AllExceptionsFilter implementation
    - Extract correlation ID from request context
    - Add correlationId field to response body
    - Add Prisma error code mappings (P2014, P2000, P2023, P2011, P2013)
    - Maintain backward compatibility (add fields, don't change existing structure)
    - Reuse pattern: apps/server/src/common/filters/all-exceptions.filter.ts
  - [x] 1.6 Ensure backend error handling tests pass
    - Run ONLY tests from 1.1 and 1.4
    - Verify correlation ID tests pass
    - Verify all Prisma error code tests pass
    - Do NOT run entire backend test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 1.1 pass
- Correlation ID interceptor generates unique UUID per request
- Correlation ID is present in all response headers (X-Correlation-ID)
- Correlation ID is present in all error response bodies
- All new Prisma error codes are mapped to appropriate HTTP status codes
- Existing AllExceptionsFilter tests continue to pass

### Frontend Error Handling

#### Task Group 2: Toast, Error Interceptor, and Error Boundary

**Dependencies:** Task Group 1

- [x] 2.0 Complete frontend error handling components
  - [x] 2.1 Write 2-8 focused tests for axios error interceptor
    - Test non-401 error handling (400, 403, 404, 500)
    - Test correlation ID extraction from response headers
    - Test user-friendly message extraction
    - Test toast notification triggering
    - Test network error handling
  - [x] 2.2 Install Shadcn/UI toast component
    - Run: npx shadcn@latest add toast
    - Follow existing Shadcn component patterns
    - Verify component in apps/client/src/components/ui/toast.tsx
  - [x] 2.3 Create toast utility functions
    - File: apps/client/src/lib/toast.ts
    - Create functions: success, error, warning, info
    - Configure auto-dismissal (default 5 seconds)
    - Support manual dismissal with close button
    - Position toasts consistently (top-right)
  - [x] 2.4 Update axios error interceptor
    - File: apps/client/src/lib/axios.ts
    - Add general error handler after existing 401 auth logic
    - Extract user-friendly message from backend error response
    - Extract validation details array if present
    - Pass correlation ID from response headers
    - Trigger toast notifications for non-401 errors
    - Handle network errors gracefully
    - Reuse pattern: Existing axios interceptors (request and response)
  - [x] 2.5 Write 2-8 focused tests for ErrorBoundary component
    - Test that ErrorBoundary catches rendering errors
    - Test fallback UI displays correctly
    - Test "Try Again" button functionality
    - Test error details display (correlation ID)
  - [x] 2.6 Create ErrorBoundary component
    - File: apps/client/src/components/ErrorBoundary.tsx
    - Implement React class component with componentDidCatch
    - Create fallback UI with user-friendly error message
    - Add "Try Again" button (page reload)
    - Display error details in expandable section
    - Reuse pattern: Shadcn/UI component styling from apps/client/src/components/ui/
  - [x] 2.7 Wrap App component with ErrorBoundary
    - File: apps/client/src/App.tsx
    - Place ErrorBoundary outside BrowserRouter
    - Ensure AuthProvider remains inside ErrorBoundary
    - Verify routing and navigation still work correctly
  - [x] 2.8 Ensure frontend error handling tests pass
    - Run ONLY tests from 2.1 and 2.5
    - Verify axios error interceptor tests pass
    - Verify ErrorBoundary component tests pass
    - Do NOT run entire frontend test suite at this stage

**Acceptance Criteria:**

- The 2-8 tests written in 2.1 pass
- The 2-8 tests written in 2.5 pass
- Toast notifications display for errors (400, 403, 404, 500)
- Toast notifications display with appropriate severity colors
- Axios error interceptor maintains existing 401 token refresh logic
- ErrorBoundary catches rendering errors and displays fallback UI
- App is wrapped with ErrorBoundary and navigation still works

### Testing

#### Task Group 3: Test Review and Verification

**Dependencies:** Task Groups 1-2

- [x] 3.0 Review tests and verify end-to-end error handling
  - [x] 3.1 Review tests from Task Groups 1-2
    - Review 2-8 tests from backend (Task 1.1, 1.4)
    - Review 2-8 tests from frontend (Task 2.1, 2.5)
    - Total existing tests: approximately 8-16 tests
  - [x] 3.2 Analyze test coverage for error handling flows
    - Identify critical error workflows that lack coverage
    - Focus on: correlation ID flow, Prisma error mapping, toast triggers, ErrorBoundary catching
    - Prioritize integration between backend and frontend error handling
  - [x] 3.3 Write up to 8 additional strategic tests maximum
    - Add tests for correlation ID persistence across request/response
    - Add tests for toast notification with correlation ID display
    - Add tests for ErrorBoundary with intentional component error
    - Add integration test for full error flow (backend → frontend → toast)
    - Maximum of 8 new tests to fill critical gaps
  - [x] 3.4 Run feature-specific error handling tests only
    - Run ONLY tests related to error handling (tests from 1.1, 1.4, 2.1, 2.5, and 3.3)
    - Expected total: approximately 16-24 tests maximum
    - Do NOT run entire application test suite
    - Verify critical error workflows pass

**Acceptance Criteria:**

- All error handling tests pass (approximately 16-24 tests total)
- Correlation ID flow is tested end-to-end (backend → frontend)
- ErrorBoundary component is tested with intentional errors
- Toast notifications are tested with various error types
- No more than 8 additional tests added when filling gaps
- Testing focused exclusively on error handling requirements

## Execution Order

Recommended implementation sequence:

1. Backend Error Handling (Task Group 1)
2. Frontend Error Handling (Task Group 2)
3. Test Review and Verification (Task Group 3)
