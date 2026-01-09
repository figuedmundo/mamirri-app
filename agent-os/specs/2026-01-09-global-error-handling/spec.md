# Specification: Global Error Handling

## Goal

Implement comprehensive error handling across backend and frontend with consistent error responses, correlation ID tracking for debugging, and user-friendly error notifications via toast messages and React Error Boundaries.

## User Stories

- As a developer, I want all API errors to return consistent response formats with correlation IDs so that I can quickly trace and debug issues across requests
- As a user, I want clear, actionable error messages displayed as toast notifications so that I understand what went wrong and how to fix it without seeing technical details
- As a developer, I want React Error Boundaries to catch rendering errors so that the application doesn't break completely when components fail, allowing graceful error recovery

## Specific Requirements

**Backend: Add Correlation ID Generation and Tracking**

- Create Correlation ID interceptor using NestJS Interceptor interface to generate UUID for each request
- Use NestJS built-in RandomUUID utility or equivalent for correlation ID generation
- Attach correlation ID to request context and include in response headers (X-Correlation-ID header)
- Update AllExceptionsFilter to extract correlation ID from request and include in error response body
- Maintain existing response format structure while adding correlationId field to response object
- Log correlation ID with all error messages for traceability in logs
- Register correlation ID interceptor in main.ts before global exception filter
- Ensure correlation ID persists through request lifecycle for successful and error responses

**Backend: Enhance Prisma Error Code Handling**

- Expand AllExceptionsFilter to handle additional Prisma error codes beyond P2002, P2025, P2003
- Add mapping for P2014 (change would violate required relation on fields) with 400 Bad Request status
- Add mapping for P2000 (value out of range for column) with 400 Bad Request status
- Add mapping for P2023 (inconsistent column data) with 400 Bad Request status
- Add mapping for P2011 (null constraint violation) with 400 Bad Request status
- Add mapping for P2013 (missing required value) with 400 Bad Request status
- Maintain generic 500 Internal Server Error for unknown Prisma error codes
- Ensure error messages are user-friendly without exposing internal database details

**Frontend: Extend Axios Error Response Interceptor**

- Add general error response handler to axios response interceptor in apps/client/src/lib/axios.ts
- Maintain existing 401 token refresh logic (do not break it)
- Extract user-friendly message from backend error response for non-401 errors (400, 403, 404, 500, etc.)
- Extract validation details array if present in error response for display
- Pass correlation ID from response headers to error context for debugging
- Reject promise with standardized error object containing message, details, and correlation ID
- Handle network errors (no response from server) with appropriate user-friendly message
- Ensure interceptor runs after auth token refresh logic to avoid conflicts

**Frontend: Implement Toast Notification System**

- Create toast notification utility using Shadcn/UI toast component for consistency with existing UI
- Install Shadcn/UI toast component via CLI (npx shadcn@latest add toast)
- Create helper functions for success, error, warning, and info toast notifications
- Support auto-dismissal with configurable duration (default 5 seconds)
- Support manual dismissal with close button in toast
- Position toasts consistently (top-right or bottom-right) across application
- Ensure toasts display above other UI elements with proper z-index
- Style toasts according to severity (error in red, success in green, warning in yellow)

**Frontend: Create React Error Boundary Component**

- Create ErrorBoundary component in apps/client/src/components/ErrorBoundary.tsx
- Implement React class component with componentDidCatch for catching rendering errors
- Create fallback UI with user-friendly error message and "Try Again" button
- Display error details (correlation ID if available) in expandable section for debugging
- Include button to reload page or return to dashboard on error
- Wrap only specific component trees where errors are likely (not entire App initially)
- Consider logging error details to error tracking service (future enhancement)
- Follow Shadcn/UI component patterns and styling conventions

**Frontend: Wrap Application with Error Boundary**

- Wrap App component in apps/client/src/App.tsx with ErrorBoundary
- Ensure ErrorBoundary is outside BrowserRouter to catch routing errors
- Test that ErrorBoundary catches component crashes and displays fallback UI
- Verify that existing navigation and routing continue to work correctly
- Ensure AuthProvider remains inside ErrorBoundary to maintain auth state
- Confirm that toast notifications still render correctly within Error Boundary
- Test with intentional component errors to verify graceful degradation
- Ensure error recovery (Try Again button) works without infinite error loops

**Frontend: Integrate Toast Notifications with Error Handler**

- Create toast utility file (apps/client/src/lib/toast.ts) or use Shadcn hook directly
- Modify axios error interceptor to trigger error toast for non-401 errors
- Display validation errors (400) with details in toast or separate UI component
- Display 403 Forbidden errors with "You don't have permission" message
- Display 404 Not Found errors with "Resource not found" message
- Display 500 Internal Server errors with generic "Something went wrong" message
- Include correlation ID in error toasts for debugging (optional/expanding)
- Avoid showing duplicate toasts for the same error within short timeframe

