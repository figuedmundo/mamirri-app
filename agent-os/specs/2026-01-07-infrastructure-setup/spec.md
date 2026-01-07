# Specification: Infrastructure Setup

## Goal

Establish the foundational development infrastructure for MamirriApp including Docker services, database schema, and module structure to support future feature development.

## User Stories

- As a developer, I want to have Docker infrastructure ready (Postgres with pgvector, MinIO, Redis) so that I can develop features without setting up local services.
- As a developer, I want to have a basic NestJS and React code structure so that I can start implementing business logic.

## Specific Requirements

**Docker Infrastructure**

- Configure PostgreSQL 16 with pgvector extension for future AI features
- Configure MinIO for local S3-compatible object storage
- Configure Redis for optional caching/sessions
- Set up proper health checks and restart policies
- Use environment variables from root `.env` file for all credentials

**Database Schema**

- Create Prisma schema with `User` model (id, email, passwordHash, name, role)
- Create Prisma schema with `Patient` model (id, firstName, lastName, dob, phone, email)
- Create Prisma schema with `Session` model (id, patientId, therapistId, status [DRAFT, FINALIZED], date)
- Ensure pgvector extension is enabled for future vector embeddings

**NestJS Module Structure**

- Create `auth` module with module, controller, and service shells
- Create `patients` module with module, controller, and service shells
- Create `sessions` module with module, controller, and service shells
- Create `media` module with module, controller, and service shells
- Set up folder structure for strategies, guards, and decorators in auth module

**Frontend Structure**

- Initialize Shadcn/UI with basic layout components
- Create `MainLayout` component with sidebar and header shell
- Set up empty dashboard page structure
- Follow existing component patterns (button.tsx, input.tsx) for consistency

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**NestJS Module Pattern**

- Follow the existing `app.module.ts` pattern using `@Module()` decorator with imports, controllers, and providers
- Use the existing controller/service file structure as templates for new modules

**Shadcn/UI Components**

- Reuse existing components from `components/ui/` (button, input, card)
- Follow the `class-variance-authority` and `cn()` utility pattern from existing button component
- Use Radix UI Slot pattern for composability as seen in button.tsx

**Tailwind & Styling**

- Maintain existing Tailwind CSS setup and utility patterns
- Use the same component structure and export patterns as existing UI components

## Out of Scope

- Implementation of JWT authentication logic (Week 2)
- Implementation of CRUD operations for patients/sessions (Week 5-6)
- Implementation of media upload/download functionality (Week 7)
- PWA offline features and service workers (Week 5)
- CI/CD pipeline configuration (Week 3)
- Database backup scripts (Week 3)
