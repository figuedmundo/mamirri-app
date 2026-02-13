import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisService } from './ai-analysis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { AnonymizerService } from './services/anonymizer.service';
import { TranslatorService } from './services/translator.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DataAggregationService } from './services/data-aggregation.service';
import { ConfigService } from '@nestjs/config';
import { VisionService } from './services/vision.service';

describe('AiAnalysis Persistence', () => {
  let service: AiAnalysisService;
  let prisma: PrismaService;

  const mockAnalysisResult = {
    primarySuggestion: {
      title: 'Primary',
      description: 'Desc',
      confidence: 'HIGH',
    },
    alternatives: [],
    citations: [],
    reasoning: {
      step1_understanding: 's1',
      step2_literature: 's2',
      step3_synthesis: 's3',
    },
    metadata: {
      queryTokens: 0,
      responseTokens: 0,
      processingTimeMs: 10,
      anonymizationApplied: true,
      translationsApplied: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        {
          provide: PrismaService,
          useValue: {
            aiAnalysis: {
              create: jest.fn().mockResolvedValue({ id: 'persisted-id' }),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock-key') },
        },
        { provide: KnowledgeBaseService, useValue: {} },
        {
          provide: AnonymizerService,
          useValue: {
            anonymize: jest.fn().mockReturnValue({ text: 'anon', mapping: {} }),
            rehydrate: jest.fn().mockImplementation((t) => t),
          },
        },
        {
          provide: TranslatorService,
          useValue: {
            translateToEnglish: jest.fn(),
            translateToSpanish: jest.fn(),
            detectLanguage: jest.fn().mockReturnValue('es'),
          },
        },
        {
          provide: PromptBuilderService,
          useValue: {
            buildSystemPrompt: jest.fn(),
            buildUserPrompt: jest.fn(),
            buildDiagnosisQuery: jest.fn(),
            buildTreatmentQuery: jest.fn(),
            buildContraindicationsQuery: jest.fn(),
          },
        },
        {
          provide: DataAggregationService,
          useValue: {
            aggregateCaseData: jest
              .fn()
              .mockResolvedValue({ visionFindings: [], voiceTranscripts: [] }),
          },
        },
        { provide: VisionService, useValue: {} },
      ],
    }).compile();

    service = module.get<AiAnalysisService>(AiAnalysisService);
    prisma = module.get<PrismaService>(PrismaService);

    (service as any).executeMultiQueryRag = jest.fn().mockResolvedValue([]);
    (service as any).callLlm = jest
      .fn()
      .mockResolvedValue(JSON.stringify(mockAnalysisResult));
    (service as any).translateCitationsInternal = jest
      .fn()
      .mockResolvedValue([]);
  });

  it('2.1 should persist analysis result and return analysisId', async () => {
    const clinicalCaseId = 'case-123';
    const therapistId = 'therapist-123';

    const result = await service.analyzeCase(clinicalCaseId, therapistId);

    expect((prisma as any).aiAnalysis.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicalCaseId,
        therapistId,
        result: expect.any(Object),
      }),
    });
    expect(result.metadata.analysisId).toBe('persisted-id');
  });

  it('2.2 should not fail analysis if persistence fails', async () => {
    ((prisma as any).aiAnalysis.create as jest.Mock).mockRejectedValue(
      new Error('DB Error'),
    );
    const clinicalCaseId = 'case-123';
    const therapistId = 'therapist-123';

    const result = await service.analyzeCase(clinicalCaseId, therapistId);

    expect(result).toBeDefined();
    expect(result.metadata.analysisId).toBeUndefined();
  });
});
