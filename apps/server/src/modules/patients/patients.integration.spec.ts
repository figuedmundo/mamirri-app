import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars for test
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Manual variable expansion for DATABASE_URL since dotenv doesn't do it automatically
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || '',
  )
    .replace('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD || '')
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || '');
}

describe('Patients Integration (DB Layer)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: path.resolve(process.cwd(), '../../.env'),
        }),
        PrismaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('should create a patient linked to a therapist', async () => {
    // 1. Create Therapist
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Test Therapist',
      },
    });

    // 2. Create Patient
    const patient = await prisma.patient.create({
      data: {
        name: 'John Doe',
        age: 30,
        occupation: 'Test Occupation',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        therapistId: therapist.id,
      },
    });

    expect(patient).toBeDefined();
    expect(patient.therapistId).toBe(therapist.id);

    // Cleanup
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });

  it('should support soft delete (deletedAt field)', async () => {
    // 1. Create Therapist
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-delete-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Delete Therapist',
      },
    });

    // 2. Create Patient
    const patient = await prisma.patient.create({
      data: {
        name: 'Jane Doe',
        age: 25,
        occupation: 'Test Occupation',
        phone: '0987654321',
        birthDate: new Date('1995-05-05'),
        therapistId: therapist.id,
      },
    });

    // 3. Soft Delete
    const now = new Date();
    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        deletedAt: now,
      },
    });

    // 4. Verify
    expect(updatedPatient.deletedAt).toEqual(now);

    // Cleanup
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });
});
