# Task Breakdown: Robust Logging System

## Overview

Total Tasks: 6 Task Groups (28 Sub-tasks)
Execution Order: Shared Package → Backend Core → Backend Integration → Frontend Core → Frontend Integration → Testing

## Task List

### Shared Package Layer

#### Task Group 1: Logger Types and Constants Package

**Dependencies:** None

- [x] 1.0 Create shared `@mamirri/logger` package
  - [x] 1.1 Write 4 focused tests for logger types and sanitization patterns
    - Test LogLevel enum values and hierarchy ordering
    - Test LogEntry interface structure validation
    - Test sanitization pattern detection (email, phone, SSN, credit card, JWT)
    - Test LoggerConfig interface with environment variables
    - Limit to 4 tests maximum; focus on critical type behaviors
  - [x] 1.2 Create package structure at `packages/logger/`
    - `package.json` with name `@mamirri/logger`, TypeScript config
    - Export all types from `packages/logger/src/index.ts`
  - [x] 1.3 Implement LogLevel enum
    - Values: DEBUG (10), VERBOSE (15), INFO (20), WARN (30), ERROR (40), FATAL (50), SILENT (100)
    - Helper methods: `fromString()`, `isEnabled()`
  - [x] 1.4 Implement LogEntry and LoggerConfig interfaces
    - LogEntry: timestamp, level, levelNum, message, service, version, environment, requestId, correlationId, userId, sessionId, action, resource, resourceId, metadata, data, error, stack, userImpact, retryable
    - LoggerConfig: level, format, output, serviceName, version, environment, externalServices
  - [x] 1.5 Implement sanitization patterns as constants
    - EMAIL, PHONE, SSN, CREDIT_CARD, JWT, API_KEY, PASSWORD patterns
    - Blocked field names: password, passwordHash, token, accessToken, refreshToken, apiKey, creditCard, cvv, ssn
  - [x] 1.6 Run tests for Task Group 1
    - Run ONLY the 4 tests written in 1.1
    - Verify type exports work correctly
    - Verify sanitization patterns match expected values

**Acceptance Criteria:**

- The 4 tests written in 1.1 pass
- Package exports LogLevel, LogEntry, LoggerConfig, sanitization patterns
- TypeScript compilation succeeds without errors
- All enum values have correct numeric hierarchy

---

### Backend Core

#### Task Group 2: NestJS Logger Module and Service

**Dependencies:** Task Group 1

- [x] 2.0 Implement backend logger module
  - [x] 2.1 Write 5 focused tests for logger service
    - Test log level filtering (messages below threshold not logged)
    - Test structured JSON output format
    - Test console transport (pretty print in development)
    - Test stdout transport (JSON in production)
    - Test async buffering and flush behavior
    - Limit to 5 tests maximum; focus on core logging behaviors
  - [x] 2.2 Create `LoggerModule` at `apps/server/src/common/logger/`
    - `logger.module.ts` - NestJS module export
    - Register LoggerService in module providers
  - [x] 2.3 Implement `LoggerService`
    - Methods: debug(), verbose(), info(), warn(), error(), fatal()
    - Accept message, optional metadata, optional error
    - Auto-inject context: timestamp, service, version, environment
  - [x] 2.4 Implement log transport system
    - Console transport: color-coded, pretty-printed JSON (development)
    - Stdout transport: raw JSON, no colors (production)
    - Configurable via LOG_FORMAT environment variable
  - [x] 2.5 Implement async buffering
    - Buffer size: 1000 messages
    - Flush interval: 1000ms
    - Configurable on buffer full: drop | block | flush
    - Backpressure handling
  - [x] 2.6 Implement environment configuration
    - Read LOG_LEVEL, LOG_FORMAT, LOG_OUTPUT from env
    - Support SIGHUP signal for dynamic reload
    - Validate configuration on startup
  - [x] 2.7 Run tests for Task Group 2
    - Run ONLY the 5 tests written in 2.1
    - Verify log level filtering works
    - Verify JSON output structure
    - Verify transport switching by environment

**Acceptance Criteria:**

- The 5 tests written in 2.1 pass
- LoggerService methods work for all log levels
- JSON output includes all required fields
- Async buffering flushes correctly
- Environment config reload works without restart

---

### Backend Integration

#### Task Group 3: Correlation, Error Integration, and Audit

**Dependencies:** Task Group 2

