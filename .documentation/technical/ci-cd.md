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

Optional test credentials that override defaults:

- `TEST_JWT_SECRET`: JWT secret for E2E tests (uses safe default if not set).
- `TEST_DATABASE_URL`: Database URL for E2E tests (uses local Docker default if not set).
- `TEST_REDIS_PASSWORD`: Redis password for E2E tests (empty by default).

## SSH Setup Guide

> **Conceptual Note**: In this flow, **GitHub Actions is the "Client"** (the one initiating the connection) and your **Ubuntu Server is the "Host"**. Therefore, GitHub needs the **Private Key** to identify itself, and your Server needs the **Public Key** to verify that identity.

### Step 1: Generate a Dedicated Deploy Key

You can generate this on your local machine OR the server. It doesn't matter where it's created, only where the parts are stored.

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/mamirri_deploy
```

This creates:

- `~/.ssh/mamirri_deploy` (**Private Key** -> Goes to **GitHub Secrets**)
- `~/.ssh/mamirri_deploy.pub` (**Public Key** -> Goes to **Server `authorized_keys`**)

### Step 2: Configure the Server (Receiver)

Your server needs to know that anyone carrying the `mamirri_deploy` private key is allowed to enter.

```bash
# 1. Ensure the .ssh directory exists
mkdir -p ~/.ssh && chmod 700 ~/.ssh

# 2. Add the PUBLIC key content to authorized_keys
# (If you generated the key on the server, just run this:)
cat ~/.ssh/mamirri_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Configure GitHub (Client)

GitHub needs the private key to "act" as the client.

1. Go to your GitHub repository: **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `DEPLOY_SSH_KEY`
4. Value: Copy the **entire contents** of the **Private Key** (`~/.ssh/mamirri_deploy`)
   - Includes the `-----BEGIN ...-----` and `-----END ...-----` lines.
5. Click **Add secret**

### Step 5: Add Additional Required Secrets

Add the following secrets:

| Secret Name   | Value Example                            | Description                        |
| ------------- | ---------------------------------------- | ---------------------------------- |
| `DEPLOY_HOST` | `192.168.1.100` or `homelab.example.com` | Your server's IP or domain         |
| `DEPLOY_USER` | `edmundo`                                | SSH username on the server         |
| `DEPLOY_PORT` | `22`                                     | (Optional) SSH port if not default |

### Step 6: Verify SSH Connectivity

Test the complete deployment flow:

```bash
# Test SSH with the private key
ssh -i ~/.ssh/mamirri_deploy ${DEPLOY_USER}@${DEPLOY_HOST}

# Verify repository exists and deployment script is present
ls -la ~/mamirri-app/scripts/deploy.sh

# Check Docker access (should work without sudo)
docker ps
```

### Security Best Practices

1. **Dedicated Key**: Use a separate SSH key only for GitHub Actions deployment
2. **Restrict Access**: Limit the deploy user's permissions on the server
3. **No Passphrase**: The deploy key should not have a passphrase (GitHub Actions cannot enter one)
4. **Rotate Regularly**: Rotate the deploy key every 90 days
5. **IP Whitelist**: If possible, restrict SSH access to GitHub Actions IP ranges
6. **Audit Access**: Monitor `/var/log/auth.log` for SSH login attempts

### Troubleshooting SSH Issues

**Problem**: "Permission denied (publickey)"

- Verify the public key is in `~/.ssh/authorized_keys` on the server
- Check file permissions: `~/.ssh` should be 700, `~/.ssh/authorized_keys` should be 600
- Ensure the private key format is correct (OpenSSH format, not PuTTY)

**Problem**: "Could not resolve hostname"

- Verify `DEPLOY_HOST` is correct (IP or domain)
- Test connectivity: `ping ${DEPLOY_HOST}`

**Problem**: "docker: permission denied"

- Ensure user is in the `docker` group: `groups ${DEPLOY_USER}`
- May need to log out and back in for group changes to take effect

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
