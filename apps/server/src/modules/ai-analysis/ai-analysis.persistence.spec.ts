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
            clinicalCase: {
              findUnique: jest.fn(),
            },
            aiAnalysis: {
              create: jest.fn().mockResolvedValue({ id: 'persisted-id' }),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
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
            buildSystemPrompt: jest.fn().mockReturnValue('mock-system-prompt'),
            buildUserPrompt: jest.fn().mockReturnValue('mock-user-prompt'),
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
        result: expect.objectContaining({
          metadata: expect.objectContaining({
            rawModelResponse: expect.any(String),
            systemPrompt: 'mock-system-prompt',
            userPrompt: 'mock-user-prompt',
          }),
        }),
      }),
    });
    expect(result.metadata.analysisId).toBe('persisted-id');
    expect(
      (result.metadata as { rawModelResponse?: string }).rawModelResponse,
    ).toBeUndefined();
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

  it('2.3 should return latest analysis when found', async () => {
    ((prisma as any).clinicalCase.findUnique as jest.Mock).mockResolvedValue({
      id: 'case-123',
      patient: {
        therapistId: 'therapist-123',
        clinicId: 'clinic-123',
      },
    });

    ((prisma as any).aiAnalysis.findFirst as jest.Mock).mockResolvedValue({
      id: 'analysis-latest',
      result: {
        ...mockAnalysisResult,
        metadata: {
          ...mockAnalysisResult.metadata,
          rawModelResponse: '{"mock":true}',
          systemPrompt: 'stored-system-prompt',
          userPrompt: 'stored-user-prompt',
        },
      },
    });

    const result = await service.getLatestAnalysis('case-123', 'therapist-123');

    expect((prisma as any).aiAnalysis.findFirst).toHaveBeenCalled();
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected latest analysis to be present');
    }
    expect(result.metadata.analysisId).toBe('analysis-latest');
    expect(
      (result.metadata as { rawModelResponse?: string }).rawModelResponse,
    ).toBeUndefined();
    expect(
      (result.metadata as { systemPrompt?: string }).systemPrompt,
    ).toBeUndefined();
    expect(
      (result.metadata as { userPrompt?: string }).userPrompt,
    ).toBeUndefined();
  });

  it('2.4 should return null when latest analysis does not exist', async () => {
    ((prisma as any).clinicalCase.findUnique as jest.Mock).mockResolvedValue({
      id: 'case-404',
      patient: {
        therapistId: 'therapist-123',
        clinicId: 'clinic-123',
      },
    });
    ((prisma as any).aiAnalysis.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.getLatestAnalysis('case-404', 'therapist-123');

    expect(result).toBeNull();
  });

  it('2.5 should throw not found when clinical case does not exist', async () => {
    ((prisma as any).clinicalCase.findUnique as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(
      service.getLatestAnalysis('case-missing', 'therapist-123'),
    ).rejects.toThrow('Clinical case not found');
  });

  it('2.6 should throw forbidden when therapist cannot access clinical case', async () => {
    ((prisma as any).clinicalCase.findUnique as jest.Mock).mockResolvedValue({
      id: 'case-123',
      patient: {
        therapistId: 'other-therapist',
        clinicId: 'clinic-123',
      },
    });

    await expect(
      service.getLatestAnalysis('case-123', 'therapist-123'),
    ).rejects.toThrow('You do not have access to this clinical case');
  });

  it('should return raw model response for owned analysis', async () => {
    ((prisma as any).aiAnalysis.findUnique as jest.Mock).mockResolvedValue({
      id: 'analysis-raw-1',
      createdAt: new Date('2026-02-28T00:00:00.000Z'),
      result: {
        ...mockAnalysisResult,
        metadata: {
          ...mockAnalysisResult.metadata,
          rawModelResponse: '{"debug":true}',
          systemPrompt: 'You are a clinical assistant',
          userPrompt: 'Analyze this case: test@example.com',
        },
      },
      clinicalCase: {
        patient: {
          therapistId: 'therapist-123',
          clinicId: 'clinic-123',
        },
      },
    });

    const response = await service.getRawModelResponse(
      'analysis-raw-1',
      'therapist-123',
      'CLINIC_OWNER',
      'clinic-123',
    );

    expect(response.analysisId).toBe('analysis-raw-1');
    expect(response.rawModelResponse).toBe('{"debug":true}');
    expect(response.systemPrompt).toBe('You are a clinical assistant');
    expect(response.userPrompt).toContain('[REDACTED_EMAIL]');
    expect(response.isRedacted).toBe(true);
  });

  it('should return null raw response when not present', async () => {
    ((prisma as any).aiAnalysis.findUnique as jest.Mock).mockResolvedValue({
      id: 'analysis-raw-2',
      createdAt: new Date('2026-02-28T00:00:00.000Z'),
      result: {
        ...mockAnalysisResult,
        metadata: {
          ...mockAnalysisResult.metadata,
        },
      },
      clinicalCase: {
        patient: {
          therapistId: 'therapist-123',
          clinicId: 'clinic-123',
        },
      },
    });

    const response = await service.getRawModelResponse(
      'analysis-raw-2',
      'therapist-123',
      'CLINIC_OWNER',
      'clinic-123',
    );

    expect(response.rawModelResponse).toBeNull();
    expect(response.systemPrompt).toBeNull();
    expect(response.userPrompt).toBeNull();
    expect(response.isRedacted).toBe(true);
  });

  it('should throw forbidden for raw response when analysis belongs to another therapist', async () => {
    ((prisma as any).aiAnalysis.findUnique as jest.Mock).mockResolvedValue({
      id: 'analysis-raw-3',
      createdAt: new Date('2026-02-28T00:00:00.000Z'),
      result: {
        ...mockAnalysisResult,
      },
      clinicalCase: {
        patient: {
          therapistId: 'other-therapist',
          clinicId: null,
        },
      },
    });

    await expect(
      service.getRawModelResponse(
        'analysis-raw-3',
        'therapist-123',
        'CLINIC_OWNER',
      ),
    ).rejects.toThrow('You do not have access to this analysis');
  });

  it('should allow admin to access raw response across clinics', async () => {
    ((prisma as any).aiAnalysis.findUnique as jest.Mock).mockResolvedValue({
      id: 'analysis-raw-4',
      createdAt: new Date('2026-02-28T00:00:00.000Z'),
      result: {
        ...mockAnalysisResult,
        metadata: {
          ...mockAnalysisResult.metadata,
          rawModelResponse: '{"adminView":true}',
          systemPrompt: 'admin-system-prompt',
          userPrompt: 'admin-user-prompt',
        },
      },
      clinicalCase: {
        patient: {
          therapistId: 'another-therapist',
          clinicId: 'other-clinic',
        },
      },
    });

    const response = await service.getRawModelResponse(
      'analysis-raw-4',
      'admin-user',
      'ADMIN',
      null,
      true,
    );

    expect(response.rawModelResponse).toBe('{"adminView":true}');
    expect(response.systemPrompt).toBe('admin-system-prompt');
    expect(response.userPrompt).toBe('admin-user-prompt');
    expect(response.isRedacted).toBe(false);
  });

  it('should redact sensitive data by default in raw response', async () => {
    ((prisma as any).aiAnalysis.findUnique as jest.Mock).mockResolvedValue({
      id: 'analysis-raw-5',
      createdAt: new Date('2026-02-28T00:00:00.000Z'),
      result: {
        ...mockAnalysisResult,
        metadata: {
          ...mockAnalysisResult.metadata,
          rawModelResponse:
            'Contact test@example.com phone +356 9912 3456 token eyJabc.def.ghi',
          systemPrompt:
            'System prompt with email admin@clinic.com',
          userPrompt:
            'User prompt with phone +356 7777 8888',
        },
      },
      clinicalCase: {
        patient: {
          therapistId: 'therapist-123',
          clinicId: 'clinic-123',
        },
      },
    });

    const response = await service.getRawModelResponse(
      'analysis-raw-5',
      'owner-123',
      'CLINIC_OWNER',
      'clinic-123',
      false,
    );

    expect(response.rawModelResponse).toContain('[REDACTED_EMAIL]');
    expect(response.rawModelResponse).toContain('[REDACTED_PHONE]');
    expect(response.rawModelResponse).toContain('[REDACTED_TOKEN]');
    expect(response.systemPrompt).toContain('[REDACTED_EMAIL]');
    expect(response.userPrompt).toContain('[REDACTED_PHONE]');
  });

  it('should reject therapist role for raw response endpoint', async () => {
    await expect(
      service.getRawModelResponse(
        'analysis-raw-6',
        'therapist-123',
        'THERAPIST',
      ),
    ).rejects.toThrow(
      'Only clinic owners or admins can access raw AI responses',
    );
  });
});
