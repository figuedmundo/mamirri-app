import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

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

async function main() {
  const pool = new Pool({
    connectionString,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = 'physio@mamirri.com';
  const name = 'Default Physio';
  const password = 'physio_password_change_me';

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  console.log('Seeding database...');

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'THERAPIST',
    },
  });

  console.log(`User created/found: ${user.email}`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
