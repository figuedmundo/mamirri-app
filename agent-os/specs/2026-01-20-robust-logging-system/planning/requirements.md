# Spec Requirements: Robust Logging System

## Initial Description

From user's original description:

"we need to add logs to the projects, we need to have a robust way to analize the behaivor of the system and debug issues , the logs needs to be reliable and have several levels , from verbose to production level"

## Requirements Discussion

### First Round Questions

**Q1: Scope - Backend + Frontend?**
**Recommendation:** Both NestJS backend and React frontend with shared types package

**Answer:** Cover BOTH the NestJS backend AND the React frontend. Create a shared `@mamirri/logger` package for common types and configuration. Backend captures API, business logic, and database operations. Frontend captures UI state, user interactions, network requests, and performance metrics.

---

**Q2: Log Level Hierarchy**
**Recommendation:** 7-level hierarchy: DEBUG (10) → VERBOSE (15) → INFO (20) → WARN (30) → ERROR (40) → FATAL (50) → SILENT (100)

**Answer:** Implement standard hierarchy with VERBOSE separate from DEBUG. VERBOSE captures high-volume traces (every API call, every state change) useful during debugging sessions. DEBUG is for step-through debugging info (function args, return values). Production default: WARN. Development default: DEBUG or VERBOSE.

---

**Q3: Log Format & Output Destinations**
**Recommendation:** Structured JSON format with environment-adaptive transport

**Answer:** Structured JSON format with standard fields (timestamp, level, message, service, requestId, correlationId, userId, metadata, etc.). Transport strategy:

- **Development:** Console with color-coded output, pretty-printed JSON
- **Docker/Production:** JSON to stdout, no pretty-print, Docker log driver compatible
- **File-based (fallback):** JSON lines format, daily rotation via external tool, 7-day retention
- **Future plugins:** Datadog, Sentry, CloudWatch, OpenTelemetry adapters

---

**Q4: External Services Integration**
**Recommendation:** Plugin-based architecture for external services

**Answer:** Start with built-in JSON stdout for Docker/production. Implement plugin architecture for future external service integration:

- Datadog adapter
- Sentry adapter (error tracking)
- CloudWatch adapter
- OpenTelemetry exporter

This avoids vendor lock-in and allows starting simple.

---

**Q5: Log Context Fields**
**Recommendation:** Comprehensive context with automatic propagation

**Answer:** Include standard context fields:

- **Timestamp:** ISO 8601 UTC
- **Service Context:** service name, version, environment
- **Request Context:** requestId (per HTTP request), correlationId (distributed tracing)
- **User Context:** userId, sessionId (when available)
- **Operation Context:** action, resource, resourceId
- **Flexible Metadata:** Additional context per log statement
- **Sanitized Data:** Request/response payload with sensitive data redacted

Correlation ID flow: Generate on request arrival, propagate to all service methods, database queries, external API calls, and frontend via response header.

---

**Q6: Error Handling Integration**
**Recommendation:** Unified logging with structured error capture

**Answer:** Integrate structured error logging with:

- Error object: name, message, code, stack trace, metadata
- User impact indicator: low | medium | high
- Retryable flag for operations
- User-facing message for customer support
- Error classification:
  - Validation → WARN
  - Business → WARN
  - Client (4xx) → WARN
  - Server (5xx) → ERROR
  - Critical (uncaught) → FATAL
  - Security → WARN/ERROR

---

**Q7: Environment-Based Configuration**
**Recommendation:** Environment variables for all settings

**Answer:** Configure via environment variables:

- `LOG_LEVEL=debug|info|warn|error` - controls verbosity
- `LOG_FORMAT=pretty|json` - output format
- `LOG_OUTPUT=console|stdout|file` - transport
- `LOG_RETENTION_DAYS=7` - file retention
- External service API keys (optional)

Implement SIGHUP signal reload without restart for adjusting log levels during incidents.

---

**Q8: Blocking Behavior**
**Recommendation:** Non-blocking async logging with configurable buffering

**Answer:** Implement async logging architecture with:

