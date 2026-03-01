import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env'), quiet: true });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || '',
  )
    .replace('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD || '')
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || '');
}

describe('Evaluation Integration (1:1 Relation)', () => {
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

  it('should allow one evaluation for a single clinical case', async () => {
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-eval-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Eval Therapist',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Eval Patient',
        occupation: 'Tester',
        phone: '1234567890',
        birthDate: new Date('1994-01-01'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Knee Pain',
        status: 'active',
        startDate: new Date(),
        consultationReason: 'Pain in left knee',
        patientId: patient.id,
      },
    });

    const evaluation = await prisma.evaluation.create({
      data: {
        date: new Date(),
        posturogram: {},
        orthopedicTests: {},
        avdEvaluation: {},
        painScale: { level: 8, location: 'knee' },
        diagnosis: { code: 'M25.5' },
        clinicalCaseId: clinicalCase.id,
      },
    });
    expect(evaluation).toBeDefined();
    expect(evaluation.clinicalCaseId).toBe(clinicalCase.id);

    const caseWithEvals = await prisma.clinicalCase.findUnique({
      where: { id: clinicalCase.id },
      include: { evaluation: true },
    });

    expect(caseWithEvals).toBeDefined();
    expect(caseWithEvals?.evaluation).toBeDefined();

    await prisma.evaluation.deleteMany({
      where: { clinicalCaseId: clinicalCase.id },
    });
    await prisma.clinicalCase.delete({ where: { id: clinicalCase.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });
});
