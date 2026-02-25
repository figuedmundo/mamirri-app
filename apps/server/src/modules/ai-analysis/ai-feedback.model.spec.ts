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

describe('AI Feedback Models Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let therapistId: string;
  let patientId: string;
  let clinicalCaseId: string;

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
        email: `therapist-ai-feedback-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'AI Feedback Tester',
      },
    });
    therapistId = therapist.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'AI Feedback Patient',
        occupation: 'Tester',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        therapistId,
      },
    });
    patientId = patient.id;

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        patientId,
        title: 'Case for AI Feedback',
        consultationReason: 'Testing feedback mechanism',
        startDate: new Date(),
        status: 'ACTIVE',
      },
    });
    clinicalCaseId = clinicalCase.id;
  }, 30000);

  afterAll(async () => {
    if (therapistId) {
      await prisma.clinicalCase.deleteMany({ where: { patientId } });
      await prisma.patient.deleteMany({ where: { therapistId } });
      await prisma.user.delete({ where: { id: therapistId } });
    }
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('1.1 should create an AiAnalysis record linked to ClinicalCase', async () => {
    const analysisResult = {
      primarySuggestion: {
        title: 'Test Suggestion',
        description: 'Test Description',
        confidence: 'HIGH',
      },
      alternatives: [],
      citations: [],
      reasoning: {
        step1_understanding: 'Understanding',
        step2_literature: 'Literature',
        step3_synthesis: 'Synthesis',
      },
      metadata: {
        processingTimeMs: 100,
      },
    };

    const analysis = await (prisma as any).aiAnalysis.create({
      data: {
        clinicalCaseId,
        therapistId,
        result: analysisResult,
      },
    });

    expect(analysis).toBeDefined();
    expect(analysis.clinicalCaseId).toBe(clinicalCaseId);
    expect(analysis.therapistId).toBe(therapistId);
    expect(analysis.result).toEqual(analysisResult);
  });

  it('1.2 should create an AiFeedback record linked to AiAnalysis', async () => {
    const analysis = await (prisma as any).aiAnalysis.create({
      data: {
        clinicalCaseId,
        therapistId,
        result: { foo: 'bar' },
      },
    });

    const feedback = await (prisma as any).aiFeedback.create({
      data: {
        aiAnalysisId: analysis.id,
        suggestionIndex: 0,
        isPositive: true,
        comment: 'Very helpful',
      },
    });

    expect(feedback).toBeDefined();
    expect(feedback.aiAnalysisId).toBe(analysis.id);
    expect(feedback.suggestionIndex).toBe(0);
    expect(feedback.isPositive).toBe(true);
    expect(feedback.comment).toBe('Very helpful');
  });

  it('1.3 should enforce unique constraint on [aiAnalysisId, suggestionIndex]', async () => {
    const analysis = await (prisma as any).aiAnalysis.create({
      data: {
        clinicalCaseId,
        therapistId,
        result: { foo: 'bar' },
      },
    });

    await (prisma as any).aiFeedback.create({
      data: {
        aiAnalysisId: analysis.id,
        suggestionIndex: 1,
        isPositive: true,
      },
    });

    await expect(
      (prisma as any).aiFeedback.create({
        data: {
          aiAnalysisId: analysis.id,
          suggestionIndex: 1,
          isPositive: false,
        },
      }),
    ).rejects.toThrow();
  });

  it('1.4 should cascade delete AiAnalysis when ClinicalCase is deleted', async () => {
    const patientForDelete = await prisma.patient.create({
      data: {
        name: 'Delete Test Patient',
        occupation: 'Tester',
        phone: '000',
        birthDate: new Date(),
        therapistId,
      },
    });

    const caseForDelete = await prisma.clinicalCase.create({
      data: {
        patientId: patientForDelete.id,
        title: 'Delete Test Case',
        consultationReason: 'Testing cascade',
        startDate: new Date(),
        status: 'ACTIVE',
      },
    });

    const analysis = await (prisma as any).aiAnalysis.create({
      data: {
        clinicalCaseId: caseForDelete.id,
        therapistId,
        result: { foo: 'bar' },
      },
    });

    const feedback = await (prisma as any).aiFeedback.create({
      data: {
        aiAnalysisId: analysis.id,
        suggestionIndex: 0,
        isPositive: true,
      },
    });

    await prisma.clinicalCase.delete({ where: { id: caseForDelete.id } });

    const foundAnalysis = await (prisma as any).aiAnalysis.findUnique({
      where: { id: analysis.id },
    });
    expect(foundAnalysis).toBeNull();

    const foundFeedback = await (prisma as any).aiFeedback.findUnique({
      where: { id: feedback.id },
    });
    expect(foundFeedback).toBeNull();

    await prisma.patient.delete({ where: { id: patientForDelete.id } });
  });
});
