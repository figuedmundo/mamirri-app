# Task Breakdown: DevOps Infrastructure

## Overview

Total Tasks: 23

## Task List

### Database Backup Infrastructure

#### Task Group 1: Backup Scripts & Automation

**Dependencies:** None

- [x] 1.0 Complete database backup infrastructure
  - [x] 1.1 Write 2-8 focused tests for backup/restore scripts
    - Test backup script creates encrypted .gpg file
    - Test restore script successfully decrypts and restores database
    - Test retention policy deletes old backups
    - Test backup script logs operations correctly
    - Test error handling when database is unreachable
  - [x] 1.2 Create `scripts/backup-postgres.sh`
    - Perform pg_dump of PostgreSQL database
    - Use environment variables for configuration: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`
    - Encrypt backup using GPG symmetric encryption with `BACKUP_ENCRYPTION_KEY`
    - Create timestamped backup filename: `physio-backup-YYYY-MM-DD-HH-MM-SS.sql.gpg`
    - Store in directory from `BACKUP_DIR` env var (default: `/var/backups/physio/`)
    - Implement 7-day retention: delete files older than `BACKUP_RETENTION_DAYS` env var (default: 7)
    - Set directory permissions to 700 (owner read/write/execute only)
    - Log all operations with timestamps to `/var/log/physio-backup.log`
    - Exit with error code 1 on failure, 0 on success
  - [x] 1.3 Create `scripts/restore-postgres.sh`
    - Accept backup filename as command-line argument
    - Decrypt GPG file using `BACKUP_ENCRYPTION_KEY`
    - Pipe decrypted SQL to psql for restoration
    - Validate backup file exists and is readable before attempting restore
    - Log restore operations with timestamps
    - Exit with error code 1 on failure, 0 on success
  - [x] 1.4 Set up cron job for daily backups
    - Schedule backup script to run at 2 AM UTC daily: `0 2 * * * /path/to/scripts/backup-postgres.sh >> /var/log/physio-backup.log 2>&1`
    - Add to project documentation in README or DEPLOYMENT.md
    - Ensure script has execute permissions: `chmod +x scripts/backup-postgres.sh`
  - [x] 1.5 Test backup and restore procedures
    - Run backup script and verify encrypted .gpg file is created
    - Run restore script with generated backup and verify database restoration succeeds
    - Verify retention policy: create backup older than 7 days, run backup script, confirm old file is deleted
    - Check log file contains proper timestamps and operation details
    - Run ONLY tests from 1.1 and verify all pass

**Acceptance Criteria:**

- All 2-8 tests from 1.1 pass
- Backup script creates encrypted backups in specified directory
- Retention policy deletes backups older than 7 days
- Restore script successfully decrypts and restores database
- Cron job runs daily at 2 AM UTC
- Log file contains timestamped entries for all operations

### Environment Management Setup

#### Task Group 2: Environment Configuration

**Dependencies:** None (can run parallel with Task Group 1)

- [x] 2.0 Complete environment management setup
  - [x] 2.1 Write 2-4 focused tests for environment scripts
    - Test setup-env.sh creates .env file from .env.example if it doesn't exist
    - Test .env file has correct permissions (600) after setup
    - Test script fails gracefully if .env.example doesn't exist
  - [x] 2.2 Update `.env.example`
    - Add new section: `############################################# # BACKUP CONFIGURATION #############################################`
    - Add variable: `BACKUP_ENCRYPTION_KEY` with comment explaining GPG encryption purpose
    - Add variable: `BACKUP_DIR=/var/backups/physio` with comment about backup storage location
    - Add variable: `BACKUP_RETENTION_DAYS=7` with comment about retention policy
    - Document that `BACKUP_ENCRYPTION_KEY` should be generated randomly: `openssl rand -base64 32`
    - Add inline comments for each variable explaining format, purpose, and security considerations
  - [x] 2.3 Create `scripts/setup-env.sh`
    - Check if `.env` exists in root directory
    - If not exists, copy `.env.example` to `.env`
    - Set permissions on `.env` to 600 (owner read/write only)
    - Print warning to console about setting strong values for secrets
    - Exit with error code 1 if .env.example doesn't exist, 0 on success
  - [x] 2.4 Update `.gitignore`
    - Ensure `.env` is in .gitignore (already should be there, verify)
    - Add `.env.local` and `.env.*.local` patterns for environment-specific overrides
  - [x] 2.5 Document environment setup
    - Add section to README or create DEPLOYMENT.md
    - Document three environments: development (local), staging (home lab), production (home lab)
    - Explain how to use `scripts/setup-env.sh`
    - Document required environment variables and their purposes
  - [x] 2.6 Ensure environment tests pass
    - Run ONLY tests from 2.1 and verify all pass

