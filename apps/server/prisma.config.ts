import { config } from 'dotenv';
import { join } from 'path';
import { defineConfig } from 'prisma/config';

config({ path: join(__dirname, '../../.env') });

let url = process.env.DATABASE_URL;

if (url && url.includes('${')) {
  url = url
    .replace('${POSTGRES_USER}', process.env.POSTGRES_USER || 'postgres')
    .replace(
      '${POSTGRES_PASSWORD}',
      process.env.POSTGRES_PASSWORD || 'postgres',
    )
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || 'mamirri');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url,
  },
});
