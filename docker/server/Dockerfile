# Production Dockerfile for Server
# Multi-stage build for optimized production image
# Note: pnpm version is read automatically from package.json's packageManager field

# Stage 1: Builder
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Enable pnpm - version is automatically read from package.json packageManager field
RUN corepack enable

WORKDIR /app

# Copy root workspace files (package.json contains the pnpm version in packageManager)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Configure pnpm to allow build scripts (needed for bcrypt, prisma, esbuild)
# This uses the pnpm version specified in package.json
RUN pnpm config set allow-build-scripts true

# Copy all package.json files for workspace resolution
COPY apps/server/package.json ./apps/server/
COPY packages/logger/package.json ./packages/logger/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/server/prisma ./apps/server/prisma
COPY apps/server/prisma.config.js ./apps/server/
COPY apps/server/src ./apps/server/src
COPY apps/server/tsconfig.json ./apps/server/
COPY apps/server/tsconfig.build.json ./apps/server/
COPY apps/server/nest-cli.json ./apps/server/
COPY apps/server/prisma/seed.ts ./apps/server/prisma/
COPY packages/logger ./packages/logger

# Generate Prisma client
WORKDIR /app/apps/server
RUN npx prisma generate

# Build the application
RUN pnpm exec nest build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache postgresql-client curl

# Enable pnpm - version automatically read from package.json
RUN corepack enable

# Setup pnpm global directory (required for global installs)
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN mkdir -p $PNPM_HOME

# Install Prisma CLI globally using pnpm (version from package.json)
RUN pnpm add -g prisma@7.2.0

WORKDIR /app

# Copy workspace files
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./

# Copy the server package.json
COPY --from=builder /app/apps/server/package.json ./apps/server/

# Copy the compiled logger package (needed for workspace resolution)
COPY --from=builder /app/packages/logger ./packages/logger

# Copy server files
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder /app/apps/server/prisma.config.js ./apps/server/
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Copy ALL node_modules from builder (includes all production dependencies)
# This is MUCH faster than reinstalling everything
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules

# Copy entrypoint script
COPY docker/server/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

WORKDIR /app/apps/server

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["node", "dist/src/main"]
