FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json ./apps/client/
COPY packages/ ./packages/

RUN pnpm install --filter client...

COPY apps/client ./apps/client

COPY turbo.json ./
# Build arguments for Vite
ARG VITE_SENTRY_DSN
ARG VITE_APP_VERSION
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN pnpm run build --filter client...


FROM nginx:alpine

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