- [x] 3.0 Integrate logger with existing NestJS infrastructure
  - [x] 3.1 Write 4 focused tests for correlation and error handling
    - Test request ID generation per HTTP request
    - Test correlation ID propagation to logs
    - Test error classification (4xx vs 5xx mapping)
    - Test audit log structure and required fields
    - Limit to 4 tests maximum; focus on integration behaviors
  - [x] 3.2 Enhance correlation ID handling
    - Extend existing `CorrelationIdInterceptor` pattern
    - Generate UUID requestId per HTTP request
    - Extract/create correlationId from request header
    - Inject into all log entries automatically
  - [x] 3.3 Integrate with `AllExceptionsFilter`
    - Replace existing console.error and Logger calls with structured logger
    - Extract correlationId from headers (existing pattern)
    - Implement error classification mapping:
      - Validation/Business/Client (4xx) → WARN
      - Server (5xx) → ERROR
      - Critical (uncaught) → FATAL
      - Security → WARN/ERROR
    - Add userImpact classification: low | medium | high
    - Add retryable flag for operations
  - [x] 3.4 Implement `AuditService` for patient access logs
    - Log: userId, timestamp, resource, resourceId, action, purpose, IP, userAgent
    - Separate storage/retention from application logs
    - Implement as decorator `@AuditLog()` for patient endpoints
    - Immutable record format
  - [x] 3.5 Implement `SanitizationService`
    - Apply regex patterns to all metadata and data fields
    - Replace sensitive values with `[REDACTED - PATTERN_TYPE]`
    - Block entire objects with blocked field names
    - Preserve structure but sanitize values
  - [x] 3.6 Create log aggregation endpoint
    - POST `/api/v1/logs` for frontend log ingestion
    - Validate incoming log format and required fields
    - Rate limiting: 100 logs/minute per user
    - Forward to structured logging system
  - [x] 3.7 Run tests for Task Group 3
    - Run ONLY the 4 tests written in 3.1
    - Verify correlation ID in all logs
    - Verify error classification mapping
    - Verify audit log structure

**Acceptance Criteria:**

- The 4 tests written in 3.1 pass
- Correlation ID appears in all backend logs
- Error logging uses structured format with userImpact
- Audit logs capture patient access with required fields
- Sanitization redacts PII from logs
- Log aggregation endpoint receives and processes frontend logs

---

### Frontend Core

#### Task Group 4: React Logger Class and Hooks

**Dependencies:** Task Group 1

- [x] 4.0 Implement frontend logger utilities
  - [x] 4.1 Write 4 focused tests for frontend logger
    - Test logger methods for all log levels
    - Test context injection (service, version, environment)
    - Test sanitization of log values
    - Test offline queue storage and retrieval
    - Limit to 4 tests maximum; focus on frontend behaviors
  - [x] 4.2 Create `Logger` class at `apps/client/src/lib/logger/`
    - Methods: debug(), verbose(), info(), warn(), error(), fatal()
    - Accept message, metadata, optional error
    - Auto-inject frontend context: service, version, environment
  - [x] 4.3 Implement `useLogger()` hook
    - Return logger instance with component name bound
    - Auto-log component mount/unmount with props
    - Track prop changes between renders
  - [x] 4.4 Implement `usePerformanceLogger()` hook
    - Track Core Web Vitals: LCP, FID, CLS
    - Log performance metrics on page unload
    - Send to backend log aggregation endpoint
  - [x] 4.5 Implement client-side sanitization
    - Reuse sanitization patterns from shared package
    - Apply to all log metadata and data before sending
  - [x] 4.6 Implement offline queue with IndexedDB
    - Store up to 100 messages when offline
    - Max retry attempts: 3 per message
    - Batch transmit when connectivity returns
    - Queue persistence across browser sessions
  - [x] 4.7 Run tests for Task Group 4
    - Run ONLY the 4 tests written in 4.1
    - Verify logger methods work correctly
    - Verify context injection
    - Verify offline queue functionality

**Acceptance Criteria:**

- The 4 tests written in 4.1 pass
- Logger class methods work for all log levels
- useLogger() hook auto-logs component lifecycle
- usePerformanceLogger() captures Web Vitals
- Offline queue persists and transmits correctly

---

### Frontend Integration

#### Task Group 5: API Interception and Error Boundary

**Dependencies:** Task Group 4

- [x] 5.0 Integrate frontend logger with React application
  - [x] 5.1 Write 3 focused tests for frontend integration
    - Test API request/response interception with logging
    - Test ErrorBoundary catches and logs component errors
    - Test correlation ID propagation to backend
    - Limit to 3 tests maximum; focus on integration behaviors
  - [x] 5.2 Implement API request/response interception
    - Intercept fetch calls (or axios if used)
    - Log request: URL, method, correlationId, timing start
    - Log response: status, timing end, error if any
    - Apply sanitization to request/response bodies
  - [x] 5.3 Implement correlation ID propagation
    - Generate correlationId on app init or from URL
    - Store in sessionStorage for persistence
    - Include in all API requests via `X-Correlation-ID` header
    - Match backend correlationId for full trace
  - [x] 5.4 Create `LoggerErrorBoundary` component
    - Wrap around page components
    - Catch React render errors
    - Log error with full context (component stack, props)
    - Show fallback UI with error message
  - [x] 5.5 Implement user interaction tracking
    - Track major user actions: page views, button clicks, form submissions
    - Log with correlationId and timestamp
    - Include userId if authenticated
  - [x] 5.6 Integrate with main app
    - Initialize logger in app root with config
    - Wrap pages with LoggerErrorBoundary
    - Register API interceptor
  - [x] 5.7 Run tests for Task Group 5
    - Run ONLY the 3 tests written in 5.1
    - Verify API logging captures requests/responses
    - Verify ErrorBoundary catches and logs errors
    - Verify correlation ID propagates to backend