- Always async in production
- Buffer size: 1000 messages
- Flush interval: 1000ms
- On buffer full: drop (configurable: drop | block | flush)
- On error: fallback transport or throw
- Performance target: ~0.1ms per log call (vs 1-5ms sync)

---

**Q9: Data Exclusions & Sanitization**
**Recommendation:** Automatic sanitization with configurable patterns

**Answer:** Implement automatic sanitization for:

- Email: `[REDACTED - EMAIL]`
- Phone: `[REDACTED - PHONE]`
- SSN: `[REDACTED - SSN]`
- Credit Card: `[REDACTED - CREDIT_CARD]`
- JWT Token: `[REDACTED - JWT]`
- Password/API Key: `[REDACTED - SECRET]`

Fields NEVER logged: password, passwordHash, token, accessToken, refreshToken, apiKey, creditCard, cvv, ssn.

Implement separate audit logging for patient record access (who, when, what, why, IP).

---

### Existing Code to Reference

**Similar Features Identified:**

- Feature: Global Exception Filters - Path: `apps/server/src/common/filters/`
  - Reference for consistent error handling integration
  - Logger should integrate with existing exception filter pattern

- Feature: API Documentation (Swagger) - Path: `apps/server/src/docs/`
  - Reference for configuration patterns in NestJS modules

- Feature: Frontend Toast Notifications - Path: `apps/client/src/components/ui/toaster.tsx`
  - Reference for error feedback mechanisms (UI integration)

No similar logging patterns found in current codebase. This is a new foundational system.

### Follow-up Questions

No follow-up questions needed. Comprehensive recommendations provided and accepted.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

**Core Logging System:**

- Create `@mamirri/logger` shared package for common types and configuration
- Implement 7-level log hierarchy (DEBUG, VERBOSE, INFO, WARN, ERROR, FATAL, SILENT)
- Structured JSON log format with standard context fields
- Environment-based log transport (console pretty-print for dev, JSON stdout for prod)
- Request ID and correlation ID generation and propagation
- Automatic context injection (service, version, environment, user)
- Async logging with configurable buffering and backpressure
- Environment variable configuration with dynamic reload (SIGHUP)
- Automatic PII/sensitive data sanitization
- Structured error logging with user impact classification
- Separate audit logging for patient record access

**Backend (NestJS) Features:**

- NestJS module and service for dependency injection
- Request interceptor for automatic requestId/correlationId
- Exception filter integration for error logging
- Database query logging (optional, configurable)
- External API call logging
- Log correlation between frontend and backend

**Frontend (React) Features:**

- React hooks and utilities for component lifecycle logging
- State change tracking (previous/next values)
- API request/response interception
- Performance metrics (Core Web Vitals: LCP, FID, CLS)
- React ErrorBoundary integration
- Offline queue with IndexedDB (max 100 messages)
- Batch transmission to backend log endpoint
- User interaction tracking (clicks, navigation, form submissions)

**External Services (Future Phase):**

- Plugin architecture for external log aggregation
- Sentry integration adapter
- Datadog integration adapter
- CloudWatch integration adapter
- OpenTelemetry export capability

### Reusability Opportunities

**Components to investigate:**

- Global exception filters in `apps/server/src/common/filters/` - integrate logger
- Toast notifications in `apps/client/src/components/ui/toaster.tsx` - error feedback UI
- API documentation configuration patterns

**Backend patterns to reference:**

- NestJS module configuration patterns
- Dependency injection patterns
- Interceptor patterns (for request ID propagation)

**Similar features to model after:**

- Environment-based configuration patterns from Prisma/database config
- Docker Compose logging configuration for production
- GitHub Actions workflow logging

### Scope Boundaries

**In Scope:**

- [x] Create shared `@mamirri/logger` package
- [x] Implement backend NestJS logger module
- [x] Implement frontend React logger utilities
- [x] Implement 7-level log hierarchy
- [x] Implement structured JSON log format
- [x] Implement request/correlation ID propagation
- [x] Implement environment-based configuration
- [x] Implement async buffering with backpressure
- [x] Implement PII/sensitive data sanitization
- [x] Implement structured error logging
- [x] Implement audit logging for patient access
- [x] Implement frontend offline queue
- [x] Create admin log viewer UI (basic)
- [x] Write unit tests for core functionality

