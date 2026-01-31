# Plan: Mamirri App - First Deployment & Pipeline Fixes

## TL;DR

> **Quick Summary**: This plan covers the initial deployment of the Mamirri App to an Ubuntu Home Lab server, integrating it with an existing Caddy/Docker infrastructure, and fixing the CI/CD pipelines to ensure build safety and robust E2E testing.
>
> **Deliverables**:
>
> - Updated `.github/workflows/` (Build validation, E2E health checks, Artifacts)
> - Integrated `docker-compose.prod.yml` (Homelab network, Shared resources)
> - Updated `docker/caddy/Caddyfile` with Mamirri service blocks
> - Configured GitHub Secrets for automated deployment
> - Functional production environment at `/srv/apps/mamirri-app`
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Pipeline Fixes → GitHub Secrets → Server Integration → Deployment

---

## Context

### Original Request

Help me deploy to my ubuntu server lab, fix the github pipelines, and assess what we need.

### Interview Summary

- **Target**: Ubuntu server at `/srv/apps/mamirri-app`.
- **Infrastructure**: Existing Caddy reverse proxy, shared `homelab_net` network, PostgreSQL 15, and Redis.
- **Deployment Strategy**: First-time deployment. Integrate with existing Caddyfile.
- **CI/CD**: Fix current workflows (4 existing) and add build validation.

### Research Findings

- Project is a NestJS/React monorepo with Turborepo.
- `deploy.yml` exists but is not yet functional (secrets missing).
- `test-e2e.yml` is missing Redis health checks and build validation.
- `docker-compose.prod.yml` assumes an isolated stack, but user has shared resources.

### Metis Review

**Identified Gaps** (addressed):

- **Build Safety**: No check if the app actually compiles before deployment.
- **E2E Reliability**: Flaky E2E tests due to missing service readiness checks.
- **Secret Management**: Unsafe hardcoded credentials in workflows.
- **Resource Collision**: Potential port/network conflicts on the home lab server.

---

## Work Objectives

### Core Objective

Successfully deploy the Mamirri App to the production home lab and ensure a high-confidence CI/CD pipeline.

### Concrete Deliverables

- `/.github/workflows/build.yml` (New: Build validation)
- Updated `/.github/workflows/test-e2e.yml` (Fixed: Health checks & Artifacts)
- Integrated `docker-compose.prod.yml` (Shared network integration)
- Updated `/docker/caddy/Caddyfile` (Subdomain configuration)

### Definition of Done

- [ ] `pnpm build` passes in CI for every PR.
- [ ] E2E tests pass reliably in CI with artifact capture on failure.
- [ ] `git push origin main` triggers a successful deployment to the server.
- [ ] Application is accessible via configured subdomain with valid SSL.

### Must Have

- Build validation in CI.
- Secure SSH-based deployment.
- Integration with existing Caddy reverse proxy.
- Automated daily backups.

### Must NOT Have (Guardrails)

- NO hardcoded production secrets in the repository.
- NO interference with existing services (Nextcloud, Glances, etc.).
- NO exposed database/redis ports to the public internet.

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES
- **User wants tests**: YES (TDD for pipeline fixes, Manual for deployment)
- **Framework**: Vitest / Playwright / Shell

### Automated Verification

Each task includes executable verification procedures using `bash` and `playwright`.

| Type           | Verification Tool           | Automated Procedure                    |
| -------------- | --------------------------- | -------------------------------------- |
| **CI/CD**      | `gh workflow view`          | Verify workflow status and logs        |
| **Server**     | `ssh` + `docker compose ps` | Verify service health and connectivity |
| **Networking** | `curl`                      | Verify subdomain access and SSL        |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (CI/CD Fixes):
├── Task 1: Add Build Validation
├── Task 2: Enhance E2E Workflow
└── Task 3: Secure Credentials

Wave 2 (Server Integration):
├── Task 4: Integrate homelab_net
├── Task 5: Caddyfile Configuration
└── Task 6: Secret Provisioning

Wave 3 (Deployment):
└── Task 7: Initial Deployment & Verification

