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
- Ensure default Biblioteca categories exist (idempotent seed at server startup).
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

3. Confirm default categories were seeded:

   ```bash
   docker compose -f docker-compose.prod.yml logs server | grep -i "Default categories ready"
   ```

## Default Biblioteca Categories (Production)

On a brand new install (when there are no categories yet), the server startup seeds a small default set of categories.

Default categories:

1. Osteologia y Artrologia
2. Miologia
3. Test de Elasticidad
4. Test Funcionales
5. Protocolos de Tratamiento

Implementation: the server container runs `node prisma/seed-categories.js` during startup from `docker/server/entrypoint.sh`.

## How to Add More Categories in Production

Use the category add script:

```bash
# Run from repo on the host
pnpm category:add -- --name "Masajes" --description "Masoterapia y tecnicas manuales" --icon "hand"

# Or run directly inside the container
docker exec -it -w /app/apps/server physio_server node prisma/add-category.js --name "Masajes" --description "Masoterapia y tecnicas manuales" --icon "hand"
```

Notes:

- `--name` and `--description` are required.
- `--icon` is optional (defaults to `clipboard`).
- The command is case-insensitive for duplicate name checks.
- This operation is safe to run in production and does not modify users.

If you want to (re)apply defaults on an empty database:

```bash
pnpm seed:categories
```

---

## Library Ingestion & Production Restore (Offline Workflow)

The intended operational model is:

1. Ingest/convert books on a development machine (more resources).
2. Export the library snapshot (documents + embeddings).
3. Restore that snapshot in production.

This avoids recomputing embeddings in production (cost/time).

### Mounting source markdowns in production (required for "Open Book")

Biblioteca now supports opening the full source book from search results. For this to work, production must have access to the markdown files referenced by `documents.filePath`.

Recommended approach:

- Keep markdowns on the host (for example: `/opt/mamirri/library/markdowns`).
- Mount them into the server container path expected by the app (`/app/data/library/markdowns` in production image).

Example `docker-compose.prod.yml` volume entry for `server`:

```yaml
volumes:
  - /opt/mamirri/library/markdowns:/app/data/library/markdowns:ro
```

Notes:

- You can copy/update markdown files via SSH/SCP/rsync without rebuilding images.
- Keep file names and relative paths consistent with what was ingested in the source environment.
- Use read-only mount (`:ro`) for safety.

### On the development machine

Convert source files into curated Markdown:

```bash
pnpm knowledge:convert
```

Ingest curated Markdown to generate embeddings:

```bash
pnpm knowledge:ingest
```

Export library-only snapshot (documents + embeddings):

```bash
pnpm knowledge:export
```

This produces: `backups/library/library_all_<timestamp>.sql.gz`

### On the production server

Copy the exported `.sql.gz` into the repo `backups/` directory, then restore:

```bash
pnpm knowledge:restore backups/library/library_all_<timestamp>.sql.gz
```

Or restore inside the server container:

```bash
docker exec -it -w /app physio_server pnpm knowledge:restore backups/library/library_all_<timestamp>.sql.gz
```

Notes:

- This restore overwrites only the library tables exported by the script (currently `documents` and `embeddings`).
- Protocol/category/reference data is separate (curated overlay) and is not required for the current books-only Biblioteca UI.

---

**Last Updated:** 2026-02-19