**Acceptance Criteria:**

- The 3 tests written in 5.1 pass
- All API calls logged with timing and correlation ID
- Component errors caught and logged with full context
- Correlation ID matches between frontend and backend logs
- User interactions logged with proper context

---

### Testing

#### Task Group 6: Test Review and Gap Analysis

**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps
  - [x] 6.1 Review tests from all Task Groups
    - Review 4 tests from Task Group 1 (types and sanitization)
    - Review 5 tests from Task Group 2 (backend logger service)
    - Review 4 tests from Task Group 3 (correlation and errors)
    - Review 4 tests from Task Group 4 (frontend logger)
    - Review 3 tests from Task Group 5 (frontend integration)
    - Total existing tests: 20
  - [x] 6.2 Analyze test coverage gaps for logging system
    - Identify critical workflows lacking test coverage
    - Focus on: log flow from frontend to backend, error propagation, offline queue behavior
    - Do NOT assess entire application coverage
  - [x] 6.3 Write up to 6 additional strategic tests maximum
    - Test end-to-end log flow: frontend → backend aggregation → structured output
    - Test error propagation from exception filter through to logged output
    - Test offline queue: storage → connectivity return → batch transmission
    - Test correlation ID end-to-end trace
    - Test sanitization of complex nested objects
    - Test buffer overflow behavior
  - [x] 6.4 Run feature-specific tests only
    - Run 20 tests from Task Groups 1-5
    - Run 6 additional tests from 6.3
    - Total: 26 tests
    - Do NOT run entire application test suite
    - Verify all logging workflows pass

**Acceptance Criteria:**

- All 26 feature-specific tests pass (20 from groups + 6 additional)
- Critical logging workflows are covered:
  - Structured log output format
  - Correlation ID propagation
  - Error logging with classification
  - Frontend-to-backend log flow
  - Offline queue behavior
  - Sanitization of sensitive data
- No critical gaps in testing coverage
- Tests focused exclusively on logging system requirements

---

## Execution Order

Recommended implementation sequence:

1.  **Task Group 1:** Shared Logger Package (Foundation - no dependencies)
2.  **Task Group 2:** Backend Logger Module and Service (depends on 1)
3.  **Task Group 3:** Correlation, Error Integration, Audit (depends on 2)
4.  **Task Group 4:** Frontend Logger Class and Hooks (depends on 1)
5.  **Task Group 5:** API Interception and Error Boundary (depends on 4)
6.  **Task Group 6:** Test Review and Gap Analysis (depends on 1-5)

## File Structure Summary

```
packages/logger/
├── src/
│   ├── index.ts              # Public exports
│   ├── types.ts              # LogLevel, LogEntry, LoggerConfig
│   └── constants.ts          # Sanitization patterns
├── package.json
└── tsconfig.json

apps/server/src/common/logger/
├── logger.module.ts          # NestJS module
├── logger.service.ts         # Core logging service
├── logger.config.ts          # Configuration
├── sanitization.service.ts   # PII sanitization
├── audit.service.ts          # Audit logging
└── logs.controller.ts        # Log aggregation endpoint

apps/client/src/lib/logger/
├── index.ts                  # Public API
├── logger.ts                 # Logger class
├── hooks/
│   ├── useLogger.ts          # Main hook
│   └── usePerformanceLogger.ts # Web Vitals
├── sanitization.ts           # Client sanitization
├── error-boundary.tsx        # Error boundary component
└── queue.ts                  # Offline queue with IndexedDB
```

---

## Test Summary

| Task Group | Tests Written | Focus Area                                    |
| ---------- | ------------- | --------------------------------------------- |
| 1          | 4             | Types, enums, sanitization patterns           |
| 2          | 5             | Backend logger service, transports, buffering |
| 3          | 4             | Correlation, error handling, audit            |
| 4          | 4             | Frontend logger, hooks, offline queue         |
| 5          | 2             | API interception, error boundary, correlation |
| 6          | 6             | End-to-end flows, gaps filling                |
| **Total**  | **25**        | Feature-specific tests                        |