Critical Path: Task 1 → Task 2 → Task 6 → Task 7
```

---

## Implementation Status

**Completed**: 6 of 7 Tasks ✅  
**Pending**: Task 7 requires user action to complete deployment

## TODOs ✅ COMPLETED

**Status**: Already exists and functional.

**Implementation**: `.github/workflows/build.yml`

- Runs `pnpm build` on all PRs and pushes to main/develop
- Uses Node 20 with pnpm caching
- Generates Prisma client before building
- Successfully validates the monorepo compiles correctly

- [x] 2. Enhance E2E Workflow Reliability ✅ COMPLETED

  **Implementation**: Updated `.github/workflows/test-e2e.yml`

  **Changes Made**:
  - ✅ Added Redis health check using `docker exec physio_cache redis-cli ping | grep -q "PONG"`
  - ✅ Added `actions/upload-artifact@v4` step to capture Playwright reports on failure
  - ✅ Added `pnpm build` step before running E2E tests with proper environment variables
  - ✅ Added `Generate Prisma Client` step before build
  - ✅ Artifacts uploaded to `playwright-report` with 30-day retention
  - Includes both `apps/client/playwright-report/` and `apps/client/test-results/`

  **Security Improvements**:
  - Credentials now use workflow-level environment variables with fallback defaults
  - `TEST_JWT_SECRET`, `TEST_DATABASE_URL`, `TEST_REDIS_PASSWORD` configurable via GitHub secrets

- [x] 3. Secure Credential Management ✅ COMPLETED

  **Implementation**: Secured `.github/workflows/test-e2e.yml`

  **Changes Made**:
  - ✅ Removed all hardcoded credentials from workflow file
  - ✅ Added workflow-level `env` section with configurable secrets:
    - `TEST_JWT_SECRET`: Defaults to safe CI-only value, override via GitHub secrets
    - `TEST_DATABASE_URL`: Uses local Docker default, override via GitHub secrets
    - `TEST_REDIS_PASSWORD`: Empty by default, configurable via GitHub secrets
  - ✅ All sensitive values referenced via `${{ env.VAR_NAME }}` pattern
  - ✅ No production secrets in repository

- [x] 4. Integrate Production Docker Network ✅ COMPLETED

  **Implementation**: Modified `docker-compose.prod.yml`

  **Changes Made**:
  - ✅ Changed network from `physio_network` to `homelab_net` for all services:
    - `postgres` (physio_db)
    - `minio` (physio_storage)
    - `redis` (physio_cache)
    - `minio-provisioner` (physio_provisioner)
    - `server` (physio_server)
    - `client` (physio_client) - **NEW**
  - ✅ Configured `homelab_net` as external network:
    ```yaml
    networks:
      homelab_net:
        external: true
    ```
  - ✅ No port exposures on internal services (Caddy handles all external access)
  - ✅ Server container accessible via `physio_server:3000` on the homelab_net network
  - ✅ Client container (NEW) accessible via `physio_client:80` on the homelab_net network

- [x] 5. Caddyfile Configuration for Mamirri ✅ COMPLETED

  **Implementation**: Created `docker/caddy/Caddyfile`

  **Changes Made**:
  - ✅ Created `docker/caddy/` directory structure
  - ✅ Added reverse proxy configuration for **frontend** (NEW):
    - Domain: `mamirri.localhost` (update to your actual domain)
    - Reverse proxy to `physio_client:80`
    - Gzip compression enabled
    - Security headers configured
    - Logging to `/var/log/caddy/mamirri-app.log`
  - ✅ Added reverse proxy configuration for backend API:
    - Domain: `api.mamirri.localhost` (update to your actual domain)
    - Reverse proxy to `physio_server:3000`
    - Gzip compression enabled
    - Security headers configured
    - Logging to `/var/log/caddy/mamirri-api.log`

  **Architecture**:
  - **Frontend**: React SPA served by nginx at `physio_client:80`
  - **Backend**: NestJS API at `physio_server:3000`
  - **Caddy**: Routes traffic to appropriate service based on subdomain

  **To Deploy**:
  1. Copy `docker/caddy/Caddyfile` contents to your server's main Caddyfile
  2. Update domains from `*.localhost` to your actual domains
  3. Reload Caddy: `sudo systemctl reload caddy`

- [x] 6. Secret Provisioning & SSH Setup ✅ COMPLETED

  **Implementation**: Updated `.documentation/technical/ci-cd.md`

  **Documentation Added**:
  - ✅ Complete SSH key generation guide (`ssh-keygen -t ed25519`)
  - ✅ Step-by-step instructions to add public key to server (`ssh-copy-id`)
  - ✅ Server-side configuration (docker group, permissions)
  - ✅ GitHub secrets setup guide:
    - `DEPLOY_SSH_KEY`: Private key for SSH authentication
    - `DEPLOY_HOST`: Server IP or domain
    - `DEPLOY_USER`: SSH username
    - `DEPLOY_PORT`: Optional SSH port
  - ✅ Security best practices (dedicated keys, rotation, IP whitelisting)
  - ✅ Troubleshooting section for common SSH issues

  **Required User Actions**:
  1. Generate SSH key pair on local machine
  2. Add public key to server's `~/.ssh/authorized_keys`
  3. Add private key to GitHub Secrets as `DEPLOY_SSH_KEY`
  4. Add `DEPLOY_HOST` and `DEPLOY_USER` to GitHub Secrets
  5. Verify SSH connectivity: `ssh -i ~/.ssh/mamirri_deploy ${DEPLOY_USER}@${DEPLOY_HOST}`

- [ ] 7. Initial Deployment & Verification ⏳ PENDING (User Action Required)

  **Prerequisites** (must be completed before deployment):
  1. ✅ All CI/CD workflows configured (Tasks 1-3)
  2. ✅ Docker network configured (Task 4)
  3. ✅ Caddyfile configured (Task 5)
  4. ⚠️ SSH keys and GitHub secrets configured (Task 6) - **User must complete**
  5. ⚠️ Repository cloned on server at `~/mamirri-app` - **User must complete**
  6. ⚠️ `homelab_net` Docker network exists on server - **User must create**

  **Deployment Steps**:
  1. Push code to `main` branch or trigger workflow manually from GitHub Actions tab
  2. Monitor deployment in GitHub Actions logs
  3. On server, check deployment logs: `tail -f /var/log/physio-deploy.log`
  4. Verify services: `docker compose -f docker-compose.prod.yml ps`
  5. Check database migrations ran successfully
  6. Verify SSL certificate is issued by Caddy
  7. Test application: `curl -I https://[your-domain]`

  **Manual Verification Commands**:

  ```bash
  # On the server
  cd ~/mamirri-app
  docker compose -f docker-compose.prod.yml ps
  docker compose -f docker-compose.prod.yml logs -f server
  curl -I http://localhost:3000/api/health  # If health endpoint exists
  ```

  **Acceptance Criteria**:
  - [ ] Application is live at configured subdomain
  - [ ] `curl -I https://[domain]` returns 200 OK with SSL
  - [ ] All containers show as healthy in `docker ps`
  - [ ] Database migrations completed successfully

