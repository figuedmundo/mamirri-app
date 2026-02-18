# Deployment Guide

This guide describes how to deploy **Mamirri App** to the production environment (Ubuntu Home Lab).

## Architecture Overview

The production environment uses **Docker Compose** with a production-ready configuration (`docker-compose.prod.yml`). Traffic is routed through a **Caddy** reverse proxy.

## Prerequisites

On the production server, ensure you have:

- Docker and Docker Compose installed.
- Git installed.
- SSH access configured for the deployment user.
- The repository cloned at `~/mamirri-app`.

## Manual Deployment

To deploy manually on the server:

1. **Pull latest changes**:

   ```bash
   git checkout main && git pull origin main
   ```

2. **Run the deployment script**:
   ```bash
   ./scripts/deploy.sh
   ```

The script will:

- Stop current production containers.
- Pull new images (if applicable) or rebuild.
- Start services in detached mode.
- Run database migrations.
- Prune old Docker resources.

## Automated Deployment (CI/CD)

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`).

- **Trigger**: Every push to the `main` branch.
- **Manual Trigger**: Can be started from the "Actions" tab in GitHub.
- **Requirements**: See the [CI/CD Documentation](../technical/ci-cd.md) for required secrets.

## Post-Deployment Checks

1. Verify containers are running:

   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Check logs for errors:
   ```bash
    docker compose -f docker-compose.prod.yml logs -f server
   ```

## Creating an Admin User in Production

Production deploys do not automatically seed users by default.

- The production server container runs `prisma migrate deploy` on startup.
- Seeding is guarded by `SEED_DATABASE=true` and also requires `ts-node`, which is typically not present in the production image.

Recommended production approach: promote an existing user to `ADMIN`.

### Option A (Recommended): Promote an existing account via Postgres

1. Create a normal account by registering in the UI.
2. On the server, update the user's role in Postgres:

```bash
# Replace email with the account you want to promote
docker exec -it physio_db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "UPDATE \"users\" SET \"role\"='ADMIN' WHERE \"email\"='you@example.com';"

# Verify
docker exec -it physio_db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
  -c "SELECT email, role FROM \"users\" WHERE email='you@example.com';"
```

3. Log out and log back in (the JWT role claim is refreshed on login).

The admin protocols UI will appear in the main navigation as `Protocolos (Admin)` and is available at `/admin/protocols`.

---

**Last Updated:** 2026-02-18
