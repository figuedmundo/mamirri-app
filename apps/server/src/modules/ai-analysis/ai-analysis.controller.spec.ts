import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';
import { VisionService } from './services/vision.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AiAnalysisController', () => {
  let controller: AiAnalysisController;
  let service: jest.Mocked<AiAnalysisService>;

  const mockAnalysisResult = {
    primarySuggestion: {
      title: 'Tratamiento conservador',
      description: 'Se recomienda tratamiento conservador',
      confidence: 'HIGH' as const,
      reasoning: 'Basado en la evidencia...',
    },
    alternatives: [],
    citations: [
      {
        quote: 'La fascitis plantar...',
        documentTitle: 'Manual de Fisioterapia',
        author: 'Kapandji',
        relevance: 0.95,
      },
    ],
    reasoning: {
      step1_understanding: 'El paciente presenta...',
      step2_literature: 'La literatura indica...',
      step3_synthesis: 'Se recomienda...',
    },
    metadata: {
      queryTokens: 100,
      responseTokens: 500,
      processingTimeMs: 2500,
      anonymizationApplied: true,
      translationsApplied: 1,
    },
  };

  beforeEach(async () => {
    const mockService = {
      analyzeCase: jest.fn(),
      getLatestAnalysis: jest.fn(),
      getRawModelResponse: jest.fn(),
    };

    const mockVisionService = {
      analyzeImageById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAnalysisController],
      providers: [
        { provide: AiAnalysisService, useValue: mockService },
        { provide: VisionService, useValue: mockVisionService },
      ],
    }).compile();

    controller = module.get<AiAnalysisController>(AiAnalysisController);
    service = module.get(AiAnalysisService);
  });

  describe('POST /ai/analyze', () => {
    it('should return analysis result for valid request', async () => {
      service.analyzeCase.mockResolvedValue(mockAnalysisResult);

      const result = await controller.analyzeCase(
        { clinicalCaseId: 'case-123' },
        { userId: 'therapist-123' },
      );

      expect(result).toEqual(mockAnalysisResult);
      expect(service.analyzeCase).toHaveBeenCalledWith(
        'case-123',
        'therapist-123',
        false,
        undefined,
      );
    });

    it('should throw 404 for non-existent clinical case', async () => {
      service.analyzeCase.mockRejectedValue(
        new NotFoundException('Clinical case not found'),
      );

      await expect(
        controller.analyzeCase(
          { clinicalCaseId: 'non-existent' },
          { userId: 'therapist-123' },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw 403 for unauthorized access', async () => {
      service.analyzeCase.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.analyzeCase(
          { clinicalCaseId: 'case-123' },
          { userId: 'wrong-therapist' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass therapist ID from CurrentTherapist decorator', async () => {
      service.analyzeCase.mockResolvedValue(mockAnalysisResult);

      await controller.analyzeCase(
        { clinicalCaseId: 'case-123' },
        { userId: 'my-therapist-id' },
      );

      expect(service.analyzeCase).toHaveBeenCalledWith(
        'case-123',
        'my-therapist-id',
        false,
        undefined,
      );
    });
  });

  describe('POST /ai/cases/:caseId/analyze', () => {
    it('should return analysis result for valid request', async () => {
      service.analyzeCase.mockResolvedValue(mockAnalysisResult);

      const result = await controller.analyzeCaseMultiModal(
        'case-123',
        { userId: 'therapist-123' },
        'false',
      );

      expect(result).toEqual(mockAnalysisResult);
      expect(service.analyzeCase).toHaveBeenCalledWith(
        'case-123',
        'therapist-123',
        false,
        undefined,
      );
    });

    it('should pass forceVision=true when query parameter is "true"', async () => {
      service.analyzeCase.mockResolvedValue(mockAnalysisResult);

      await controller.analyzeCaseMultiModal(
        'case-123',
        { userId: 'therapist-123' },
        'true',
      );

      expect(service.analyzeCase).toHaveBeenCalledWith(
        'case-123',
        'therapist-123',
        true,
        undefined,
      );
    });

    it('should throw 404 for non-existent clinical case', async () => {
      service.analyzeCase.mockRejectedValue(
        new NotFoundException('Clinical case not found'),
      );

      await expect(
        controller.analyzeCaseMultiModal('non-existent', {
          userId: 'therapist-123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw 403 for unauthorized access', async () => {
      service.analyzeCase.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.analyzeCaseMultiModal('case-123', {
          userId: 'wrong-therapist',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass therapist ID from CurrentTherapist decorator', async () => {
      service.analyzeCase.mockResolvedValue(mockAnalysisResult);

      await controller.analyzeCaseMultiModal('case-123', {
        userId: 'my-therapist-id',
      });

      expect(service.analyzeCase).toHaveBeenCalledWith(
        'case-123',
        'my-therapist-id',
        false,
        undefined,
      );
    });
  });

  describe('GET /ai/cases/:caseId/analyses/latest', () => {
    it('should return latest analysis for valid request', async () => {
      service.getLatestAnalysis.mockResolvedValue(mockAnalysisResult as any);

      const result = await controller.getLatestAnalysis('case-123', {
        userId: 'therapist-123',
      });

      expect(result).toEqual(mockAnalysisResult);
      expect(service.getLatestAnalysis).toHaveBeenCalledWith(
        'case-123',
        'therapist-123',
        undefined,
      );
    });

    it('should return null when no analysis exists yet', async () => {
      service.getLatestAnalysis.mockResolvedValue(null);

      const result = await controller.getLatestAnalysis('case-404', {
        userId: 'therapist-123',
      });

      expect(result).toBeNull();
    });

    it('should throw 403 for unauthorized access', async () => {
      service.getLatestAnalysis.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.getLatestAnalysis('case-123', { userId: 'wrong-therapist' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /ai/analyses/:analysisId/raw-response', () => {
    it('should return raw model response for valid request', async () => {
      service.getRawModelResponse.mockResolvedValue({
        analysisId: 'analysis-123',
        rawModelResponse: '{"primarySuggestion":{"title":"Test"}}',
        systemPrompt: 'You are a clinical assistant',
        userPrompt: 'Analyze case data...',
        createdAt: new Date('2026-02-28T00:00:00.000Z'),
        isRedacted: true,
      });

      const result = await controller.getRawModelResponse(
        'analysis-123',
        {
          userId: 'therapist-123',
          role: 'CLINIC_OWNER',
        },
        'false',
      );

      expect(result.analysisId).toBe('analysis-123');
      expect(result.rawModelResponse).toContain('primarySuggestion');
      expect(result.systemPrompt).toBe('You are a clinical assistant');
      expect(result.userPrompt).toBe('Analyze case data...');
      expect(result.isRedacted).toBe(true);
      expect(service.getRawModelResponse).toHaveBeenCalledWith(
        'analysis-123',
        'therapist-123',
        'CLINIC_OWNER',
        undefined,
        false,
      );
    });

    it('should pass includeSensitive=true when requested', async () => {
      service.getRawModelResponse.mockResolvedValue({
        analysisId: 'analysis-123',
        rawModelResponse: '{"private":true}',
        systemPrompt: 'system prompt',
        userPrompt: 'user prompt',
        createdAt: new Date('2026-02-28T00:00:00.000Z'),
        isRedacted: false,
      });

      await controller.getRawModelResponse(
        'analysis-123',
        {
          userId: 'therapist-123',
          role: 'ADMIN',
        },
        'true',
      );

      expect(service.getRawModelResponse).toHaveBeenCalledWith(
        'analysis-123',
        'therapist-123',
        'ADMIN',
        undefined,
        true,
      );
    });

    it('should throw 404 when analysis does not exist', async () => {
      service.getRawModelResponse.mockRejectedValue(
        new NotFoundException('Analysis not found'),
      );

      await expect(
        controller.getRawModelResponse(
          'analysis-404',
          {
            userId: 'therapist-123',
            role: 'CLINIC_OWNER',
          },
          'false',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw 403 when therapist does not own analysis', async () => {
      service.getRawModelResponse.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      await expect(
        controller.getRawModelResponse(
          'analysis-123',
          {
            userId: 'wrong-therapist',
            role: 'THERAPIST',
          },
          'false',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
