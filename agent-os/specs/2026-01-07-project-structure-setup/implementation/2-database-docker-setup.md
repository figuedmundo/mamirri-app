# Implementation Report: Task Group 2 - Database & Docker Setup

## Summary
Set up PostgreSQL 16 using Docker Compose.

## Details
- **Docker Compose:** Created `docker-compose.yml` with `postgres:16` image.
- **Environment:** Created `.env` with DB credentials.
- **Port:** Configured host port `5433` (mapped to container `5432`) to avoid conflict with an existing postgres instance on port 5432.
- **Variables:**
  - `POSTGRES_USER`: postgres
  - `POSTGRES_DB`: mamirri
  - `POSTGRES_PASSWORD`: password

## Verification
- `docker-compose up -d` started the container `mamirri-postgres`.
- Verified connection via `docker exec mamirri-postgres psql ...`.
