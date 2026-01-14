import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

let connectionString = process.env.DATABASE_URL;

// Handle variable substitution if needed (copied from seed.ts logic)
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
  console.log('Connecting to database...');
  console.log(`URL: ${connectionString?.replace(/:[^:@]+@/, ':****@')}`); // Log masked URL

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany();
    console.log('\n--- USERS IN DATABASE ---');
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach((u) => {
        console.log(`ID: ${u.id}`);
        console.log(`Name: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Role: ${u.role}`);
        console.log(`Password Hash: ${u.passwordHash.substring(0, 10)}...`);
        console.log('-------------------------');
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
