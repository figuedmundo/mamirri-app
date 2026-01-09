# Database Schema and Configuration Fix (Jan 9, 2026)

## Issue

The application failed to start/seed with the error:
`ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification`

This occurred because the initial database migration (`20260107_init_infrastructure`) was malformed and did not create the necessary Primary Keys and Unique Indexes defined in `schema.prisma`. Specifically, the `User` table lacked a unique index on `email`, causing the seed script's `upsert` operation to fail.

Additionally, `prisma migrate` commands failed because the environment variables in `.env` used nested variables (e.g., `${POSTGRES_USER}`) which are not automatically expanded by `dotenv` in Node.js (unlike Docker Compose).

## Fixes Applied

### 1. Corrected Migration File

We manually updated `apps/server/prisma/migrations/20260107_init_infrastructure/migration.sql` to align with `schema.prisma`.

- Added `PRIMARY KEY` constraints to `users`, `patients`, and `sessions`.
- Added `UNIQUE INDEX` on `users.email`.
- Added Foreign Key constraints.

### 2. Updated Prisma Configuration

We updated `apps/server/prisma.config.ts` to manually expand environment variables from `.env` before passing the connection URL to Prisma. This ensures that variables like `${POSTGRES_PORT}` are correctly resolved to their values (e.g., `5432`).

### 3. Updated Seed Script

We updated `apps/server/prisma/seed.ts` with the same manual environment variable expansion logic to ensuring the `pg` connection pool can connect to the database during seeding.

### 4. Database Reset

We ran `prisma migrate reset --force` to:

- Drop the inconsistent database.
- Apply the corrected migration.
- Run the seed script successfully.

## Verification

- `prisma db seed` runs successfully.
- `users` table now has the correct constraints.
