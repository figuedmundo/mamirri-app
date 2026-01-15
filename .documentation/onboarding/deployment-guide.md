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

---

**Last Updated:** 2026-01-15
