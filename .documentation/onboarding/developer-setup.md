# Developer Setup Guide

This guide will help you set up your local environment to contribute to MamirriApp.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **pnpm**: Version 10 or higher (install via `npm install -g pnpm` or Corepack)
- **Docker & Docker Compose**: For running the database and infrastructure services
- **Git**: For version control

## 1. Quick Start (Docker-Native)

This project supports a fully automated initialization. If you have Docker installed, you can start the entire infrastructure (including migrations and seeding) with:

```bash
docker compose up -d
```

The `server` container will automatically:

1. Wait for Postgres to be healthy.
2. Run Prisma migrations.
3. Seed the default user.
4. Provision MinIO buckets.

## 2. Manual Setup Steps

If you prefer to run services individually or need to troubleshoot:

### 2.1 Configure Environment

Copy the example environment file and set up your local secrets:

```bash
./scripts/setup-env.sh
```

_Note: This script copies `.env.example` to `.env` and sets secure permissions._

### 2.2 Start Infrastructure

Start the local database (PostgreSQL), MinIO, and Redis:

```bash
docker compose up -d
```

### 2.3 Initialize Database

Run Prisma migrations to set up the database schema:

```bash
pnpm --filter server exec npx prisma migrate dev
```

## 3. Running the Application

Start both the frontend client and backend server in development mode:

```bash
pnpm dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Swagger Documentation:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 4. Running Tests

We use **Jest** for unit tests and **React Testing Library** for frontend tests.

### Unit Tests

Run unit tests for all packages:

```bash
pnpm test
```

Run tests for server only:

```bash
pnpm --filter server test
```

### E2E Tests

Run end-to-end integration tests:

```bash
pnpm test:e2e
```

### Test Coverage

Generate a test coverage report:

```bash
pnpm test:cov
```

## 5. Contribution Guidelines

### Commit Messages

We follow the **Conventional Commits** specification:

- `feat: add new login page`
- `fix: resolve auth token issue`
- `docs: update developer setup guide`
- `test: add unit tests for storage service`
- `chore: update dependencies`

### Pull Request Process

1. Create a new branch for your feature/fix (`feature/my-feature` or `fix/issue-123`).
2. Implement your changes.
3. Add tests to cover your changes.
4. Run `pnpm lint` and `pnpm test` to ensure quality.
5. Create a Pull Request targeting the `main` branch.
6. Request a code review.

## 6. Architecture Overview

For a deeper understanding of the system architecture, please refer to:

- [Product Vision](../product/product-vision.md)
- [Architecture Overview](../technical/architecture.md)
- [Database Schema](../technical/database-schema.md)
- [API Reference](../technical/api-reference.md)

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

- Check if Docker container is running: `docker ps`
- Verify `.env` credentials match `docker-compose.yml`
- Try restarting containers: `docker compose down && docker compose up -d`

### Port Conflicts

If ports 3000 or 5173 are in use, you can modify the ports in `.env` or stop the conflicting processes.

### Environment Reset

If you need to wipe the database and start completely fresh:

```bash
docker compose down -v
docker compose up -d
```
