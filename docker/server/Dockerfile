FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

RUN pnpm install --filter server...

COPY apps/server ./apps/server

RUN pnpm install --filter server...

WORKDIR /app/apps/server
RUN npx prisma generate

COPY docker/server/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["pnpm", "run", "dev"]
