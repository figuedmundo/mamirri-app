# Spec Requirements: Project Structure Setup

## Initial Description
Setup the project structure for the initial "Hello World" phase. This involves creating a Monorepo with `/client` and `/server` directories, initializing a PostgreSQL database with Prisma, setting up a NestJS backend with Swagger, and creating a React/Vite frontend with Shadcn/UI and TailwindCSS. The goal is to have the environment ready and the "plumbing" connected.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we will use a monorepo tool like Turborepo or Nx for managing the `/client` and `/server` structure. Is that correct, or should we just use a simple folder structure with independent `package.json` files?
**Answer:** lets use a monorepo tool like Turborepo

**Q2:** I'm thinking of using the latest stable versions for all tools (Node.js, NestJS, React, Vite). Should we stick to specific versions for stability?
**Answer:** yes all latests versions

**Q3:** For the database, I assume we will be using a docker-compose.yml file to spin up the PostgreSQL instance locally. Is that correct?
**Answer:** yes

**Q4:** I assume the "Login" screen on the frontend will be purely visual (dummy) for now, without actual authentication logic connected to the backend. Is that correct?
**Answer:** yes, dummy login

**Q5:** Are there any specific naming conventions or prefixes we should use for the database tables or API endpoints at this stage?
**Answer:** please suggest

**Q6:** Should we include any specific linting or formatting tools (ESLint, Prettier) configured at the root level for the monorepo?
**Answer:** yes

**Q7:** Are there any specific exclusions for this phase? For example, should we avoid setting up any CI/CD pipelines or cloud infrastructure for now?
**Answer:** yes, lets make it local

### Existing Code to Reference
No similar existing features identified for reference.

### Follow-up Questions
None needed.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- **Monorepo Setup:** Initialize a Turborepo to manage `apps/client` (Frontend) and `apps/server` (Backend).
- **Backend Setup:**
    - Initialize NestJS project in `apps/server`.
    - Configure Swagger for API documentation.
    - Set up ESLint and Prettier.
- **Frontend Setup:**
    - Initialize React + Vite + TypeScript project in `apps/client`.
    - Install and configure TailwindCSS.
    - Install and configure Shadcn/UI.
    - Create a dummy "Login" screen (visual only).
- **Database Setup:**
    - Create `docker-compose.yml` for PostgreSQL.
    - Initialize Prisma ORM in `apps/server` (or a shared package if preferred, but usually server-bound for this scale).
    - Define initial schema (User, Patient, Session) in `schema.prisma`.
- **Linting & Formatting:** Configure root-level ESLint and Prettier for consistency across the monorepo.

### Reusability Opportunities
- None identified at this stage (greenfield project).

### Scope Boundaries
**In Scope:**
- Local development environment setup.
- Basic "Hello World" connectivity (Database is up, Backend runs, Frontend runs).
- Dummy Login UI.

**Out of Scope:**
- Authentication logic (JWT, etc.).
- CI/CD pipelines.
- Cloud deployment (AWS/Vercel/Render).
- Feature implementation (Patient CRUD, etc.).

### Technical Considerations
- **Naming Conventions Suggestion:**
    - **Database Tables:** singular PascalCase or snake_case? *Recommendation: standard Prisma convention is PascalCase for models (maps to database tables).*
    - **API Endpoints:** RESTful standard (e.g., `/api/v1/resource`).
- **Tools:** Turborepo, pnpm (recommended for Turborepo) or npm, NestJS, React, Vite, TailwindCSS, Shadcn/UI, Prisma, PostgreSQL, Docker.
