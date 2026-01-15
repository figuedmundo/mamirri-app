# Specification: DevOps Infrastructure

## Goal

Establish automated database backups, secure environment management, CI/CD workflows, and production-ready deployment configuration for the MamirriApp home lab infrastructure.

## User Stories

- As a developer, I want automated database backups with encryption so that I can recover from data loss without manual intervention
- As a developer, I want CI/CD pipelines to run lint and tests automatically so that code quality is maintained before merges
- As a developer, I want a production-ready docker-compose configuration so that I can deploy to the Ubuntu home lab reliably

## Specific Requirements

**Database Backups**

- Create bash script `scripts/backup-postgres.sh` that performs pg_dump of PostgreSQL database
- Script should run daily via cron job at 2 AM UTC on Ubuntu server
- Store backups in `/var/backups/physio/` directory with proper permissions (700)
- Implement 7-day retention policy: automatically delete backups older than 7 days
- Encrypt backups using GPG symmetric encryption with passphrase from `BACKUP_ENCRYPTION_KEY` env var
- Include `scripts/restore-postgres.sh` script for backup restoration
- Test backup and restore procedures during implementation
- Log backup operations to `/var/log/physio-backup.log` with timestamps

**Environment Management**

- Update existing `.env.example` in repo root to include new backup-related variables
- Add documentation comments for all environment variables (purpose, format, examples)
- Include new variables: `BACKUP_ENCRYPTION_KEY`, `BACKUP_DIR`, `BACKUP_RETENTION_DAYS`
- Ensure `.env` file is gitignored and has restrictive permissions (600)
- Document three environments: development (local), staging (home lab), production (home lab)
- Add script `scripts/setup-env.sh` to copy `.env.example` to `.env` with placeholders
- Document environment variable setup in README or deployment guide

**CI/CD with GitHub Actions**

- Create `.github/workflows/lint.yml` workflow running `pnpm lint` on all PRs
- Create `.github/workflows/test.yml` workflow running `pnpm test` (unit tests) on all PRs
- Create `.github/workflows/test-e2e.yml` workflow running `pnpm run test:e2e` on all PRs
- All workflows should block merges if they fail (required checks)
- Create `.github/workflows/deploy.yml` that triggers on push to main branch
- Deploy workflow requires manual approval via GitHub environment protection
- Use Ubuntu latest runner for all workflows
- Cache node_modules and pnpm store to speed up workflows

**Production Deployment**

- Create `docker-compose.prod.yml` based on existing `docker-compose.yml`
- Production compose should use pre-built Docker images (pull from registry) not build from source
- Include health checks for all services (postgres, minio, server, redis)
- Mount backup directory volume from host: `/var/backups/physio:/backups`
- Configure Caddy integration: set `SERVER_HOST` environment variable for reverse proxy
- Remove development-specific ports in production (expose only via Caddy)
- Set `NODE_ENV=production` for all services
- Create `scripts/deploy.sh` that pulls latest images and restarts containers
- Document deployment procedure in README or deployment guide

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**docker-compose.yml**

- Existing compose file defines services: postgres (with pgvector), minio, redis, server
- Uses named volumes (postgres_data, minio_data, redis_data) for persistence
- Implements health checks for postgres and minio services
- Uses environment variables for configuration (follow this pattern for production)
- Has network isolation via `physio_network` bridge network

**.env.example**

- Well-documented template with sections for DATABASE, STORAGE, REDIS, JWT, AI SERVICES
- Uses descriptive variable names with prefixes by service (POSTGRES*, MINIO*, JWT\_)
- Includes inline comments explaining each variable's purpose
- Separates development vs production considerations (e.g., CORS_ORIGINS)

**apps/server/package.json**

- Jest is already configured with `test`, `test:watch`, `test:cov`, and `test:e2e` scripts
- Lint script exists: `eslint "{src,apps,libs,test}/**/*.ts" --fix`
- Build script: `nest build` produces production-ready dist/
- Uses pnpm as package manager (consistent with turbo setup)

**root package.json**

- Turbo manages monorepo: `turbo run lint`, `turbo run build` for all packages
- Format script uses Prettier across entire codebase
- Check-types script for TypeScript validation

## Out of Scope

- Automated rollback on deployment failure
- Monitoring and alerting (Prometheus, Grafana, Sentry)
- Log aggregation (ELK stack, Loki)
- Database migration automation in CI/CD pipelines
- SSL certificate generation (handled by existing Caddy container)
- nginx reverse proxy setup (using existing Caddy instead)
- Cloud backup storage (S3, Wasabi, Backblaze)
- Secrets manager integration (HashiCorp Vault, AWS Secrets Manager)
- Multi-region or multi-environment deployment beyond home lab
- Load balancing or horizontal scaling
- Blue-green or canary deployment strategies
