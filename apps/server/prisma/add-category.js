const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes('${')) {
  connectionString = connectionString
    .replace('${POSTGRES_USER}', process.env.POSTGRES_USER || 'postgres')
    .replace(
      '${POSTGRES_PASSWORD}',
      process.env.POSTGRES_PASSWORD || 'postgres',
    )
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || 'mamirri');
}

const poolConfig = { connectionString };
if (process.env.POSTGRES_USER) poolConfig.user = process.env.POSTGRES_USER;
if (process.env.POSTGRES_PASSWORD)
  poolConfig.password = process.env.POSTGRES_PASSWORD;
if (process.env.POSTGRES_DB) poolConfig.database = process.env.POSTGRES_DB;

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function parseArgs(argv) {
  const args = { icon: 'clipboard' };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--name' && next) args.name = next;
    if (token === '--description' && next) args.description = next;
    if (token === '--icon' && next) args.icon = next;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const name = args.name ? args.name.trim() : '';
  const description = args.description ? args.description.trim() : '';

  if (!name || !description) {
    console.error(
      'Usage: node prisma/add-category.js --name "Category Name" --description "Description" [--icon "clipboard"]',
    );
    process.exit(1);
  }

  const existing = await prisma.clinicalCategory.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { id: true, name: true },
  });

  if (existing) {
    console.log(`Category already exists: ${existing.name} (${existing.id})`);
    return;
  }

  const created = await prisma.clinicalCategory.create({
    data: {
      name,
      description,
      icon: args.icon || 'clipboard',
    },
    select: { id: true, name: true },
  });

  console.log(`Created category: ${created.name} (${created.id})`);
}

main()
  .catch((error) => {
    console.error('Category creation failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
