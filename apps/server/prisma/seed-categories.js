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

const DEFAULT_CATEGORIES = [
  {
    name: 'Osteologia y Artrologia',
    description: 'Estructura osea y articulaciones',
    icon: 'bone',
  },
  {
    name: 'Miologia',
    description: 'Musculos y cadenas musculares',
    icon: 'muscle',
  },
  {
    name: 'Test de Elasticidad',
    description: 'Evaluacion de flexibilidad y retracciones',
    icon: 'activity',
  },
  {
    name: 'Test Funcionales',
    description: 'Pruebas de movilidad y funcion',
    icon: 'move',
  },
  {
    name: 'Protocolos de Tratamiento',
    description: 'Tecnicas de intervencion (McKenzie, RPG, etc.)',
    icon: 'clipboard',
  },
];

async function main() {
  console.log('Seeding default clinical categories...');

  const existingCount = await prisma.clinicalCategory.count();
  if (existingCount > 0) {
    console.log(
      `Clinical categories already exist (${existingCount}). Skipping default seed.`,
    );
    return;
  }

  let created = 0;
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.clinicalCategory.create({ data: category });
    created += 1;
  }

  console.log(
    `Default categories ready (${DEFAULT_CATEGORIES.length} total, ${created} created this run).`,
  );
}

main()
  .catch((error) => {
    console.error('Default category seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