**Out of Scope:**

- External service integrations (Datadog, Sentry, CloudWatch) - Future phase
- OpenTelemetry distributed tracing - Future phase
- Advanced log analytics dashboard - Future phase
- Log-based alerting system - Future phase
- Log retention policies beyond basic file rotation - Future phase
- Performance profiling beyond basic timing - Future phase
- Real-time log streaming - Future phase
- Log-based anomaly detection - Future phase

### Technical Considerations

**Integration Points:**

- NestJS dependency injection system
- NestJS exception filters
- React component lifecycle
- React ErrorBoundary
- Fetch/Axios interceptors for API logging
- Docker log aggregation
- Environment configuration system

**Existing System Constraints:**

- NestJS backend on port 3000
- React frontend on port 5173
- TypeScript monorepo with pnpm workspaces
- Docker-based deployment
- PostgreSQL database

**Technology Preferences Stated:**

- NestJS (Backend Framework)
- React 19 (Frontend Framework)
- TypeScript (Language)
- Docker (Containerization)
- JSON structured logging (Format)

**Similar Code Patterns to Follow:**

- `apps/server/src/common/` - Standard location for shared utilities
- `apps/client/src/lib/` - Standard location for client utilities
- Environment-based config patterns from existing `.env` setup
- Docker Compose logging configuration patterns

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Create `@mamirri/logger` shared package
- [ ] Implement basic logger with levels
- [ ] Environment-based configuration
- [ ] Console output (dev) + JSON stdout (prod)
- [ ] Basic context (timestamp, level, message, service)

### Phase 2: Context & Correlation (Week 2)

- [ ] Request ID generation and propagation
- [ ] Correlation ID for distributed tracing
- [ ] User context injection
- [ ] Metadata support
- [ ] Sanitization rules

### Phase 3: Error Integration (Week 3)

- [ ] Structured error logging
- [ ] Error classification
- [ ] User impact indicators
- [ ] Error boundaries integration (frontend)
- [ ] Stack trace formatting
- [ ] Audit logging for patient access

### Phase 4: Advanced Features (Week 4)

- [ ] Async buffering with configurable backpressure
- [ ] Frontend logger with offline support
- [ ] Log aggregation endpoint
- [ ] Performance metrics
- [ ] Basic log viewer UI (admin)
- [ ] Unit tests for core functionality

---

## File Structure

```
apps/server/src/common/logger/
├── logger.module.ts          # NestJS module
├── logger.service.ts         # Core logging service
├── logger.config.ts          # Configuration
├── log-level.enum.ts         # Log level enum
├── log-entry.interface.ts    # Log entry interface
├── correlation.interceptor.ts # Request ID propagation
├── exception.filter.ts       # Error logging integration
├── sanitization.service.ts   # PII sanitization
└── audit.service.ts          # Audit logging

apps/client/src/lib/logger/
├── index.ts                  # Public API
├── logger.ts                 # Core logger
├── hooks/
│   ├── useLogger.ts          # Main hook
│   ├── useComponentLogger.ts # Component lifecycle
│   └── usePerformanceLogger.ts # Web Vitals
├── sanitization.ts           # Client-side sanitization
├── error-boundary.tsx        # Error boundary component
└── queue.ts                  # Offline queue with IndexedDB

packages/logger/              # Shared package
├── src/
│   ├── index.ts              # Public exports
│   ├── types.ts              # Shared types
│   ├── config.ts             # Config interface
│   └── constants.ts          # Sanitization patterns
├── package.json
└── tsconfig.json
```

---

## Next Steps

1. Proceed to Phase 1 implementation
2. Create logger package structure
3. Implement core logging functionality
4. Integrate with existing NestJS application
5. Add tests
6. Verify in development and production environments
