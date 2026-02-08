import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { RagChunk } from './interfaces/analysis.interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { AnonymizerService } from './services/anonymizer.service';
import { TranslatorService } from './services/translator.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DataAggregationService } from './services/data-aggregation.service';

jest.mock('../transcription/utils/retry', () => ({
  withRetry: jest.fn().mockImplementation((fn) => fn()),
}));

describe('AiAnalysisService', () => {
  let service: AiAnalysisService;
  let prismaService: jest.Mocked<PrismaService>;
  let knowledgeBaseService: jest.Mocked<KnowledgeBaseService>;
  let dataAggregationService: jest.Mocked<DataAggregationService>;

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

  beforeEach(async () => {
    const mockPrisma = {
      clinicalCase: {
        findUnique: jest.fn(),
      },
    };

    const mockKnowledgeBase = {
      findSimilar: jest.fn().mockResolvedValue([
        {
          content: 'La fascitis plantar es una inflamación...',
          pageNumber: 42,
          documentTitle: 'Manual de Fisioterapia',
          documentAuthor: 'Kapandji',
          similarity: 0.95,
        },
      ]),
    };

    const mockConfig = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'GOOGLE_API_KEY') return null;
        if (key === 'AI_MODEL') return 'gemini-3-flash';
        return null;
      }),
    };

    const mockDataAggregation = {
      aggregateCaseData: jest
        .fn()
        .mockImplementation(
          (caseId: string, therapistId: string, forceVision: boolean) => {
            if (caseId === 'non-existent') {
              throw new NotFoundException(`Clinical case not found: ${caseId}`);
            }
            if (therapistId === 'different-therapist') {
              throw new ForbiddenException(
                'You do not have access to this clinical case',
              );
            }
            return Promise.resolve({
              ...mockAggregatedData,
              visionStats: {
                totalImages: 1,
                cacheHits: forceVision ? 0 : 1,
                apiCalls: forceVision ? 1 : 0,
                failures: 0,
                failedImageIds: [],
              },
            });
          },
        ),
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
    prismaService = module.get(PrismaService);
    knowledgeBaseService = module.get(KnowledgeBaseService);
    dataAggregationService = module.get(DataAggregationService);
  });

  describe('analyzeCase', () => {
    it('should throw NotFoundException for non-existent case', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        service.analyzeCase('non-existent', 'therapist-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        mockClinicalCase,
      );

      await expect(
        service.analyzeCase('case-123', 'different-therapist'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should execute multi-query RAG with 3 parallel queries', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        mockClinicalCase,
      );

      await service.analyzeCase('case-123', 'therapist-123');

      expect(knowledgeBaseService.findSimilar).toHaveBeenCalledTimes(3);
    });

    it('should return structured AnalysisResult', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        mockClinicalCase,
      );

      const result = await service.analyzeCase('case-123', 'therapist-123');

      expect(result).toHaveProperty('primarySuggestion');
      expect(result).toHaveProperty('alternatives');
      expect(result).toHaveProperty('citations');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('metadata');
    });

    it('should include confidence level in suggestions', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        mockClinicalCase,
      );

      const result = await service.analyzeCase('case-123', 'therapist-123');

      expect(['HIGH', 'MEDIUM', 'LOW']).toContain(
        result.primarySuggestion.confidence,
      );
    });

    it('should pass forceVision parameter to DataAggregationService', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        mockClinicalCase,
      );

      await service.analyzeCase('case-123', 'therapist-123', true);

      expect(dataAggregationService.aggregateCaseData).toHaveBeenCalledWith(
        'case-123',
        'therapist-123',
        true,
      );
    });

    it('should include visionAnalysis stats in metadata', async () => {
      (prismaService.clinicalCase.findUnique as jest.Mock).mockResolvedValue(
        mockClinicalCase,
      );

      const result = await service.analyzeCase('case-123', 'therapist-123');

      expect(result.metadata).toHaveProperty('visionAnalysis');
      expect(result.metadata.visionAnalysis?.totalImages).toBe(1);
    });
  });

  describe('rerankChunks', () => {
    it('should call Cohere API with correct parameters', async () => {
      // Mock cohereClient.rerank
      const mockRerank = jest.fn().mockResolvedValue({
        results: [
          { index: 1, relevanceScore: 0.95 },
          { index: 0, relevanceScore: 0.8 },
        ],
      });
      (service as any).cohereClient = { rerank: mockRerank };

      const chunks: RagChunk[] = [
        {
          content: 'First',
          similarity: 0.9,
          pageNumber: 1,
          documentTitle: 'Title 1',
          documentAuthor: 'Author 1',
          documentFilePath: 'path/1',
          documentMetadata: {},
        },
        {
          content: 'Second',
          similarity: 0.8,
          pageNumber: 2,
          documentTitle: 'Title 2',
          documentAuthor: 'Author 2',
          documentFilePath: 'path/2',
          documentMetadata: {},
        },
      ];

      const result = await (service as any).rerankChunks(
        'test query',
        chunks,
        2,
      );

      expect(mockRerank).toHaveBeenCalledWith({
        model: 'rerank-v4.0-pro',
        query: 'test query',
        documents: ['First', 'Second'],
        topN: 2,
      });

      // Verify reordering
      expect(result[0].content).toBe('Second'); // index 1 ranked first
      expect(result[0].relevanceScore).toBe(0.95);
    });

    it('should gracefully degrade when Cohere API fails', async () => {
      const mockRerank = jest.fn().mockRejectedValue(new Error('API Error'));
      (service as any).cohereClient = { rerank: mockRerank };

      const chunks: RagChunk[] = [
        {
          content: 'First',
          similarity: 0.9,
          pageNumber: 1,
          documentTitle: 'Title 1',
          documentAuthor: 'Author 1',
          documentFilePath: 'path/1',
          documentMetadata: {},
        },
        {
          content: 'Second',
          similarity: 0.8,
          pageNumber: 2,
          documentTitle: 'Title 2',
          documentAuthor: 'Author 2',
          documentFilePath: 'path/2',
          documentMetadata: {},
        },
      ];

      const result = await (service as any).rerankChunks(
        'test query',
        chunks,
        2,
      );

      // Should return original order (fallback)
      expect(result[0].content).toBe('First');
    });

    it('should skip reranking when COHERE_API_KEY is not set', async () => {
      (service as any).cohereClient = null;

      const chunks: RagChunk[] = [
        {
          content: 'Test',
          similarity: 0.9,
          pageNumber: 1,
          documentTitle: 'Title',
          documentAuthor: 'Author',
          documentFilePath: 'path',
          documentMetadata: {},
        },
      ];
      const result = await (service as any).rerankChunks('query', chunks, 1);

      expect(result).toEqual(chunks);
    });
  });
});
