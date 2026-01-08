# ADR-005: Automated Infrastructure Initialization Strategy

**Status:** ✅ Accepted  
**Date:** 2026-01-08  
**Deciders:** Sisyphus (AI), User

---

## Context

The initial development setup was manual and error-prone. Issues included:

- Monorepo environment variables (`.env`) failing to interpolate correctly in Prisma.
- Database tables not existing before the first seed attempt.
- Manual intervention required to generate JWT secrets and MinIO buckets.

---

## Decision

We moved to a **"Single Script, Fully Automated"** infrastructure strategy centered around `scripts/setup-dev.sh`.

Key Components:

1.  **Docker Init Hook**: Added `scripts/init-db.sql` mounted to `/docker-entrypoint-initdb.d/` in Postgres. This ensures the physical database exists before any application code attempts a connection.
2.  **Secret Injection**: The setup script now automatically invokes `scripts/generate-password.sh` to populate `JWT_SECRET` in `.env` if it's missing.
3.  **Environment Isolation**: To bypass monorepo variable resolution bugs, the setup script explicitly constructs and exports the `DATABASE_URL` during migration and seeding phases.
4.  **MinIO Auto-Provisioning**: Uses the MinIO Client (`mc`) inside the container to create and set permissions for the `physio-media` bucket automatically.

---

## Consequences

### Positive

- ✅ **Reproducibility**: Any developer can get a perfect environment with one command.
- ✅ **Resilience**: The setup is idempotent—running it twice fixes broken states without destroying data.
- ✅ **Clean Resets**: `docker compose down -v && ./scripts/setup-dev.sh` provides a reliable "factory reset" for development.

### Negative

- ⚠️ Logic duplication: The `DATABASE_URL` construction logic exists in both the `.env` template and the `setup-dev.sh` script.

---

## Alternatives Considered

### Option A: Manual Setup (Rejected)

Rejected as it leads to inconsistent environments and high onboarding friction.

### Option B: Docker-only Initialization (Rejected)

Rejected because Docker cannot easily handle TypeScript seeding or `pnpm` installation across a monorepo. A hybrid Bash/Docker approach was necessary.

---

## References

- `scripts/setup-dev.sh`
- `scripts/init-db.sql`
- `docker-compose.yml`
