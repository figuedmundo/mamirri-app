# Task Breakdown: Infrastructure Setup

## Overview

Total Tasks: 12

## Task List

### Docker & Infrastructure Layer

#### Task Group 1: Docker Services Configuration

**Dependencies:** None

- [x] 1.0 Complete Docker infrastructure setup
  - [x] 1.1 Update docker-compose.yml with PostgreSQL (pgvector)
    - Use image: `ankane/pgvector:pg16`
    - Enable pgvector extension
    - Set environment variables from root `.env`
  - [x] 1.2 Update docker-compose.yml with MinIO
    - Use image: `minio/minio:latest`
    - Configure console address port 9001
    - Set up S3-compatible storage
  - [x] 1.3 Update docker-compose.yml with Redis
    - Use image: `redis:alpine`
    - Configure for future caching/sessions
  - [x] 1.4 Add health checks to all services
    - PostgreSQL: `pg_isready` check
    - MinIO: health endpoint check
    - Redis: optional health check
  - [x] 1.5 Create .dockerignore file
    - Exclude node_modules, .git, dist folders
  - [x] 1.6 Update root .env.example with Docker variables
    - Add all service credentials
    - Ensure single source of truth pattern

**Acceptance Criteria:**

- Docker services can be started with `docker-compose up -d`
- All services pass health checks
- Services use environment variables from root `.env`

### Database Layer

#### Task Group 2: Prisma Schema Setup

**Dependencies:** Task Group 1

- [x] 2.0 Complete database schema setup
  - [x] 2.1 Create Prisma schema file
    - Define `User` model (id, email, passwordHash, name, role)
    - Define `Patient` model (id, firstName, lastName, dob, phone, email)
    - Define `Session` model (id, patientId, therapistId, status, date)
    - Add enums for Session status (DRAFT, FINALIZED)
  - [x] 2.2 Write 2-8 focused tests for schema
    - Test field validations
    - Test required fields
    - Test unique constraints
  - [x] 2.3 Create initial migration
    - Add pgvector extension setup
    - Create User, Patient, Session tables
    - Add indexes on commonly queried fields
  - [x] 2.4 Ensure database layer tests pass
    - Run ONLY schema validation tests
    - Verify migrations generate successfully

**Acceptance Criteria:**

- Prisma schema compiles without errors
- Initial migration creates all required tables
- Schema tests pass
- pgvector extension is enabled

### Backend Layer

#### Task Group 3: NestJS Module Structure

**Dependencies:** Task Group 2

- [x] 3.0 Complete NestJS module structure
  - [x] 3.1 Create auth module shell
    - Create `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`
    - Set up folder structure (strategies, guards, decorators)
  - [x] 3.2 Create patients module shell
    - Create `patients.module.ts`, `patients.controller.ts`, `patients.service.ts`
  - [x] 3.3 Create sessions module shell
    - Create `sessions.module.ts`, `sessions.controller.ts`, `sessions.service.ts`
  - [x] 3.4 Create media module shell
    - Create `media.module.ts`, `media.controller.ts`, `media.service.ts`
  - [x] 3.5 Register all modules in AppModule
    - Import and register auth, patients, sessions, media modules
  - [x] 3.6 Write 2-8 focused tests for module structure
    - Test modules register correctly
    - Test controllers and services can be instantiated

**Acceptance Criteria:**

- All modules exist with proper structure
- AppModule imports and registers all modules
- NestJS application starts without errors

### Frontend Layer

#### Task Group 4: Frontend Structure & Layout

**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete frontend basic structure
  - [x] 4.1 Create MainLayout component
    - Sidebar navigation placeholder
    - Header placeholder
    - Outlet for page content
  - [x] 4.2 Create Dashboard page
    - Empty placeholder content
    - Connect to MainLayout
  - [x] 4.3 Write 2-8 focused tests for layout
    - Test sidebar renders
    - Test header renders
    - Test outlet displays child routes
  - [x] 4.4 Configure routing structure
    - Set up basic route for dashboard
  - [x] 4.5 Ensure frontend structure tests pass
    - Run ONLY layout tests
    - Verify routing works

**Acceptance Criteria:**

- MainLayout component renders with sidebar and header
- Dashboard page accessible via routing
- Frontend application builds without errors

### Testing

#### Task Group 5: Infrastructure Verification

**Dependencies:** Task Groups 1-4

- [x] 5.0 Verify complete setup
  - [x] 5.1 Test Docker services start correctly
    - Run `docker-compose up -d`
    - Verify all containers are running
  - [x] 5.2 Test database connection
    - Run Prisma migration
    - Verify connection from backend
  - [x] 5.3 Test backend starts
    - Run NestJS application
    - Verify Swagger documentation is accessible
  - [x] 5.4 Test frontend starts
    - Run Vite dev server
    - Verify page loads correctly
  - [x] 5.5 Ensure all services start successfully
    - Run complete infrastructure verification
    - Document any issues found

**Acceptance Criteria:**

- Docker services running successfully
- Database migrations applied
- Backend API accessible at http://localhost:3000
- Frontend accessible at http://localhost:5173

## Execution Order

Recommended implementation sequence:

1. Docker & Infrastructure Layer (Task Group 1)
2. Database Layer (Task Group 2)
3. Backend Layer (Task Group 3)
4. Frontend Layer (Task Group 4)
5. Infrastructure Verification (Task Group 5)