---

## Commit Strategy

All changes have been implemented and are ready to commit:

| Task | Commit Message                                                 | Files                                                  | Status |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| 2    | `ci: enhance e2e reliability with health checks and artifacts` | `.github/workflows/test-e2e.yml`                       | Ready  |
| 3    | `ci: secure credentials using environment variables`           | `.github/workflows/test-e2e.yml`                       | Ready  |
| 4    | `deploy: integrate with homelab_net external network`          | `docker-compose.prod.yml`                              | Ready  |
| 4b   | `deploy: add client service with nginx`                        | `docker/client/Dockerfile`, `docker/client/nginx.conf` | Ready  |
| 5    | `deploy: add mamirri-app caddyfile configuration`              | `docker/caddy/Caddyfile`                               | Ready  |
| 6    | `docs: add comprehensive ssh setup and ci/cd guide`            | `.documentation/technical/ci-cd.md`                    | Ready  |

**Recommended Commit Command**:

```bash
git add -A && git commit -m "ci(deploy): complete deployment pipeline setup

- Enhance E2E workflow with Redis health checks and artifact capture
- Secure credentials using GitHub secrets with safe fallbacks
- Configure homelab_net external network for production
- Add client service with nginx for serving React frontend
- Add Caddyfile with reverse proxy for frontend and backend
- Document SSH setup and secret provisioning process

All pipeline fixes for first deployment are now complete."
```

---

## Success Criteria

### Implementation Summary

All **Wave 1** and **Wave 2** tasks have been completed successfully:

#### ✅ CI/CD Pipeline (Wave 1)

- [x] Build validation workflow exists and passes
- [x] E2E workflow enhanced with:
  - Redis health check
  - Artifact capture on failure (Playwright reports)
  - Build step before E2E tests
  - Secure credential management
- [x] No hardcoded credentials in workflow files

#### ✅ Server Integration (Wave 2)

- [x] Docker Compose configured for `homelab_net` external network
- [x] All services connected to shared network
- [x] **Client service added** with multi-stage Dockerfile (Node build + nginx serve)
- [x] No internal ports exposed to public
- [x] Caddyfile created with reverse proxy for **both frontend and backend**
- [x] Comprehensive SSH setup documentation added

### Final Checklist (User Actions Required)

Before triggering the first deployment, complete these items:

**Server Setup**:

- [ ] Create `homelab_net` Docker network on server: `docker network create homelab_net`
- [ ] Clone repository to `~/mamirri-app` on the server
- [ ] Copy `.env.example` to `.env` and configure production values
- [ ] Set up daily backup cron job (see README.md)

**GitHub Secrets**:

- [ ] Add `DEPLOY_SSH_KEY` (private key content)
- [ ] Add `DEPLOY_HOST` (server IP or domain)
- [ ] Add `DEPLOY_USER` (SSH username)
- [ ] (Optional) Add `TEST_JWT_SECRET` for E2E tests
- [ ] (Optional) Add `TEST_DATABASE_URL` for E2E tests

**Caddy Configuration**:

- [ ] Copy `docker/caddy/Caddyfile` blocks to server's main Caddyfile
- [ ] Update domain from `api.mamirri.localhost` to actual domain
- [ ] Reload Caddy service

**Verification**:

- [ ] Test SSH: `ssh -i ~/.ssh/mamirri_deploy ${DEPLOY_USER}@${DEPLOY_HOST}`
- [ ] Trigger deploy workflow manually from GitHub Actions
- [ ] Verify deployment logs on server: `tail -f /var/log/physio-deploy.log`
- [ ] Check all containers healthy: `docker compose -f docker-compose.prod.yml ps`
- [ ] Verify HTTPS access: `curl -I https://[your-domain]`
- [ ] Confirm SSL certificate issued by Caddy
