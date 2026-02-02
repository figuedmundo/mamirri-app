FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json ./apps/client/
COPY packages/ ./packages/

RUN pnpm install --filter client...

COPY apps/client ./apps/client

COPY turbo.json ./
RUN pnpm run build --filter client...


FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
