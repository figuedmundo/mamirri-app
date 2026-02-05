import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';
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
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAnalysisController],
      providers: [{ provide: AiAnalysisService, useValue: mockService }],
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
      );
    });
  });
});
