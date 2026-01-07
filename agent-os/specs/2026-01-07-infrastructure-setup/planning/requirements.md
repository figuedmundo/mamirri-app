# Spec Requirements: Infrastructure Setup

## Initial Description

From Roadmap Week 1:

- [ ] **1.1 Docker Infrastructure:** PostgreSQL (w/ pgvector), MinIO, Redis.
- [ ] **1.2 Prisma Schema v1:** User, Patient, Session tables.
- [ ] **1.3 NestJS Structure:** Create module shells (auth, patients, sessions, media).
- [ ] **1.4 Frontend Setup:** React + Shadcn/UI basic layout.

## Requirements Discussion

### First Round Questions

**Q1:** I assume for the **Database Schema**, we should start with a basic structure for `User` (id, email, password, name), `Patient` (id, name, dob), and `Session` (id, patientId, status, date) to satisfy the Week 1 goal. Is that correct, or do you have specific fields you want included now?
**Answer:** Suggested Default: Start with `User` (id, email, passwordHash, name, role), `Patient` (id, firstName, lastName, dob, phone, email), and `Session` (id, patientId, therapistId, status [DRAFT, FINALIZED], date).

**Q2:** I'm thinking of setting up the **NestJS Modules** (`auth`, `patients`, `sessions`, `media`) as empty shells with just the module file and a basic controller/service placeholder. Should we include any specific boilerplate code (e.g., standard CRUD methods) in them yet?
**Answer:** Suggested Default: Create them as empty shells with just `module`, `controller`, and `service` files. Avoid boilerplate CRUD code for now.

**Q3:** For **Docker**, I'll configure PostgreSQL (with `pgvector/pgvector:pg16` image), MinIO (latest), and Redis (latest) as per the roadmap. Do you have any specific version preferences beyond these?
**Answer:** Suggested Default: Stick to `pgvector/pgvector:pg16` (stable), `minio/minio:latest`, and `redis:alpine` (lightweight).

**Q4:** I assume for the **Frontend Layout**, we should implement a basic shell using `shadcn/ui` with a placeholder sidebar/navigation and a blank dashboard area. Is that correct, or should we focus only on the project initialization without layout components?
**Answer:** Suggested Default: Initialize the project with `shadcn/ui` and create a `MainLayout` component with a sidebar/header shell, but keep the dashboard empty.

**Q5:** I'm assuming we should use `passport-jwt` strategy for the **Auth module** preparation (even if logic comes later). Should we include the `strategies` and `guards` folders structure now?
**Answer:** Suggested Default: Set up the folder structure (`strategies`, `guards`, `decorators`) but don't implement the logic yet.

**Q6:** Is there any specific **MinIO** bucket name convention we should strictly enforce from day one (e.g., `mamirri-dev-media`)?
**Answer:** Suggested Default: Use `mamirri-local-media` for development.

### Existing Code to Reference

No similar existing features identified for reference.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

- N/A

## Requirements Summary

### Functional Requirements

- **Docker**: Functional `docker-compose.yml` with Postgres (pgvector), MinIO, and Redis.
- **Database**: Initialized Prisma schema with `User`, `Patient`, and `Session` models.
- **Backend Structure**: NestJS modules created for `auth`, `patients`, `sessions`, `media`.
- **Frontend Structure**: React app initialized with `shadcn/ui` and a basic `MainLayout`.

### Reusability Opportunities

- Use standard `shadcn/ui` components for the layout shell.
- Follow standard NestJS module patterns.

### Scope Boundaries

**In Scope:**

- Infrastructure configuration files.
- Basic code structure and boilerplate.
- Database schema definition.

**Out of Scope:**

- Implementation of Auth logic (Week 2).
- Implementation of CRUD logic for Patients/Sessions (Week 5/6).
- Implementation of Media upload logic (Week 7).
- Offline PWA features (Week 5).

### Technical Considerations

- **Postgres**: Must support `pgvector` extension for future AI features.
- **MinIO**: Local S3 compatibility layer.
- **NestJS**: Use standard CLI generation where possible.
- **Frontend**: Vite + React + Tailwind + Shadcn.
