import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

jest.setTimeout(60000);

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          primarySuggestion: {
            title: 'Mock Treatment',
            description: 'Mock description',
            confidence: 'HIGH',
            reasoning: 'Mock reasoning',
          },
          alternatives: [],
          citations: [],
          reasoning: {
            step1_understanding: 'Understanding',
            step2_literature: 'Literature',
            step3_synthesis: 'Synthesis',
          },
        }),
      }),
    },
  })),
}));

describe('AiAnalysis (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockPrismaService = {
    clinicalCase: { findUnique: jest.fn() },
    evaluation: { findMany: jest.fn() },
    treatmentSession: { findMany: jest.fn() },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const mockUser = { userId: 'therapist-1' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('/POST ai/cases/:caseId/analyze (Success)', async () => {
    const caseId = 'case-1';

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      title: 'Test Case',
      consultationReason: 'Pain',
      patient: {
        id: 'p-1',
        name: 'John Doe',
        birthDate: new Date(),
        therapistId: 'therapist-1',
      },
    });
    mockPrismaService.evaluation.findMany.mockResolvedValue([]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .post(`/ai/cases/${caseId}/analyze`)
      .expect(201);

    expect(response.body.primarySuggestion.title).toBe('Mock Treatment');
    expect(response.body.metadata.serviceStatus.llm).toBe(true);
  });

  it('/POST ai/cases/:caseId/analyze (Forbidden)', async () => {
    const caseId = 'case-2';

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      patient: {
        id: 'p-2',
        name: 'Jane Doe',
        therapistId: 'other-therapist',
      },
    });

    await request(app.getHttpServer())
      .post(`/ai/cases/${caseId}/analyze`)
      .expect(403);
  });

  it('/POST ai/cases/:caseId/analyze (Not Found)', async () => {
    const caseId = 'non-existent';

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post(`/ai/cases/${caseId}/analyze`)
      .expect(404);
  });

  it('/POST ai/cases/:caseId/analyze (With Vision and Voice Data)', async () => {
    const caseId = 'case-full';

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      title: 'Full Case',
      patient: {
        id: 'p-1',
        name: 'John Doe',
        birthDate: new Date(),
        therapistId: 'therapist-1',
      },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: new Date(),
        posturogram: { analysis: 'Scoliosis' },
        footprints: [],
        voiceNotes: [
          {
            id: 'vn-1',
            transcription: 'Voice note',
            durationSeconds: 10,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .post(`/ai/cases/${caseId}/analyze`)
      .expect(201);

    expect(response.body.metadata.serviceStatus.vision).toBe(true);
    expect(response.body.metadata.serviceStatus.voice).toBe(true);
  });
});
