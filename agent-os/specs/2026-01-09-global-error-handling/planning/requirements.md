# Spec Requirements: Global Error Handling

## Initial Description

Basic Error Handling: Global filters

## Requirements Discussion

### First Round Questions

**Q1:** I assume we need to handle common error types like validation errors, authentication errors, and not-found errors with consistent response formats across all API endpoints. Is that correct, or should we handle different error types with different response structures?
**Answer:** Yes, use consistent response formats across all API endpoints.

**Q2:** For error responses, I'm thinking we should use a standardized JSON format with fields like `statusCode`, `message`, `error`, and optionally `details` for validation errors. Should we include a `correlationId` for tracking, or keep it simpler?
**Answer:** Include correlationId for traceability.

**Q3:** I assume errors should be logged to console in development and to a structured log destination (file or external service) in production. Should we implement different logging levels (debug, info, warn, error) with different handling, or keep logging uniform?
**Answer:** Implement different logging levels (error, warn) with level-based handling.

**Q4:** For frontend error handling, should we implement React Error Boundaries to catch rendering errors, or focus primarily on API error handling with axios interceptors? Or both?
**Answer:** Implement both React Error Boundaries (for rendering errors) AND axios interceptors (for API errors).

**Q5:** I assume user-facing error messages should be friendly and actionable (e.g., "Please check your credentials" instead of "Unauthorized"), while technical details are logged for developers. Should we implement error message localization, or stick to English for now?
**Answer:** Use friendly user-facing messages with English only (defer localization).

**Q6:** Should we implement retry logic for specific error types (like network timeouts or 503 service unavailable), or let the client handle retries?
**Answer:** Defer retry logic to client-side (not in scope for this task).

**Q7:** For monitoring and alerting, should we integrate with error tracking services (like Sentry) in this phase, or defer that to a later milestone?
**Answer:** Defer to Week 11 (Phase 2 - Security & Performance).

### Existing Code to Reference

**Similar Features Identified:**

- **Feature:** Backend Global Exception Filter - Path: `apps/server/src/common/filters/all-exceptions.filter.ts`
  - Components to potentially reuse: Existing exception filter structure, HTTP exception handling, Prisma error mapping
  - Backend logic to reference: Response body structure (`statusCode`, `timestamp`, `path`, `message`, `error`, `details`), logging with severity levels
- **Feature:** Frontend Axios Instance - Path: `apps/client/src/lib/axios.ts`
  - Components to potentially reuse: Existing request/response interceptors, auth token handling, 401 error handling with token refresh
  - Backend logic to reference: Interceptor pattern for error handling
- **Feature:** Shadcn/UI Components - Path: `apps/client/src/components/ui/`
  - Components to potentially reuse: Button, Card, Input components for error UI
  - Backend logic to reference: Existing component patterns, styling approach

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

**Backend:**

- Enhance existing global exception filter to add correlation ID for request tracing
- Expand Prisma error code handling (currently handles P2002, P2025, P2003 - add more)
- Create correlation ID interceptor to generate unique ID per request and attach to response headers
- Maintain existing response format: `{ statusCode, timestamp, path, message, error, details, correlationId }`
- Keep existing logging behavior: error for 500+ status codes, warn for 4xx status codes

**Frontend:**

- Add general error response interceptor to axios for non-401 HTTP errors (400, 403, 404, 500, etc.)
- Extract and display user-friendly error messages from backend responses
- Implement toast notification system for user feedback (use Shadcn/UI toast component)
- Create React Error Boundary component to catch rendering errors in component tree
- Wrap App component with Error Boundary
- Create ErrorContext for global error state management (optional for this phase)

**Testing:**

- Update existing `all-exceptions.filter.spec.ts` tests
- Add tests for new correlation ID interceptor
- Add tests for enhanced error response interceptor
- Add tests for Error Boundary component
- Verify existing auth tests still pass

### Reusability Opportunities

- **Existing Pattern:** `apps/server/src/common/filters/all-exceptions.filter.ts` - enhance this file rather than replacing it
- **Existing Pattern:** `apps/client/src/lib/axios.ts` - extend interceptors, add new error handler after auth logic
- **Existing Pattern:** Shadcn/UI component structure - follow same conventions for toast and Error Boundary components
- **Backend Pattern:** NestJS ExceptionFilter interface - continue implementing this interface
- **Frontend Pattern:** Context API usage (AuthContext exists) - create similar ErrorContext for consistency

### Scope Boundaries

**In Scope:**

- Backend: Add correlation ID generation and tracking to error responses
- Backend: Expand Prisma error code mapping (add common codes beyond P2002, P2025, P2003)
- Backend: Create correlation ID interceptor
- Frontend: Add general error response handler to axios interceptor
- Frontend: Implement Shadcn/UI toast notifications for user feedback
- Frontend: Create React Error Boundary component for rendering errors
- Frontend: Wrap App component with Error Boundary
- Tests: Update existing tests and add new test coverage

**Out of Scope:**

- ❌ Sentry or external error tracking service integration (defer to Week 11)
- ❌ Retry logic implementation (defer to client-side)
- ❌ Advanced structured logging to external services (defer to Week 11)
- ❌ Error message localization (defer to future milestone)
- ❌ Error analytics dashboards (defer to future)
- ❌ Full offline error handling (defer to Phase 2.5 PWA work)

**Future Enhancements Mentioned:**

- Error tracking service (Sentry) integration in Phase 2
- Advanced logging with external services
- Client-side retry logic with exponential backoff
- Error message localization

### Technical Considerations

**Integration Points:**

- Backend: Integrate with existing NestJS exception filter pipeline
- Backend: Register new correlation ID interceptor in main.ts or app.module.ts
- Frontend: Extend existing axios instance in `apps/client/src/lib/axios.ts`
- Frontend: Integrate toast with Shadcn/UI component library
- Frontend: Wrap App.tsx root component with Error Boundary

**Existing System Constraints:**

- Backend: Must maintain existing response format (add fields, don't change existing structure)
- Frontend: Must preserve existing auth token refresh logic in axios interceptors
- Frontend: Must work with existing AuthContext and ProtectedRoute components
- Backend: Must maintain existing Prisma error handling (enhance, don't break)
- Tests: Must ensure existing auth tests (apps/client/src/components/auth/ProtectedRoute.test.tsx) continue passing

**Technology Preferences Stated:**

- Use Shadcn/UI for toast component (already using Shadcn/UI)
- No new external dependencies for backend (use NestJS built-in utilities)
- For frontend: Use Shadcn UI toast OR react-hot-toast (recommended Shadcn for consistency)
- Use NestJS UUID utility for correlation ID generation
- TypeScript for all new code (consistent with project)

**Similar Code Patterns to Follow:**

- Backend: Follow existing `all-exceptions.filter.ts` pattern for exception handling
- Backend: Follow NestJS interceptor pattern for correlation ID (reference existing interceptor folder)
- Frontend: Follow existing axios interceptor pattern in `apps/client/src/lib/axios.ts`
- Frontend: Follow existing component structure in `apps/client/src/components/ui/` for toast/Error Boundary
- Frontend: Follow existing context pattern (AuthContext.tsx) for ErrorContext if created
- Tests: Follow existing test patterns in `all-exceptions.filter.spec.ts` and axios tests
