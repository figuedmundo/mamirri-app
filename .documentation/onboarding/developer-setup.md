# Developer Setup Guide

This guide will help you set up your local environment to contribute to MamirriApp.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher
- **pnpm**: Version 10 or higher (install via `npm install -g pnpm` or Corepack)
- **Docker & Docker Compose**: For running database, infrastructure, and Docling PDF worker
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

### 2.4 Docling PDF Extraction (Zero Setup)

Mamirri uses **Docling** for high-quality PDF extraction with automatic Docker management.

**Zero Setup** - The system automatically:

- Checks if Docker is available
- Builds the `docling-worker` Docker image on first use (takes 3-5 minutes)
- Uses the container for PDF extraction
- Falls back to `pdf-parse` if Docker is unavailable

**No manual Python setup required!** The Docker image includes all dependencies.

When you run `pnpm knowledge:ingest` for the first time, you'll see:

```
Docling-worker image not found. Building... (this may take a few minutes)
Building Docker image: docling-worker:latest
```

Subsequent runs will be fast since the image is cached.

**Note**: The Docker image includes PyTorch and CUDA dependencies (~3GB), so first build may take several minutes. This is a one-time setup.

## 3. Running the Application

Start both the frontend client and backend server in development mode:

```bash
pnpm dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Swagger Documentation:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 4. Running Tests

We use multiple testing strategies to ensure code quality and application stability.

### Unit Tests

We use **Vitest** for unit tests and **React Testing Library** for component testing.

Run unit tests for all packages:

```bash
pnpm test
```

Run tests for specific packages:

```bash
pnpm --filter client test
pnpm --filter server test
```

### E2E Tests

We use **Playwright** for end-to-end testing. E2E tests verify critical user flows by simulating real user interactions with the application.

#### Running E2E Tests

Run all E2E tests:

```bash
pnpm test:e2e
```

Run E2E tests with interactive UI mode (for debugging):

```bash
pnpm test:e2e:ui
```

Run specific E2E test file:

```bash
pnpm --filter client exec playwright test tests/e2e/create-patient.spec.ts
```

#### E2E Test Architecture

Our E2E tests follow the Page Object Model (POM) pattern for maintainability:

- **Page Objects**: `apps/client/tests/e2e/pages/`
  - `BasePage.ts`: Common functionality (navigation, auth mocking, toast verification)
  - `PatientPage.ts`: Patient management page interactions
  - `CasePage.ts`: Clinical case and session recording interactions

- **Test Suites**: `apps/client/tests/e2e/`
  - `smoke.spec.ts`: Basic application load verification
  - `create-patient.spec.ts`: Patient creation flow
  - `record-session.spec.ts`: Treatment session recording flow

#### E2E Test Coverage

Current E2E tests cover:

✅ **Smoke Tests**

- Application loads correctly
- Page title verification

✅ **Critical User Flows**

- Patient creation with form validation
- Clinical case session recording
- Authentication mocking for test isolation

#### Writing E2E Tests

When adding new E2E tests:

1. **Follow Page Object Model**: Create/reuse page objects in `tests/e2e/pages/`
2. **Use Proper Selectors**: Prefer `getByRole()` and `getByLabel()` over CSS selectors
3. **Mock API Responses**: Isolate tests by mocking backend responses
4. **Test Critical Paths**: Focus on user-facing features, not implementation details

Example test structure:

```typescript
import { test, expect } from '@playwright/test';
import { PatientPage } from './pages/PatientPage';

test('create patient flow', async ({ page }) => {
  const patientPage = new PatientPage(page);

  // Mock API responses
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify({ id: 1 }) });
  });

  // Setup auth
  await patientPage.mockAuth();

  // Execute flow
  await patientPage.gotoList();
  await patientPage.createPatient({ name: 'Juan Perez', age: '45' });

  // Verify outcome
  await patientPage.waitForToast(/Paciente creado/i);
});
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
