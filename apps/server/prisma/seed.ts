import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

async function main() {
  const poolConfig: any = {
    connectionString,
  };

  // Use explicit credentials if available to avoid URL encoding issues with special characters
  if (process.env.POSTGRES_USER) poolConfig.user = process.env.POSTGRES_USER;
  if (process.env.POSTGRES_PASSWORD)
    poolConfig.password = process.env.POSTGRES_PASSWORD;
  if (process.env.POSTGRES_DB) poolConfig.database = process.env.POSTGRES_DB;

  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const users = [
    {
      email: 'test@test.com',
      name: 'Default Physio',
      password: 'test',
      role: 'THERAPIST',
    },
    {
      email: 'test@example.com',
      name: 'Example User',
      password: 'password123',
      role: 'USER',
    },
  ];

  console.log('Seeding database...');

  for (const userData of users) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash },
      create: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        role: userData.role as any,
      },
    });
    console.log(`User created/found: ${user.email}`);
  }
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
