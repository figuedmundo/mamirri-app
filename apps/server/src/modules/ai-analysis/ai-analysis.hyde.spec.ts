import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiAnalysisService } from './ai-analysis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { AnonymizerService } from './services/anonymizer.service';
import { TranslatorService } from './services/translator.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DataAggregationService } from './services/data-aggregation.service';
import { GoogleGenAI } from '@google/genai';

jest.mock('../transcription/utils/retry', () => ({
  withRetry: jest.fn().mockImplementation((fn) => fn()),
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

describe('AiAnalysisService - HyDE Flow', () => {
  let service: AiAnalysisService;
  let knowledgeBaseService: jest.Mocked<KnowledgeBaseService>;
  let mockGenAI: jest.Mocked<GoogleGenAI>;

  const mockClinicalCase = {
    id: 'case-123',
    title: 'Fascitis Plantar',
    consultationReason: 'Dolor en planta del pie',
    initialMedicalDiagnosis: 'Fascitis plantar bilateral',
    pharmacologicalHistory: 'Ibuprofeno 400mg',
    patient: {
      id: 'patient-123',
      name: 'María García',
      therapistId: 'therapist-123',
      birthDate: new Date('1980-05-15'),
      email: 'maria@example.com',
      phone: '+34612345678',
    },
    evaluations: [
      {
        diagnosis: { condition: 'Fascitis plantar' },
        painScale: { level: 7 },
      },
    ],
    treatmentPlan: null,
  };

  const mockAggregatedData = {
    ...mockClinicalCase,
    sessions: [],
    visionFindings: [],
    voiceTranscripts: [],
  };

  const mockMainAnalysisResponse = {
    text: JSON.stringify({
      primarySuggestion: {
        title: 'Test',
        description: 'Test description',
        confidence: 'HIGH',
      },
      alternatives: [],
      citations: [],
      reasoning: {
        step1_understanding: '',
        step2_literature: '',
        step3_synthesis: '',
      },
    }),
  };

  const mockHydeResponse = {
    text: 'Synthetic medical document content...',
  };

  beforeEach(async () => {
    const mockPrisma = {
      clinicalCase: {
        findUnique: jest.fn(),
      },
    };

    mockGenAI = {
      models: {
        generateContent: jest.fn(),
      },
    } as any;

    const mockKnowledgeBase = {
      findSimilar: jest.fn().mockResolvedValue([
        {
          content: 'Relevant medical content',
          pageNumber: 10,
          documentTitle: 'Test Doc',
          documentAuthor: 'Test Author',
          similarity: 0.95,
        },
      ]),
    };

    const mockConfig = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'GOOGLE_API_KEY') return 'test-api-key';
        if (key === 'COHERE_API_KEY') return null;
        if (key === 'AI_MODEL') return 'gemini-3-flash';
        if (key === 'ENABLE_HYDE') return 'false';
        return null;
      }),
    };

    const mockDataAggregation = {
      aggregateCaseData: jest.fn().mockResolvedValue(mockAggregatedData),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        AnonymizerService,
        TranslatorService,
        PromptBuilderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: KnowledgeBaseService, useValue: mockKnowledgeBase },
        { provide: ConfigService, useValue: mockConfig },
        { provide: DataAggregationService, useValue: mockDataAggregation },
      ],
    }).compile();

    service = module.get<AiAnalysisService>(AiAnalysisService);
    knowledgeBaseService = module.get(KnowledgeBaseService);
    (service as any).genAI = mockGenAI;
  });

  describe('HyDE flag configuration', () => {
    it('should disable HyDE when ENABLE_HYDE is not set or false', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiAnalysisService,
          AnonymizerService,
          TranslatorService,
          PromptBuilderService,
          {
            provide: PrismaService,
            useValue: {
              clinicalCase: {
                findUnique: jest.fn().mockResolvedValue(mockClinicalCase),
              },
            },
          },
          {
            provide: KnowledgeBaseService,
            useValue: { findSimilar: jest.fn().mockResolvedValue([]) },
          },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key) =>
                key === 'GOOGLE_API_KEY' ? 'test-key' : null,
              ),
            },
          },
          {
            provide: DataAggregationService,
            useValue: {
              aggregateCaseData: jest
                .fn()
                .mockResolvedValue(mockAggregatedData),
            },
          },
        ],
      }).compile();

      const testService = module.get<AiAnalysisService>(AiAnalysisService);
      expect((testService as any).enableHyde).toBe(false);
    });

    it('should enable HyDE when ENABLE_HYDE is set to true', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiAnalysisService,
          AnonymizerService,
          TranslatorService,
          PromptBuilderService,
          {
            provide: PrismaService,
            useValue: {
              clinicalCase: {
                findUnique: jest.fn().mockResolvedValue(mockClinicalCase),
              },
            },
          },
          {
            provide: KnowledgeBaseService,
            useValue: { findSimilar: jest.fn().mockResolvedValue([]) },
          },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key) => {
                if (key === 'GOOGLE_API_KEY') return 'test-key';
                if (key === 'ENABLE_HYDE') return 'true';
                return null;
              }),
            },
          },
          {
            provide: DataAggregationService,
            useValue: {
              aggregateCaseData: jest
                .fn()
                .mockResolvedValue(mockAggregatedData),
            },
          },
        ],
      }).compile();

      const testService = module.get<AiAnalysisService>(AiAnalysisService);
      expect((testService as any).enableHyde).toBe(true);
    });
  });

  describe('HyDE flow when ENABLE_HYDE is true', () => {
    beforeEach(async () => {
      const mockPrisma = {
        clinicalCase: {
          findUnique: jest.fn().mockResolvedValue(mockClinicalCase),
        },
      };

      const mockKnowledgeBase = {
        findSimilar: jest.fn().mockResolvedValue([
          {
            content: 'Relevant medical content',
            pageNumber: 10,
            documentTitle: 'Test Doc',
            documentAuthor: 'Test Author',
            similarity: 0.95,
          },
        ]),
      };

      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'GOOGLE_API_KEY') return 'test-api-key';
          if (key === 'COHERE_API_KEY') return null;
          if (key === 'AI_MODEL') return 'gemini-3-flash';
          if (key === 'ENABLE_HYDE') return 'true';
          return null;
        }),
      };

      const mockDataAggregation = {
        aggregateCaseData: jest.fn().mockResolvedValue(mockAggregatedData),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiAnalysisService,
          AnonymizerService,
          TranslatorService,
          PromptBuilderService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: KnowledgeBaseService, useValue: mockKnowledgeBase },
          { provide: ConfigService, useValue: mockConfig },
          { provide: DataAggregationService, useValue: mockDataAggregation },
        ],
      }).compile();

      service = module.get<AiAnalysisService>(AiAnalysisService);
      knowledgeBaseService = module.get(KnowledgeBaseService);
      (service as any).genAI = mockGenAI;
    });

    it('should call LLM to generate synthetic documents for diagnosis and treatment', async () => {
      (mockGenAI.models.generateContent as jest.Mock)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockMainAnalysisResponse);

      await service.analyzeCase('case-123', 'therapist-123');

      expect(mockGenAI.models.generateContent).toHaveBeenCalled();
    });

    it('should call LLM twice in parallel for diagnosis and treatment HyDE prompts', async () => {
      (mockGenAI.models.generateContent as jest.Mock)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockMainAnalysisResponse);

      await service.analyzeCase('case-123', 'therapist-123');

      expect(mockGenAI.models.generateContent).toHaveBeenCalledTimes(3);
    });

    it('should use synthetic documents as queries for findSimilar', async () => {
      const mockHydeDiagnosisDoc =
        'Synthetic diagnosis document about fascitis plantar...';
      const mockHydeTreatmentDoc =
        'Synthetic treatment document for fascitis plantar...';

      (mockGenAI.models.generateContent as jest.Mock)
        .mockResolvedValueOnce({ text: mockHydeDiagnosisDoc })
        .mockResolvedValueOnce({ text: mockHydeTreatmentDoc })
        .mockResolvedValueOnce(mockMainAnalysisResponse);

      await service.analyzeCase('case-123', 'therapist-123');

      expect(knowledgeBaseService.findSimilar).toHaveBeenCalledWith(
        expect.stringContaining('Synthetic diagnosis'),
        8,
      );
      expect(knowledgeBaseService.findSimilar).toHaveBeenCalledWith(
        expect.stringContaining('Synthetic treatment'),
        8,
      );
    });

    it('should always use original query for contraindications (no HyDE)', async () => {
      (mockGenAI.models.generateContent as jest.Mock)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockMainAnalysisResponse);

      await service.analyzeCase('case-123', 'therapist-123');

      const contraindicationCalls =
        knowledgeBaseService.findSimilar.mock.calls.filter((call: any[]) =>
          call[0].includes('contraindicaciones'),
        );

      expect(contraindicationCalls.length).toBeGreaterThan(0);
      expect(contraindicationCalls[0][0]).toContain('contraindicaciones');
      expect(contraindicationCalls[0][0]).toContain('Ibuprofeno');
      expect(contraindicationCalls[0][0]).not.toContain('Synthetic');
    });
  });

  describe('HyDE fallback when ENABLE_HYDE is false or fails', () => {
    beforeEach(async () => {
      const mockPrisma = {
        clinicalCase: {
          findUnique: jest.fn().mockResolvedValue(mockClinicalCase),
        },
      };

      const mockKnowledgeBase = {
        findSimilar: jest.fn().mockResolvedValue([
          {
            content: 'Relevant medical content',
            pageNumber: 10,
            documentTitle: 'Test Doc',
            documentAuthor: 'Test Author',
            similarity: 0.95,
          },
        ]),
      };

      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'GOOGLE_API_KEY') return 'test-api-key';
          if (key === 'COHERE_API_KEY') return null;
          if (key === 'AI_MODEL') return 'gemini-3-flash';
          if (key === 'ENABLE_HYDE') return 'false';
          return null;
        }),
      };

      const mockDataAggregation = {
        aggregateCaseData: jest.fn().mockResolvedValue(mockAggregatedData),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiAnalysisService,
          AnonymizerService,
          TranslatorService,
          PromptBuilderService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: KnowledgeBaseService, useValue: mockKnowledgeBase },
          { provide: ConfigService, useValue: mockConfig },
          { provide: DataAggregationService, useValue: mockDataAggregation },
        ],
      }).compile();

      service = module.get<AiAnalysisService>(AiAnalysisService);
      knowledgeBaseService = module.get(KnowledgeBaseService);
      (service as any).genAI = mockGenAI;
    });

    it('should not call LLM for HyDE generation when HyDE is disabled', async () => {
      (mockGenAI.models.generateContent as jest.Mock).mockResolvedValueOnce(
        mockMainAnalysisResponse,
      );

      await service.analyzeCase('case-123', 'therapist-123');

      expect(mockGenAI.models.generateContent).toHaveBeenCalledTimes(1);
    });

    it('should use original queries when HyDE is disabled', async () => {
      (mockGenAI.models.generateContent as jest.Mock).mockResolvedValueOnce(
        mockMainAnalysisResponse,
      );

      await service.analyzeCase('case-123', 'therapist-123');

      expect(knowledgeBaseService.findSimilar).toHaveBeenCalledWith(
        expect.stringContaining('Dolor'),
        8,
      );
    });
  });

  describe('HyDE error handling', () => {
    beforeEach(async () => {
      const mockPrisma = {
        clinicalCase: {
          findUnique: jest.fn().mockResolvedValue(mockClinicalCase),
        },
      };

      const mockKnowledgeBase = {
        findSimilar: jest.fn().mockResolvedValue([
          {
            content: 'Relevant medical content',
            pageNumber: 10,
            documentTitle: 'Test Doc',
            documentAuthor: 'Test Author',
            similarity: 0.95,
          },
        ]),
      };

      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'GOOGLE_API_KEY') return 'test-api-key';
          if (key === 'COHERE_API_KEY') return null;
          if (key === 'AI_MODEL') return 'gemini-3-flash';
          if (key === 'ENABLE_HYDE') return 'true';
          return null;
        }),
      };

      const mockDataAggregation = {
        aggregateCaseData: jest.fn().mockResolvedValue(mockAggregatedData),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiAnalysisService,
          AnonymizerService,
          TranslatorService,
          PromptBuilderService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: KnowledgeBaseService, useValue: mockKnowledgeBase },
          { provide: ConfigService, useValue: mockConfig },
          { provide: DataAggregationService, useValue: mockDataAggregation },
        ],
      }).compile();

      service = module.get<AiAnalysisService>(AiAnalysisService);
      knowledgeBaseService = module.get(KnowledgeBaseService);
      (service as any).genAI = mockGenAI;
    });

    it('should fall back to original queries when HyDE generation fails', async () => {
      (mockGenAI.models.generateContent as jest.Mock)
        .mockRejectedValueOnce(new Error('LLM API failed'))
        .mockRejectedValueOnce(new Error('LLM API failed'))
        .mockResolvedValueOnce(mockMainAnalysisResponse);

      await service.analyzeCase('case-123', 'therapist-123');

      expect(knowledgeBaseService.findSimilar).toHaveBeenCalledWith(
        expect.stringContaining('Dolor'),
        8,
      );
    });
  });

  describe('parallel execution of HyDE queries', () => {
    beforeEach(async () => {
      const mockPrisma = {
        clinicalCase: {
          findUnique: jest.fn().mockResolvedValue(mockClinicalCase),
        },
      };

      const mockKnowledgeBase = {
        findSimilar: jest.fn().mockResolvedValue([
          {
            content: 'Relevant medical content',
            pageNumber: 10,
            documentTitle: 'Test Doc',
            documentAuthor: 'Test Author',
            similarity: 0.95,
          },
        ]),
      };

      const mockConfig = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'GOOGLE_API_KEY') return 'test-api-key';
          if (key === 'COHERE_API_KEY') return null;
          if (key === 'AI_MODEL') return 'gemini-3-flash';
          if (key === 'ENABLE_HYDE') return 'true';
          return null;
        }),
      };

      const mockDataAggregation = {
        aggregateCaseData: jest.fn().mockResolvedValue(mockAggregatedData),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiAnalysisService,
          AnonymizerService,
          TranslatorService,
          PromptBuilderService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: KnowledgeBaseService, useValue: mockKnowledgeBase },
          { provide: ConfigService, useValue: mockConfig },
          { provide: DataAggregationService, useValue: mockDataAggregation },
        ],
      }).compile();

      service = module.get<AiAnalysisService>(AiAnalysisService);
      knowledgeBaseService = module.get(KnowledgeBaseService);
      (service as any).genAI = mockGenAI;
    });

    it('should execute diagnosis, treatment, and contraindication queries in parallel', async () => {
      (mockGenAI.models.generateContent as jest.Mock)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockHydeResponse)
        .mockResolvedValueOnce(mockMainAnalysisResponse);

      await service.analyzeCase('case-123', 'therapist-123');

      expect(knowledgeBaseService.findSimilar).toHaveBeenCalledTimes(3);
    });
  });
});
