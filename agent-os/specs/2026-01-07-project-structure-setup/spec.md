# Specification: Project Structure Setup

## Goal
Establish the foundational project structure for MamirriApp using a Monorepo architecture to enable local development of the client and server components, ensuring basic connectivity and toolchain readiness.

## User Stories
- As a developer, I want to have a unified monorepo so that I can manage both frontend and backend codebases efficiently.
- As a developer, I want to spin up a local PostgreSQL database using Docker so that I can start modeling data without external dependencies.
- As a developer, I want the backend API to be documented with Swagger so that I can easily test endpoints.
- As a developer, I want a "Hello World" frontend running with the correct UI library (Shadcn/UI) so that I can begin UI development immediately.

## Specific Requirements

**Monorepo Initialization**
- Initialize a Turborepo workspace using `pnpm` (recommended) or `npm`.
- Create a directory structure with `apps/client` and `apps/server`.
- Configure root-level `package.json` to manage workspace scripts.
- Set up root-level ESLint and Prettier configurations for consistent code style.

**Backend Setup (NestJS)**
- Initialize a new NestJS application within `apps/server` using the standard CLI.
- Configure a global prefix for API routes (e.g., `/api/v1`).
- Integrate Swagger (`@nestjs/swagger`) to generate API documentation at `/api/docs`.
- Ensure the server runs successfully on a defined port (e.g., 3000 or 3001) via the monorepo dev script.

**Frontend Setup (React + Vite)**
- Initialize a React application using Vite and TypeScript within `apps/client`.
- Install and configure TailwindCSS 3.x with a standard `tailwind.config.js`.
- Initialize Shadcn/UI and add a basic `Button` component to verify installation.
- Create a simple "Dummy Login" page at the root route (`/`) containing email/password inputs and a "Login" button (visual only).

**Database & ORM Setup**
- Create a `docker-compose.yml` file at the root to provision a PostgreSQL container (version 16).
- Initialize Prisma ORM within `apps/server`.
- Define the initial `schema.prisma` with `User`, `Patient`, and `Session` models (using PascalCase for models).
- Configure the database connection string in a `.env` file (ensure `.env` is git-ignored).
- Run the initial migration to create the tables in the local Docker database.

## Visual Design
No visual assets provided.
- The Dummy Login page should be clean, centered, and use Shadcn/UI components (Input, Button, Card).

## Existing Code to Leverage
No existing code to leverage (Greenfield project).

## Out of Scope
- Implementation of actual JWT authentication or session management.
- CRUD operations for Patients or Sessions (beyond schema definition).
- CI/CD pipeline configuration (GitHub Actions, etc.).
- Deployment to cloud providers (AWS, Vercel, Render).
- Any logic connecting the frontend login form to the backend API.
