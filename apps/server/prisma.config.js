// Prisma 7 configuration file
// Using CommonJS to ensure it works in all node environments

const path = require('path');
const dotenv = require('dotenv');

// Load .env from apps/server or root
dotenv.config(); // apps/server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') }); // root .env

let url = process.env.DATABASE_URL;

// If URL contains placeholders like ${...}, it means it wasn't expanded by the shell/compose
if (url && url.includes('${')) {
  url = url
    .replace(/\$\{POSTGRES_USER\}/g, process.env.POSTGRES_USER || 'postgres')
    .replace(
      /\$\{POSTGRES_PASSWORD\}/g,
      process.env.POSTGRES_PASSWORD || 'postgres',
    )
    .replace(/\$\{POSTGRES_PORT\}/g, process.env.POSTGRES_PORT || '5432')
    .replace(/\$\{POSTGRES_DB\}/g, process.env.POSTGRES_DB || 'mamirri');
}

// Fallback to a default if URL is still empty (prevents Prisma 7 crash)
if (!url) {
  const user = process.env.POSTGRES_USER || 'postgres';
  const pass = process.env.POSTGRES_PASSWORD || 'postgres';
  const port = process.env.POSTGRES_PORT || '5432';
  const db = process.env.POSTGRES_DB || 'physio_db';
  const host = process.env.POSTGRES_HOST || 'localhost';
  url = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
}

module.exports = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: url,
  },
};