**Acceptance Criteria:**

- All 2-4 tests from 2.1 pass
- `.env.example` contains all new backup variables with documentation
- `scripts/setup-env.sh` creates `.env` with correct permissions
- `.env` is gitignored
- Documentation explains environment setup clearly

### CI/CD Pipeline Configuration

#### Task Group 3: GitHub Actions Workflows

**Dependencies:** None (can run parallel with Task Groups 1-2)

- [x] 3.0 Complete CI/CD pipeline configuration
  - [x] 3.1 Write 2-8 focused tests for CI/CD workflows
    - Test lint workflow runs on pull requests
    - Test unit test workflow runs on pull requests
    - Test E2E test workflow runs on pull requests
    - Test workflows block merges when they fail (required checks)
    - Test deploy workflow triggers on push to main only
    - Test deploy workflow requires manual approval
  - [x] 3.2 Create `.github/workflows/lint.yml`
    - Trigger on: pull_request to main or develop branches
    - Use ubuntu-latest runner
    - Checkout code with actions/checkout@v4
    - Setup pnpm with pnpm/action-setup@v4
    - Install dependencies: `pnpm install`
    - Run lint: `pnpm lint`
    - Set workflow as required check in branch protection settings
  - [x] 3.3 Create `.github/workflows/test.yml`
    - Trigger on: pull_request to main or develop branches
    - Use ubuntu-latest runner
    - Checkout code with actions/checkout@v4
    - Setup pnpm with pnpm/action-setup@v4
    - Cache node_modules: actions/cache@v4 with key `${{ runner.os }}-node-${{ hashFiles('**/pnpm-lock.yaml') }}`
    - Install dependencies: `pnpm install`
    - Run unit tests: `pnpm test` (from apps/server)
    - Set workflow as required check in branch protection settings
  - [x] 3.4 Create `.github/workflows/test-e2e.yml`
    - Trigger on: pull_request to main or develop branches
    - Use ubuntu-latest runner
    - Checkout code with actions/checkout@v4
    - Setup pnpm with pnpm/action-setup@v4
    - Cache node_modules: actions/cache@v4
    - Install dependencies: `pnpm install`
    - Start services: `docker compose up -d` (postgres, minio, redis)
    - Run E2E tests: `pnpm run test:e2e` (from apps/server)
    - Stop services after tests
    - Set workflow as required check in branch protection settings
  - [x] 3.5 Create `.github/workflows/deploy.yml`
    - Trigger on: push to main branch only
    - Use ubuntu-latest runner
    - Environment: production (with manual approval enabled in GitHub settings)
    - Checkout code with actions/checkout@v4
    - Setup pnpm with pnpm/action-setup@v4
    - Cache node_modules: actions/cache@v4
    - Add SSH key for server access (or use GitHub secrets with deploy key)
    - SSH into Ubuntu home lab server
    - Pull latest code: `git pull origin main`
    - Run deployment script: `./scripts/deploy.sh`
    - Log deployment output
  - [x] 3.6 Configure GitHub environment protection
    - Create GitHub environment named "production"
    - Enable "Required reviewers" for deployment approval
    - Add deploy.yml workflow as environment protection rule
    - Document approval process in README
  - [x] 3.7 Ensure CI/CD tests pass
    - Run ONLY tests from 3.1 and verify all pass

**Acceptance Criteria:**

- All 2-8 tests from 3.1 pass
- Lint workflow runs on all PRs and blocks failed merges
- Unit test workflow runs on all PRs and blocks failed merges
- E2E test workflow runs on all PRs and blocks failed merges
- Deploy workflow triggers on main push and requires manual approval
- GitHub environment protection is configured

### Production Deployment Configuration

#### Task Group 4: Docker Compose & Deployment Scripts

**Dependencies:** Task Groups 1-3 (backup scripts need to exist, env vars need to be documented)

