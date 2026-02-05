import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AnalyzeCaseDto } from './analyze-case.dto';
import { AnalysisResultDto } from './analysis-result.dto';

describe('AI Analysis DTOs', () => {
  describe('AnalyzeCaseDto', () => {
    it('should validate clinicalCaseId is required string', async () => {
      const dto = plainToInstance(AnalyzeCaseDto, {
        clinicalCaseId: 'clm1234567890',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when clinicalCaseId is missing', async () => {
      const dto = plainToInstance(AnalyzeCaseDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('clinicalCaseId');
    });

    it('should fail validation when clinicalCaseId is empty', async () => {
      const dto = plainToInstance(AnalyzeCaseDto, {
        clinicalCaseId: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('AnalysisResultDto structure', () => {
    it('should have correct structure for primary suggestion', () => {
      const result: AnalysisResultDto = {
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
        metadata: {
          queryTokens: 0,
          responseTokens: 0,
          processingTimeMs: 100,
          anonymizationApplied: true,
          translationsApplied: 0,
        },
      };

      expect(result.primarySuggestion).toBeDefined();
      expect(result.primarySuggestion.confidence).toBe('HIGH');
    });
  });
});
