# Mamirri App 🏥

A digital assistant for physiotherapists, designed to simplify patient management and clinical documentation.

## Project Structure

This project is a **Monorepo** managed with [Turborepo](https://turbo.build/repo), consisting of:

### 📱 Applications

- **`apps/client`**: Frontend application.
  - **Tech Stack**: React 19, TypeScript, Vite, TailwindCSS, Shadcn/UI.
  - **Port**: `http://localhost:5173`

- **`apps/server`**: Backend API.
  - **Tech Stack**: NestJS, TypeScript, Prisma ORM, Swagger.
  - **Port**: `http://localhost:3000` (API: `http://localhost:3000/api/v1`)
  - **Docs**: `http://localhost:3000/api/docs`

### 📦 Packages

- **`packages/ui`**: Shared React component library (stub).
- **`packages/eslint-config`**: Shared ESLint configurations.
- **`packages/typescript-config`**: Shared `tsconfig` bases.

### 🛠 Infrastructure

- **Docker**: Runs the database infrastructure.
- **PostgreSQL**: Primary database (v16).
- **Prisma**: ORM for database schema management and migrations.

## Getting Started

### Prerequisites

- Node.js (>= 18)
- pnpm (managed via Corepack or installed globally)
- Docker & Docker Compose

### Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start Infrastructure (Database):**

   ```bash
   docker-compose up -d
   ```

3. **Initialize Database:**
   ```bash
   # Run migrations to create tables
   pnpm --filter server exec npx prisma migrate dev
   ```

### Development

To start both the client and server in development mode:

```bash
pnpm dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Commands

- `pnpm build`: Build all applications.
- `pnpm dev`: Start all applications in watch mode.
- `pnpm lint`: Lint all packages.
- `pnpm format`: Format code with Prettier.

## Roadmap

See [agent-os/product/roadmap.md](agent-os/product/roadmap.md) for the detailed development plan.
