# Specification: Robust Logging System

## Goal

Implement a comprehensive, structured logging system for both the NestJS backend and React frontend that enables reliable system behavior analysis and debugging. The system will support multiple log levels (from verbose development to production-safe), structured JSON output, automatic context injection (request IDs, correlation IDs, user context), and built-in sensitive data sanitization.

## User Stories

- As a **developer**, I want structured JSON logs with correlation IDs so that I can trace requests across services and debug issues in production efficiently.
- As a **devops engineer**, I want configurable log levels via environment variables so that production runs with minimal noise while development can be verbose for debugging.
- As a **physiotherapist**, I want my sensitive patient data to never appear in logs, even when debugging system issues, to ensure HIPAA compliance and privacy.

## Specific Requirements

### Shared Logger Package (`@mamirri/logger`)

- Create a new shared package at `packages/logger/` for TypeScript types, configuration interfaces, and constants
- Export `LogLevel` enum with values: DEBUG (10), VERBOSE (15), INFO (20), WARN (30), ERROR (40), FATAL (50), SILENT (100)
- Export `LogEntry` interface with required fields: timestamp, level, levelNum, message, service, and optional fields for correlation, user, metadata, error
- Export `LoggerConfig` interface for environment-based configuration (level, format, output, serviceName, version, environment)
- Export sanitization patterns as constants: EMAIL, PHONE, SSN, CREDIT_CARD, JWT, API_KEY, PASSWORD

### Backend Logger Module (NestJS)

- Create `LoggerModule` at `apps/server/src/common/logger/` following existing module patterns
- Implement `LoggerService` with methods for each log level: `debug()`, `verbose()`, `info()`, `warn()`, `error()`, `fatal()`
- Inject via NestJS dependency injection; use throughout application by importing module
- Environment configuration via `LOG_LEVEL`, `LOG_FORMAT`, `LOG_OUTPUT` environment variables
- Support SIGHUP signal for dynamic config reload without restart
- Async logging with configurable buffer (1000 messages, 1000ms flush interval)

### Log Format and Transport

- Structured JSON output with fields: timestamp (ISO 8601 UTC), level, levelNum, message, service, version, environment, requestId, correlationId, userId, sessionId, action, resource, resourceId, metadata, data (sanitized), error, stack, userImpact, retryable
- Development transport: console with color-coded output and pretty-printed JSON
- Production transport: JSON to stdout (no colors), Docker log driver compatible
- Request ID: Generate UUID per HTTP request using existing `CorrelationIdInterceptor` pattern
- Correlation ID: Propagate from request header, inject into all downstream logs (database, external APIs)

### Sanitization Service

- Implement automatic PII detection and redaction in log values using regex patterns
- Redaction output format: `[REDACTED - PATTERN_TYPE]` (e.g., `[REDACTED - EMAIL]`)
- Blocked fields never logged: password, passwordHash, token, accessToken, refreshToken, apiKey, creditCard, cvv, ssn
- Sanitize all metadata and data fields before logging; preserve structure but redact values

### Error Logging Integration

- Integrate with existing `AllExceptionsFilter` at `apps/server/src/common/filters/`
- Structured error logging with: name, message, code, stack trace, metadata
- User impact classification: low | medium | high
- Retryable flag for operations that can be retried
- Error classification mapping: Validation/Business/Client (4xx) → WARN, Server (5xx) → ERROR, Critical → FATAL, Security → WARN/ERROR

### Audit Logging for Patient Access

- Create `AuditService` for immutable audit logs of patient record access
- Log: who (userId), when (timestamp), what (resource, resourceId), why (purpose statement), IP address, user agent
- Separate storage/retention from application logs; stricter access controls
- Trigger on patient record read, update, delete operations via decorator or middleware

### Frontend Logger (React)

- Create `Logger` class at `apps/client/src/lib/logger/` with methods matching backend levels
- Implement `useLogger()` hook for component-level logging with automatic lifecycle logging (mount/unmount, prop changes)
- API request/response interception for logging fetch/axios calls with timing
- Performance metrics logging: Core Web Vitals (LCP, FID, CLS) via `usePerformanceLogger()` hook
- React ErrorBoundary integration for catching and logging component errors
- Offline queue with IndexedDB storage (max 100 messages) for when connectivity is lost
- Batch transmission to backend log endpoint when connectivity returns

### Correlation Between Frontend and Backend

- Frontend generates correlationId on app init or from URL parameter
- Include correlationId in all API requests via `X-Correlation-ID` header
- Backend uses existing `CorrelationIdInterceptor` to propagate and return correlationId in response header
- Full request trace: frontend action → API call → backend processing → response

### Log Aggregation Endpoint (Backend)

- Create POST `/api/v1/logs` endpoint for receiving frontend logs
- Validate incoming logs (required fields, format, size limits)
- Forward to same structured logging system for consistency
- Rate limiting to prevent log flooding from client

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**CorrelationIdInterceptor** (`apps/server/src/common/interceptors/correlation-id.interceptor.ts`)

- Already generates UUID correlationIds and sets headers on request/response
- Extend to propagate correlationId to all log contexts
- Reuse pattern for request ID generation and header management

**AllExceptionsFilter** (`apps/server/src/common/filters/all-exceptions.filter.ts`)

- Already handles error logging using NestJS Logger
- Integrate new structured logger while preserving error handling logic
- Reuse correlationId extraction from headers: `headers['x-correlation-id']`
- Extend with structured error format and user impact classification

**NestJS Module Patterns** (`apps/server/src/common/`)

- LoggerModule should follow existing module structure (module, service, config)
- Use dependency injection for LoggerService
- Export constants and types for consumer modules

**Environment Configuration** (existing `.env` patterns)

- Reuse environment variable loading pattern for LOG_LEVEL, LOG_FORMAT, LOG_OUTPUT
- Support existing environment values: NODE_ENV, SERVICE_NAME, VERSION

## Out of Scope

- External service integrations (Datadog, Sentry, CloudWatch) - Future phase, plugin architecture only
- OpenTelemetry distributed tracing - Requires additional instrumentation, future phase
- Advanced log analytics dashboard - Basic admin viewer only, full analytics in future phase
- Log-based alerting system - Alerting based on logs, future phase
- Log retention policies beyond basic file rotation - Advanced retention in future phase
- Performance profiling beyond basic timing - Detailed profiling in future phase
- Real-time log streaming - WebSocket-based streaming, future phase
- Log-based anomaly detection - ML-based anomaly detection, future phase
- Log query language implementation - Simple filtering only, full search in future
- Grafana/Prometheus integration - Metrics dashboard, future phase
