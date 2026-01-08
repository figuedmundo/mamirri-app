# Developer Setup Guide

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose
- Git

## Docker-Native Workflow

This project supports a fully automated initialization. If you have Docker installed, you can start the entire infrastructure (including migrations and seeding) with:

```bash
docker compose up -d server
```

The `server` container will automatically:

1. Wait for Postgres to be healthy.
2. Run Prisma migrations.
3. Seed the default user.
4. Provision MinIO buckets.

## Environment Reset

If you need to wipe the database and start completely fresh:

```bash
docker compose down -v
docker compose up -d server
```

The setup script will automatically:

- Create `.env` from the example.
- Generate secure random secrets for `JWT_SECRET`.
- Start Docker containers.
- Install dependencies via `pnpm`.
- Run database migrations and seeding.
- Provision MinIO buckets.

## Environment Reset

If you need to wipe the database and all volumes to start completely fresh:

```bash
docker compose down -v
./scripts/setup-dev.sh
```

2. **Initialize Infrastructure**

```bash
# Start Postgres, MinIO, and Redis
docker compose up -d

# Generate secure secrets for .env
./scripts/generate-password.sh 32 hex # Use for JWT_SECRET
./scripts/generate-password.sh 16 human # Use for DB/Storage passwords
```

3. **Configure Environment**
   Copy `.env.example` to `.env` and fill in the secrets generated in step 2.
   Make sure `DATABASE_URL` is updated with your `POSTGRES_PASSWORD`.

4. **Initialize Database**

```bash
# Run migrations
pnpm --filter server exec prisma migrate deploy

# Seed default user (physio@mamirri.com)
pnpm --filter server exec prisma db seed
```

5. **Start Development**

```bash
pnpm dev
```

## Useful Tools

### Password Generation

Use `./scripts/generate-password.sh` to create URL-safe alphanumeric strings for any internal config.

### Database Management

- `pnpm seed`: Re-runs the idempotent seed script.
- `pnpm prisma studio`: Opens a GUI to view your data.

---

**Last Updated:** 2026-01-08
