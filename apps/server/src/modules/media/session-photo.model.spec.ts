import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || '',
  )
    .replace('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD || '')
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || '');
}

describe('SessionPhoto Model Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let therapistId: string;
  let patientId: string;
  let clinicalCaseId: string;
  let sessionId: string;

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

    const therapist = await prisma.user.create({
      data: {
        email: `therapist-photo-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Photo Therapist',
      },
    });
    therapistId = therapist.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'Photo Patient',
        occupation: 'Model',
        phone: '9876543210',
        birthDate: new Date('1999-01-01'),
        therapistId: therapist.id,
        medicalFlags: [],
      },
    });
    patientId = patient.id;

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        title: 'Ankle Sprain',
        status: 'active',
        startDate: new Date(),
        consultationReason: 'Twisted ankle',
        patientId: patient.id,
      },
    });
    clinicalCaseId = clinicalCase.id;

    const session = await prisma.treatmentSession.create({
      data: {
        date: new Date(),
        phaseNumber: 1,
        procedures: ['Ice', 'Rest'],
        patientResponse: 'Better',
        finalPainLevel: 5,
        clinicalCaseId: clinicalCase.id,
        therapistId: therapist.id,
        observations: 'Initial session',
      },
    });
    sessionId = session.id;
  });

  afterAll(async () => {
    try {
      if (prisma) {
        if (sessionId) {
          try {
            await prisma.treatmentSession.delete({ where: { id: sessionId } });
          } catch {
            // ignore
          }
        }
        if (clinicalCaseId) {
          await prisma.clinicalCase.delete({ where: { id: clinicalCaseId } });
        }
        if (patientId) {
          await prisma.patient.delete({ where: { id: patientId } });
        }
        if (therapistId) {
          await prisma.user.delete({ where: { id: therapistId } });
        }
        if (typeof prisma.$disconnect === 'function') {
          await prisma.$disconnect();
        }
      }
    } catch (e) {
      console.error('Cleanup failed', e);
    }

    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('should create a session photo with valid data', async () => {
    const photo = await prisma.sessionPhoto.create({
      data: {
        sessionId: sessionId,
        storageKey: `sessions/${sessionId}/photos/photo-1.jpg`,
        caption: 'Ankle swelling view',
        capturedAt: new Date(),
      },
    });

    expect(photo).toBeDefined();
    expect(photo.id).toBeDefined();
    expect(photo.sessionId).toBe(sessionId);
    expect(photo.caption).toBe('Ankle swelling view');
  });

  it('should fail to create photo with non-existent sessionId', async () => {
    const fakeSessionId = 'non-existent-session-id';

    await expect(
      prisma.sessionPhoto.create({
        data: {
          sessionId: fakeSessionId,
          storageKey: 'invalid-session.jpg',
          capturedAt: new Date(),
        },
      }),
    ).rejects.toThrow();
  });

  it('should fail to create photo with caption longer than 140 chars', async () => {
    const longCaption = 'a'.repeat(141);

    await expect(
      prisma.sessionPhoto.create({
        data: {
          sessionId: sessionId,
          storageKey: 'long-caption.jpg',
          caption: longCaption,
          capturedAt: new Date(),
        },
      }),
    ).rejects.toThrow();
  });

  it('should cascade delete photos when session is deleted', async () => {
    const tempSession = await prisma.treatmentSession.create({
      data: {
        date: new Date(),
        phaseNumber: 1,
        procedures: ['Test'],
        patientResponse: 'Test',
        finalPainLevel: 1,
        clinicalCaseId: clinicalCaseId,
        therapistId: therapistId,
        observations: 'Temp session',
      },
    });

    const photo = await prisma.sessionPhoto.create({
      data: {
        sessionId: tempSession.id,
        storageKey: 'temp-photo.jpg',
        capturedAt: new Date(),
      },
    });

    const photoBefore = await prisma.sessionPhoto.findUnique({
      where: { id: photo.id },
    });
    expect(photoBefore).toBeDefined();

    await prisma.treatmentSession.delete({
      where: { id: tempSession.id },
    });

    const photoAfter = await prisma.sessionPhoto.findUnique({
      where: { id: photo.id },
    });
    expect(photoAfter).toBeNull();
  });
});