- [x] 4.0 Complete production deployment configuration
  - [x] 4.1 Write 2-8 focused tests for deployment
    - Test docker-compose.prod.yml starts all services successfully
    - Test backup volume is mounted correctly
    - Test health checks pass for all services
    - Test production images are pulled (not built from source)
    - Test deployment script pulls images and restarts containers
    - Test Caddy integration works with SERVER_HOST environment variable
  - [x] 4.2 Create `docker-compose.prod.yml`
    - Base on existing `docker-compose.yml` structure
    - Change postgres service: remove build context, use image `ankane/pgvector:latest`
    - Change minio service: remove build context, use image `minio/minio:latest`
    - Change redis service: remove build context, use image `redis:7-alpine`
    - Change server service: remove build context, use image from Docker registry or build from Dockerfile with production flag
    - Add backup volume mount to postgres service: `/var/backups/physio:/backups:ro`
    - Add backup volume mount to server service: `/var/backups/physio:/backups:ro` (for restore script access)
    - Add environment variable `SERVER_HOST` to server service (for Caddy integration)
    - Remove all port mappings except internal container-to-container communication
    - Set `NODE_ENV=production` for server service
    - Ensure all services have health checks
    - Add network: `physio_network` (same as dev compose)
  - [x] 4.3 Update backup scripts for production environment
    - Modify `scripts/backup-postgres.sh` to read from production .env
    - Modify `scripts/restore-postgres.sh` to read from production .env
    - Ensure scripts work when run inside container vs on host (test both)
    - Add logic to detect running environment (container vs host)
  - [x] 4.4 Create `scripts/deploy.sh`
    - Stop running containers: `docker compose -f docker-compose.prod.yml down`
    - Pull latest images: `docker compose -f docker-compose.prod.yml pull`
    - Start containers: `docker compose -f docker-compose.prod.yml up -d`
    - Wait for health checks to pass
    - Log deployment output with timestamps
    - Exit with error code 1 on failure, 0 on success
    - Add dry-run mode option for testing
  - [x] 4.5 Update Caddy configuration (if needed)
    - Document Caddy Caddyfile entry for backend proxying
    - Ensure `SERVER_HOST` env var is set correctly in production
    - Document reverse proxy setup in README or DEPLOYMENT.md
  - [x] 4.6 Document deployment procedure
    - Add comprehensive deployment guide to DEPLOYMENT.md
    - Document prerequisites: Docker, Docker Compose, Caddy
    - Document steps: clone repo, setup .env, run setup-env.sh, run deploy.sh
    - Document backup directory creation: `sudo mkdir -p /var/backups/physio`
    - Document cron job setup for backups
    - Document troubleshooting common issues
  - [x] 4.7 Ensure deployment tests pass
    - Run ONLY tests from 4.1 and verify all pass

### Testing & Verification

#### Task Group 5: End-to-End Verification

**Dependencies:** Task Groups 1-4 (all infrastructure must be in place)

- [x] 5.0 Complete end-to-end verification
  - [x] 5.1 Verify backup system end-to-end
    - Trigger manual backup: run `scripts/backup-postgres.sh`
    - Verify encrypted backup file is created in `/var/backups/physio/`
    - Verify backup file is encrypted (check file format)
    - Trigger restore with generated backup: run `scripts/restore-postgres.sh <backup-file>`
    - Verify database is restored correctly
    - Verify log file contains all operations with timestamps
  - [x] 5.2 Verify CI/CD end-to-end
    - Create test pull request with intentional lint error, verify workflow fails
    - Fix lint error, verify workflow passes
    - Create test pull request with intentional test failure, verify workflow fails
    - Fix test, verify workflow passes
    - Merge PR to main, verify deploy workflow triggers
    - Verify manual approval is required for deployment
    - Approve deployment, verify deploy workflow completes
    - Verify deployment runs `scripts/deploy.sh` on Ubuntu server
  - [x] 5.3 Verify deployment end-to-end
    - On Ubuntu server, clone fresh copy of repository
    - Run `scripts/setup-env.sh` to create .env
    - Set production environment variables in .env
    - Run `scripts/deploy.sh`
    - Verify all containers start: `docker compose -f docker-compose.prod.yml ps`
    - Verify health checks pass: `docker compose -f docker-compose.prod.yml ps` (check STATUS)
    - Verify backup volume is mounted: `docker inspect <postgres-container>` check Mounts
    - Test application accessibility via Caddy reverse proxy
  - [x] 5.4 Verify cron job execution
    - Wait for scheduled backup time (2 AM UTC) or manually trigger cron job
    - Verify backup is created
    - Verify log file shows cron job execution
    - Verify retention policy works after 8 days (manual test: create old backup, run script, confirm deletion)

**Acceptance Criteria:**

- Backup system creates encrypted backups successfully
- Restore system decrypts and restores database correctly
- CI/CD workflows run on PRs and block failed merges
- Deployment workflow triggers on main push and requires approval
- Production deployment starts all services with health checks
- Caddy reverse proxy routes traffic correctly to backend
- Cron job runs scheduled backups and applies retention policy

## Execution Order

Recommended implementation sequence:

1. Database Backup Infrastructure (Task Group 1)
2. Environment Management Setup (Task Group 2) - can run parallel with Group 1
3. CI/CD Pipeline Configuration (Task Group 3) - can run parallel with Groups 1-2
4. Production Deployment Configuration (Task Group 4)
5. End-to-End Verification (Task Group 5)

**Note:** Task Groups 1-3 can be developed in parallel by different team members since they have no dependencies. Task Group 4 depends on Groups 1-3 being complete. Task Group 5 is the final verification phase.
