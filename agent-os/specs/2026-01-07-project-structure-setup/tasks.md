# Task Breakdown: Project Structure Setup

## Overview
Total Tasks: 20

## Task List

### Infrastructure & Monorepo

#### Task Group 1: Monorepo Initialization
**Dependencies:** None

- [x] 1.0 Initialize Monorepo Structure
  - [x] 1.1 Verify Prerequisites
    - Ensure Node.js and pnpm (or npm) are installed (latest versions).
  - [x] 1.2 Initialize Turborepo Workspace
    - Initialize workspace using `pnpm dlx create-turbo@latest`.
    - Set up directory structure with `apps/client` and `apps/server`.
    - Configure root `package.json` scripts (`dev`, `build`, `lint`).
  - [x] 1.3 Configure Root Tooling
    - Set up root-level ESLint configuration.
    - Set up root-level Prettier configuration.
    - Ensure `.gitignore` ignores `node_modules`, `dist`, `.env`, etc.
  - [x] 1.4 Verify Monorepo
    - Run `pnpm install` to ensure workspace linking works.

**Acceptance Criteria:**
- Monorepo structure exists with `apps/client` and `apps/server`.
- Root scripts (`dev`, `lint`) execute without errors.
- ESLint and Prettier enforce styles across the workspace.

### Database Layer

#### Task Group 2: Database & Docker Setup
**Dependencies:** Task Group 1

- [x] 2.0 Database Infrastructure
  - [x] 2.1 Create Docker Compose File
    - Create `docker-compose.yml` at project root.
    - Define PostgreSQL service (version 16).
    - Configure ports (5432) and environment variables (user, password, db name).
  - [x] 2.2 Verify Database Connection
    - Run `docker-compose up -d`.
    - Verify connection using a DB client or command line.

#### Task Group 3: ORM Setup (Prisma)
**Dependencies:** Task Group 2

- [x] 3.0 Prisma Setup
  - [x] 3.1 Initialize Prisma in Backend
    - Install Prisma CLI and Client in `apps/server`.
    - Initialize Prisma (`npx prisma init`) to generate `schema.prisma`.
  - [x] 3.2 Define Data Schema
    - Define `User` model (id, email, passwordHash, name, createdAt).
    - Define `Patient` model (id, fullName, birthDate, occupation, phone, createdAt, updatedAt).
    - Define `Session` model (id, patientId, date, status, observations, attachments).
    - Establish relations (Patient has many Sessions).
  - [x] 3.3 Configure Environment
    - Create `.env` in `apps/server` with `DATABASE_URL` pointing to local Docker Postgres.
    - Add `.env` to `.gitignore`.
  - [x] 3.4 Run Migrations
    - Run `npx prisma migrate dev --name init` to create tables.
    - Verify tables exist in the database.

**Acceptance Criteria:**
- PostgreSQL container runs via Docker Compose.
- Prisma schema is defined with User, Patient, and Session models.
- Migration runs successfully and creates tables in the DB.

### Backend Layer

#### Task Group 4: NestJS Backend Setup
**Dependencies:** Task Group 1, Task Group 3

- [x] 4.0 Backend Application
  - [x] 4.1 Initialize NestJS App
    - Create NestJS app in `apps/server` (if not already scaffolded).
    - Ensure it uses the monorepo's dependency management.
  - [x] 4.2 Configure API Global Prefix
    - Set global prefix to `/api/v1` in `main.ts`.
  - [x] 4.3 Setup Swagger Documentation
    - Install `@nestjs/swagger`.
    - Configure Swagger builder in `main.ts` (title: "MamirriApp API", path: `/api/docs`).
  - [x] 4.4 Verify Backend
    - Run `pnpm dev` (or equivalent) for the backend.
    - Access `http://localhost:3000/api/docs` (or configured port) to see Swagger UI.

**Acceptance Criteria:**
- NestJS app runs without errors.
- API is accessible at `/api/v1`.
- Swagger documentation is available at `/api/docs`.

### Frontend Layer

#### Task Group 5: React Frontend Setup
**Dependencies:** Task Group 1

- [x] 5.0 Frontend Application
  - [x] 5.1 Initialize React App
    - Create React + TypeScript + Vite app in `apps/client`.
  - [x] 5.2 Configure TailwindCSS
    - Install TailwindCSS, PostCSS, Autoprefixer.
    - Initialize `tailwind.config.js` and `postcss.config.js`.
    - Add Tailwind directives to `index.css`.
  - [x] 5.3 Setup Shadcn/UI
    - Initialize Shadcn/UI (`npx shadcn-ui@latest init`).
    - Configure `components.json`.
    - Add `Button`, `Input`, `Card` components (`npx shadcn-ui@latest add button input card`).
  - [x] 5.4 Implement Dummy Login
    - Create `src/pages/Login.tsx` (or similar).
    - Build a centered Login Card with Email/Password inputs and a Login Button.
    - Mount it at the root route `/`.
  - [x] 5.5 Verify Frontend
    - Run `pnpm dev` for the frontend.
    - Verify UI renders correctly with Tailwind styles and Shadcn components.

**Acceptance Criteria:**
- React app runs via Vite.
- TailwindCSS styles apply correctly.
- Shadcn/UI components (Button, Input, Card) function.
- Dummy Login page is visible at `http://localhost:5173` (or configured port).

## Execution Order

Recommended implementation sequence:
1. Monorepo Initialization (Task Group 1)
2. Database & Docker Setup (Task Group 2)
3. ORM Setup (Task Group 3)
4. NestJS Backend Setup (Task Group 4)
5. React Frontend Setup (Task Group 5)
