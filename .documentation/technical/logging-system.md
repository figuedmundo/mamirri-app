# Robust Logging System

## Overview

The Robust Logging System provides a unified, structured, and performant way to capture, process, and aggregate logs across the entire Mamirri application. It ensures observability from the frontend React components through to the NestJS backend services.

## Architecture

The system consists of three main layers:

### 1. Shared Foundation (`@mamirri/logger`)

Located in `packages/logger/`, this package provides:

- **Unified Types**: `LogLevel` enum and `LogEntry`/`LoggerConfig` interfaces.
- **Sanitization Patterns**: Regular expressions for identifying PII (Email, Phone, SSN, Credit Cards, etc.).
- **Constants**: Blocked fields and redacted placeholders.

### 2. Backend Engine (NestJS)

Located in `apps/server/src/common/logger/`, it handles:

- **Async Buffering**: Logs are buffered (1000 messages) and flushed every 1 second to minimize I/O impact.
- **Environment Transports**:
  - **Development**: Pretty-printed, color-coded JSON in the console.
  - **Production**: Raw JSON streamed to `stdout` for collection by external log aggregators.
- **PII Sanitization**: Automatically redacts sensitive information from log metadata and data objects.
- **Correlation ID**: Tracks request chains from the frontend through the backend using `X-Correlation-ID` headers.
- **Log Aggregation**: Exposes a POST `/api/v1/logs` endpoint to receive and process logs from the frontend.

### 3. Frontend Client (React)

Located in `apps/client/src/lib/logger/`, it provides:

- **Offline Resilience**: Logs are stored in `localStorage` when the browser is offline and automatically flushed when connectivity is restored.
- **Automatic Tracking**:
  - **Interaction**: Captures page views, button clicks, and form submissions automatically.
  - **Performance**: Tracks Core Web Vitals (LCP, CLS, INP) using `web-vitals`.
- **API Observability**: Axios interceptors log every request and response with performance metrics.
- **Error Boundary**: A custom React Error Boundary captures component crashes with full stack traces.

## Configuration

Logging behavior is controlled via environment variables in `.env`:

```bash
# Backend
LOG_LEVEL=info    # debug | verbose | info | warn | error | fatal
LOG_FORMAT=pretty # json | pretty
LOG_OUTPUT=console # stdout | console

# Frontend
VITE_LOG_LEVEL=debug
```

## Security & Privacy

The system implements strict sanitization rules:

- **Blocked Fields**: Fields like `password`, `ssn`, `creditCard`, and `token` are always redacted.
- **Pattern Matching**: String values matching PII patterns (email, phone numbers) are replaced with placeholders.
- **Audit Logging**: Sensitive patient access operations are logged via a dedicated `AuditService` for compliance tracking.

---

**Last Modified:** 2026-01-20
