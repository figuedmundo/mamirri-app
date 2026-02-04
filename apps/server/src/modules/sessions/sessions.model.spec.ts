import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('TreatmentSession Model (Integration)', () => {
  let prisma: PrismaService;

  let therapistId: string;
  let patientId: string;
  let caseId: string;

  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '../../.env',
        }),
      ],
      providers: [PrismaService],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    try {
      await prisma.$connect();
    } catch (e) {
      console.error('Failed to connect to database', e);
      throw e;
    }

    const therapist = await prisma.user.create({
      data: {
        email: `test-therapist-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Test Therapist',
        role: 'THERAPIST',
      },
    });
    therapistId = therapist.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'Test Patient',
        phone: '1234567890',
        birthDate: new Date(),
        occupation: 'Tester',
        therapistId: therapistId,
        medicalFlags: [],
      },
    });
    patientId = patient.id;

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Test Case',
        status: 'active',
        startDate: new Date(),
        consultationReason: 'Pain',
        patientId: patientId,
      },
    });
    caseId = clinicalCase.id;
  });

  afterAll(async () => {
    try {
      if (prisma) {
        if (caseId)
          await prisma.treatmentSession.deleteMany({
            where: { clinicalCaseId: caseId },
          });
        if (caseId)
          await prisma.clinicalCase.deleteMany({ where: { id: caseId } });
        if (patientId)
          await prisma.patient.deleteMany({ where: { id: patientId } });
        if (therapistId)
          await prisma.user.deleteMany({ where: { id: therapistId } });
        if (typeof prisma.$disconnect === 'function') {
          await prisma.$disconnect();
        }
      }
      if (moduleFixture) {
        await moduleFixture.close();
      }
    } catch (e) {
      console.error('Cleanup failed', e);
    }
  });

  it('should create a session with default status DRAFT', async () => {
    const session = await prisma.treatmentSession.create({
      data: {
        date: new Date(),
        phaseNumber: 1,
        procedures: ['Massage'],
        patientResponse: 'Good',
        finalPainLevel: 5,
        observations: 'None',
        clinicalCaseId: caseId,
        therapistId: therapistId,
      } as any,
    });

    expect(session).toBeDefined();
    expect((session as any)['status']).toBe('DRAFT');
  });

  it('should support soft deletion (deletedAt)', async () => {
    const deletedDate = new Date();
    const session = await prisma.treatmentSession.create({
      data: {
        date: new Date(),
        phaseNumber: 1,
        procedures: ['Massage'],
        patientResponse: 'Good',
        finalPainLevel: 5,
        observations: 'None',
        clinicalCaseId: caseId,
        therapistId: therapistId,
        deletedAt: deletedDate,
      } as any,
    });

    expect((session as any)['deletedAt']).toBeDefined();
    expect((session as any)['deletedAt']).not.toBeNull();
  });
});
