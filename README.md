# Mamirri App 🏥

A digital assistant for physiotherapists, designed to simplify patient management and clinical documentation.

## 📖 Documentation

Comprehensive documentation is available in the [`.documentation/`](.documentation/README.md) directory:

- **[Product Vision](.documentation/product/product-vision.md)**: The "why" behind the project.
- **[Architecture](.documentation/technical/architecture.md)**: Technical overview and system design.
- **[Database Schema](.documentation/technical/database-schema.md)**: Data models and relationships.
- **[API Reference](.documentation/technical/api-reference.md)**: Backend endpoint documentation.
- **[Developer Setup](.documentation/onboarding/developer-setup.md)**: Getting started guide for contributors.
- **[Deployment Guide](.documentation/onboarding/deployment-guide.md)**: How to deploy to production.

---

## Table of Contents

| Section                                    | Description                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| [Documentation](#-documentation)           | Product vision, architecture, and guides                 |
| [Project Structure](#project-structure)    | Applications, packages, and infrastructure setup         |
| [Getting Started](#getting-started)        | Prerequisites, installation, and database initialization |
| [Development](#development)                | Local development commands and server details            |
| [Commands](#commands)                      | Build, lint, format, and test commands                   |
| [DevOps & Deployment](#devops--deployment) | Environment setup, backups, CI/CD, and deployment        |
| [Roadmap](#roadmap)                        | Detailed development plan                                |

---

## Project Structure

This project is a **Monorepo** managed with [Turborepo](https://turbo.build/repo), consisting of:

### 📱 Applications

- **`apps/client`**: Frontend application.
  - **Tech Stack**: React 19, TypeScript, Vite, TailwindCSS, Shadcn/UI.
  - **Port**: `http://localhost:5173`

- **`apps/server`**: Backend API.
  - **Tech Stack**: NestJS, TypeScript, Prisma ORM, Swagger.
  - **Port**: `http://localhost:3000` (API: `http://localhost:3000/api/v1`)
  - **Docs**: `http://localhost:3000/api/docs`

### 📦 Packages

- **`packages/ui`**: Shared React component library (stub).
- **`packages/eslint-config`**: Shared ESLint configurations.
- **`packages/typescript-config`**: Shared `tsconfig` bases.

### 🛠 Infrastructure

- **Docker**: Runs the database infrastructure.
- **PostgreSQL**: Primary database (v16).
- **Prisma**: ORM for database schema management and migrations.

## Getting Started

### Prerequisites

- Node.js (>= 18)
- pnpm (managed via Corepack or installed globally)
- Docker & Docker Compose

### Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start Infrastructure (Database):**

   ```bash
   docker compose up -d
   ```

3. **Initialize Database:**
   ```bash
   # Run migrations to create tables
   pnpm --filter server exec npx prisma migrate dev
   ```

### Development

To start both the client and server in development mode:

```bash
pnpm dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Commands

- `pnpm build`: Build all applications.
- `pnpm dev`: Start all applications in watch mode.
- `pnpm lint`: Lint all packages.
- `pnpm format`: Format code with Prettier.
- `pnpm test`: Run unit tests for all packages.
- `pnpm test:e2e`: Run Playwright E2E tests (critical user flows).
- `pnpm test:e2e:ui`: Run E2E tests in interactive UI mode (for debugging).

## DevOps & Deployment

The project includes automated infrastructure for backups, CI/CD, and production deployment.

### Environment Setup

Configure your environment using the `.env.example` template:

```bash
# Copy the template and set up environment
./scripts/setup-env.sh
```

This creates `.env` file with proper permissions (600) and prompts you to set sensitive values like:

- `POSTGRES_PASSWORD`
- `MINIO_ROOT_PASSWORD`
- `JWT_SECRET`
- `BACKUP_ENCRYPTION_KEY`

**Important:** Never commit `.env` to version control!

### Database Backups

Automated daily backups are configured using cron jobs.

**Backup Script:** `scripts/backup-postgres.sh`

- Performs `pg_dump` of PostgreSQL database
- Encrypts backups using GPG symmetric encryption
- Stores in `/var/backups/physio/` (configurable via `BACKUP_DIR`)
- Implements 7-day retention policy (configurable via `BACKUP_RETENTION_DAYS`)
- Logs operations to `/var/log/physio-backup.log`

**Restore Script:** `scripts/restore-postgres.sh`

- Decrypts and restores from encrypted backup files
- Validates backup file existence before attempting restore

**Manual Backup:**

```bash
./scripts/backup-postgres.sh
```

**Manual Restore:**

```bash
./scripts/restore-postgres.sh <backup-file.gpg>
```

### CI/CD Pipelines

GitHub Actions workflows are configured for automated testing and deployment:

- **`.github/workflows/lint.yml`**: Runs linter on all pull requests
- **`.github/workflows/test.yml`**: Runs unit tests on all pull requests
- **`.github/workflows/test-e2e.yml`**: Runs E2E tests on all pull requests
- **`.github/workflows/deploy.yml`**: Deploys to production on push to `main` (requires manual approval)

All workflows require the following GitHub secrets to be configured:

- `DEPLOY_SSH_KEY`: SSH private key for server access
- `DEPLOY_USER`: SSH username
- `DEPLOY_HOST`: Ubuntu home lab server address

### Production Deployment

Deployment to the Ubuntu home lab server uses Docker Compose.

**Configuration:** `docker-compose.prod.yml`

- Uses production Docker images instead of building from source
- Mounts backup volume `/var/backups/physio` to PostgreSQL and server
- Configures `SERVER_HOST` for Caddy reverse proxy integration
- Sets `NODE_ENV=production` for all services
- Exposes no external ports (Caddy handles proxying)

**Deploy Command:**

```bash
# On production server
./scripts/deploy.sh
```

The deployment script:

- Stops existing containers
- Pulls latest images
- Starts containers with health checks
- Logs deployment status to `/var/log/physio-deploy.log`

**Dry Run Mode:**

```bash
./scripts/deploy.sh --dry-run
```

### Cron Job Setup

To enable automated daily backups (2 AM UTC), add to crontab on the Ubuntu server:

```bash
# Open crontab for editing
crontab -e

# Add this line (update path as needed):
0 2 * * * /path/to/mamirri-app/scripts/backup-postgres.sh >> /var/log/physio-backup.log 2>&1
```

## Roadmap

See [agent-os/product/roadmap.md](agent-os/product/roadmap.md) for the detailed development plan.
