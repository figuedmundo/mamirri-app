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

describe('Clinical Cases Integration (DB Layer)', () => {
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

  it('should create a clinical case linked to a patient', async () => {
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-case-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Test Therapist',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Case Test Patient',
        occupation: 'Developer',
        phone: '1234567890',
        birthDate: new Date('1989-06-15'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Lower Back Pain',
        consultationReason: 'Chronic pain for 3 months',
        status: 'active',
        startDate: new Date(),
        patientId: patient.id,
      },
    });

    expect(clinicalCase).toBeDefined();
    expect(clinicalCase.patientId).toBe(patient.id);
    expect(clinicalCase.status).toBe('active');

    await prisma.clinicalCase.delete({ where: { id: clinicalCase.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });

  it('should cascade patient relationships to clinical case', async () => {
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-cascade-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Cascade Therapist',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Cascade Patient',
        occupation: 'Engineer',
        phone: '9876543210',
        birthDate: new Date('1984-03-20'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });

    await prisma.clinicalCase.create({
      data: {
        title: 'Shoulder Injury',
        consultationReason: 'Sports injury',
        status: 'active',
        startDate: new Date(),
        patientId: patient.id,
      },
    });

    const patientWithCases = await prisma.patient.findUnique({
      where: { id: patient.id },
      include: { clinicalCases: true },
    });

    expect(patientWithCases?.clinicalCases).toHaveLength(1);
    expect(patientWithCases?.clinicalCases[0].title).toBe('Shoulder Injury');

    await prisma.clinicalCase.deleteMany({ where: { patientId: patient.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });

  it('should support clinical case status updates', async () => {
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-status-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Status Therapist',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Status Patient',
        occupation: 'Teacher',
        phone: '5551234567',
        birthDate: new Date('1996-08-10'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Knee Rehabilitation',
        consultationReason: 'Post-surgery recovery',
        status: 'active',
        startDate: new Date(),
        patientId: patient.id,
      },
    });

    const updatedCase = await prisma.clinicalCase.update({
      where: { id: clinicalCase.id },
      data: { status: 'completed', endDate: new Date() },
    });

    expect(updatedCase.status).toBe('completed');
    expect(updatedCase.endDate).toBeDefined();

    await prisma.clinicalCase.delete({ where: { id: clinicalCase.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });

  it('should create evaluation linked to clinical case', async () => {
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
        occupation: 'Manager',
        phone: '1112223333',
        birthDate: new Date('1979-12-01'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Back Pain Assessment',
        consultationReason: 'Initial evaluation',
        status: 'active',
        startDate: new Date(),
        patientId: patient.id,
      },
    });

    const evaluation = await prisma.evaluation.create({
      data: {
        date: new Date(),
        type: 'INITIAL',
        clinicalCaseId: clinicalCase.id,
        painScale: { rest: 3, activity: 7 },
        posturogram: {},
        orthopedicTests: {},
        avdEvaluation: {},
        diagnosis: { primary: 'Lumbar strain' },
      },
    });

    expect(evaluation).toBeDefined();
    expect(evaluation.clinicalCaseId).toBe(clinicalCase.id);
    expect(evaluation.painScale).toEqual({ rest: 3, activity: 7 });

    await prisma.evaluation.delete({ where: { id: evaluation.id } });
    await prisma.clinicalCase.delete({ where: { id: clinicalCase.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });

  it('should create treatment session linked to clinical case', async () => {
    const therapist = await prisma.user.create({
      data: {
        email: `therapist-session-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Session Therapist',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        name: 'Session Patient',
        occupation: 'Nurse',
        phone: '4445556666',
        birthDate: new Date('1992-04-25'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Physical Therapy',
        consultationReason: 'Muscle rehabilitation',
        status: 'active',
        startDate: new Date(),
        patientId: patient.id,
      },
    });

    const session = await prisma.treatmentSession.create({
      data: {
        date: new Date(),
        phaseNumber: 1,
        procedures: ['Massage', 'Stretching'],
        patientResponse: 'Good tolerance',
        finalPainLevel: 4,
        observations: 'Progress noted',
        clinicalCaseId: clinicalCase.id,
        therapistId: therapist.id,
      },
    });

    expect(session).toBeDefined();
    expect(session.clinicalCaseId).toBe(clinicalCase.id);
    expect(session.procedures).toContain('Massage');
    expect(session.finalPainLevel).toBe(4);

    await prisma.treatmentSession.delete({ where: { id: session.id } });
    await prisma.clinicalCase.delete({ where: { id: clinicalCase.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: therapist.id } });
  });
});
