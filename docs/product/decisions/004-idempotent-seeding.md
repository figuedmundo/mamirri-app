# ADR-004: Idempotent Database Seeding Strategy

**Status:** ✅ Accepted  
**Date:** 2026-01-08  
**Deciders:** Sisyphus (AI), User

---

## Context

The application requires a reliable way to initialize a fresh database with a default administrative user (Physiotherapist). Previous attempts using manual SQL were brittle, and simple `INSERT` statements failed on re-runs.

---

## Decision

We implemented an **idempotent seeding strategy** using Prisma's `upsert` functionality.

Key Implementation Details:

1.  **Tooling**: Integrated `ts-node` to run the seed script directly from the Prisma CLI.
2.  **Logic**: The script uses the user's `email` as the unique identifier to check for existence.
    - If the user exists: Do nothing (or update the password if necessary).
    - If the user doesn't exist: Create the default user with the `THERAPIST` role.
3.  **Environment Handling**: The script explicitly loads environment variables from the root `.env` file using `dotenv`, ensuring variable interpolation (e.g., `${POSTGRES_USER}`) is handled correctly by the Prisma Client.

---

## Consequences

### Positive

- ✅ One-command setup: `pnpm seed` or `prisma db seed` handles everything.
- ✅ Safety: Running the script multiple times never creates duplicate users or crashes.
- ✅ Automation: Can be integrated into CI/CD pipelines or Docker entrypoints.

### Negative

- ⚠️ Dependency on `ts-node` in the server package.
- ⚠️ Requires manual synchronization if the `.env` variable structure changes significantly.

---

## Alternatives Considered

### Option A: Manual SQL Scripts (Rejected)

Rejected because it doesn't scale well with schema changes and lacks the type safety of the Prisma model.

### Option B: NestJS Application Boot Seed (Rejected)

Rejected to keep the application logic separate from database maintenance tasks. Seeding should be a deliberate developer/ops action.

---

## References

- `apps/server/prisma/seed.ts`
- `apps/server/package.json`
- `apps/server/prisma.config.ts`
