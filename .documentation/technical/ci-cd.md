# CI/CD Pipeline Configuration 🚀

This document explains how the automated workflows for **Mamirri App** are configured using GitHub Actions.

## Workflows Overview

| Workflow                       | Trigger                   | Description                                                                         |
| :----------------------------- | :------------------------ | :---------------------------------------------------------------------------------- |
| **Lint** (`lint.yml`)          | PR & Push (main, develop) | Checks code style with ESLint and TypeScript types with `pnpm check-types`.         |
| **Unit Tests** (`test.yml`)    | PR & Push (main, develop) | Runs Vitest (client) and Jest (server) unit tests.                                  |
| **E2E Tests** (`test-e2e.yml`) | PR & Push (main, develop) | Spins up Docker infrastructure (Postgres, MinIO, Redis) and runs integration tests. |
| **Deploy** (`deploy.yml`)      | Push (main), Manual       | Deploys the application to the production Ubuntu server via SSH.                    |

## Required GitHub Secrets

To make these workflows function correctly, you must configure the following secrets in your GitHub Repository settings (**Settings > Secrets and variables > Actions**):

### Infrastructure & Deployment

- `DEPLOY_HOST`: The IP address or domain of your Ubuntu production server.
- `DEPLOY_USER`: The SSH username used for deployment (e.g., `edmundo`).
- `DEPLOY_SSH_KEY`: A private SSH key that has access to the `DEPLOY_USER` on `DEPLOY_HOST`.
- `DEPLOY_PORT`: (Optional) SSH port if different from 22.

### Application Secrets (for CI/E2E)

Most CI environment variables are handled automatically via `.env.example`, but if you add external services, you might need:

- `JWT_SECRET`: Used during E2E tests to generate valid tokens.

## Deployment Process

The `deploy.yml` workflow performs the following steps:

1. **Checkout**: Pulls the latest code from the `main` branch.
2. **SSH Setup**: Configures the SSH agent with `DEPLOY_SSH_KEY`.
3. **Remote Commands**: Connects to `DEPLOY_HOST` and executes:
   ```bash
   cd ~/mamirri-app && git pull origin main && ./scripts/deploy.sh
   ```

## Local Verification

Before pushing, it is highly recommended to run the checks locally:

```bash
# Lint and Type Check
pnpm lint && pnpm check-types

# Unit Tests
pnpm test

# E2E Tests (requires Docker running)
pnpm run test:e2e
```

## Troubleshooting CI

### E2E Failures

If E2E tests fail in CI, check the **Wait for Services Health** step logs. It indicates if Postgres or MinIO failed to start within the 60-second timeout.

### Deployment Failures

Ensure the `DEPLOY_USER` has permissions to run Docker commands without `sudo` (added to the `docker` group) and that the deployment directory exists on the server.

---

**Last Updated:** 2026-01-15
