# ADR-007: Docker-Native Initialization & Orchestration

**Status:** ✅ Accepted  
**Date:** 2026-01-08  
**Deciders:** Sisyphus (AI), User

---

## Context

Developers frequently need to "reset" their environment by deleting containers and volumes. Manually re-running setup scripts, migrations, and seeding is tedious and error-prone. The goal was to make the infrastructure self-healing and self-provisioning.

---

## Decision

We moved all infrastructure initialization logic into the Docker lifecycle.

Key Components:

1.  **Server Entrypoint**: Created `docker/server/entrypoint.sh` which orchestrates the startup:
    - Waits for Postgres to be ready (`pg_isready`).
    - Runs `prisma migrate deploy`.
    - Runs `prisma db seed`.
2.  **MinIO Provisioner**: Added a dedicated `minio-provisioner` service in `docker-compose.yml` that exits after creating the required buckets and permissions.
3.  **Health-Based Dependencies**: Updated `docker-compose.yml` to use `service_healthy` and `service_completed_successfully` conditions, ensuring correct execution order.

---

## Consequences

### Positive

- ✅ **Zero-Config Onboarding**: New developers only need to run `docker compose up`.
- ✅ **Atomic Resets**: `docker compose down -v && docker compose up` results in a perfectly seeded and configured environment every time.
- ✅ **Production Readiness**: This pattern is directly transferable to production orchestrators like Kubernetes or AWS ECS.

### Negative

- ⚠️ Slower initial container startup due to internal migration/seeding steps.

---

## References

- `docker/server/Dockerfile`
- `docker/server/entrypoint.sh`
- `docker-compose.yml`