**Testing: Update Backend Exception Filter Tests**

- Update apps/server/src/common/filters/all-exceptions.filter.spec.ts
- Add test for correlation ID inclusion in error response body
- Add test for X-Correlation-ID header in response (when interceptor added)
- Add tests for new Prisma error codes (P2014, P2000, P2023, P2011, P2013)
- Verify existing tests for P2002, P2025, P2003 still pass
- Test that response format maintains backward compatibility (new fields are additions)
- Test logging includes correlation ID for error and warn level messages
- Mock HTTP adapter to verify reply is called with correct arguments

**Testing: Add Correlation ID Interceptor Tests**

- Create correlation-id.interceptor.spec.ts in apps/server/src/common/interceptors/
- Test that interceptor generates UUID for each request
- Test that correlation ID is attached to request object
- Test that correlation ID is added to response headers
- Test that same correlation ID persists through request lifecycle
- Mock Request and Response objects to verify interceptor behavior
- Test with NestJS ExecutionContext to verify interceptor registration
- Ensure interceptor does not modify request body or other headers
- Verify interceptor works for all HTTP methods (GET, POST, PUT, DELETE)

**Testing: Add Frontend Error Handling Tests**

- Update apps/client/src/lib/axios.test.ts for new error interceptor logic
- Add test for non-401 error handling (400, 403, 404, 500)
- Test that correlation ID is extracted from response headers
- Test that user-friendly message is extracted from error response
- Test that toast notifications are triggered for errors (mock toast function)
- Create ErrorBoundary.test.ts in apps/client/src/components/
- Test that ErrorBoundary catches rendering errors with componentDidCatch
- Test that fallback UI is displayed when error occurs
- Test that "Try Again" button triggers page reload or navigation
- Verify existing auth tests still pass after axios interceptor changes

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**Backend: AllExceptionsFilter (apps/server/src/common/filters/all-exceptions.filter.ts)**

- Implements NestJS ExceptionFilter interface with @Catch() decorator for global error handling
- Handles HttpException responses and extracts status code, message, and details
- Maps Prisma error codes (P2002, P2025, P2003) to appropriate HTTP status codes
- Logs errors with appropriate severity (error for 500+, warn for 4xx) using NestJS Logger
- Returns standardized response format with statusCode, timestamp, path, message, error, details fields
- Enhance this filter by adding correlation ID extraction from request and adding to response body

**Backend: Global Filter Registration (apps/server/src/main.ts)**

- Uses app.useGlobalFilters() to register AllExceptionsFilter globally
- Retrieves HttpAdapterHost from app container and passes to filter constructor
- Pattern to follow: register new correlation ID interceptor with app.useGlobalInterceptors()
- Maintain registration order: interceptors before filters to ensure correlation ID is available
- Keep global prefix (api/v1) and Swagger setup unchanged

**Frontend: Axios Instance (apps/client/src/lib/axios.ts)**

- Creates axios instance with baseURL='/api/v1' and default headers
- Implements request interceptor to inject Bearer token from localStorage
- Implements response interceptor to handle 401 errors with token refresh
- Uses retry flag (\_retry) to prevent infinite refresh loops
- Redirects to /login on failed token refresh
- Extend this by adding general error handler in response interceptor after auth logic

**Frontend: Context Pattern (apps/client/src/context/AuthContext.tsx)**

- Uses React Context API with createContext and useContext hooks
- Provides Provider component wrapping children with context value
- Exports custom hook (useAuth) for consuming context with error throwing
- Manages state (user, isLoading) with useState and localStorage persistence
- Pattern to follow for ErrorContext if implementing global error state management

**Frontend: Shadcn/UI Components (apps/client/src/components/ui/)**

- Uses Radix UI primitives (@radix-ui/react-slot) for accessible components
- Implements class-variance-authority (cva) for variant-based styling
- Uses cn utility function from lib/utils.ts for className merging
- Components use React.forwardRef for ref forwarding and TypeScript support
- Pattern to follow for toast component: similar structure with variants and exports

## Out of Scope

- Sentry or external error tracking service integration (defer to Week 11 Phase 2 Security & Performance)
- Retry logic implementation with exponential backoff (defer to client-side implementation)
- Advanced structured logging to external services or files (defer to Week 11)
- Error message localization or internationalization (defer to future milestone)
- Error analytics dashboards or monitoring UI (defer to future)
- Full offline error handling and queueing (defer to Phase 2.5 PWA work)
- Email or notification alerts for critical errors (defer to monitoring system)
- Custom error classes or exception types beyond NestJS built-in exceptions (defer as needed)
- Client-side validation error aggregation before submission (defer to specific feature implementation)
- Error recovery strategies beyond simple page reload (defer as needed)
