import { ConfigService } from '@nestjs/config';
import { TranslatorService } from './translator.service';

describe('TranslatorService', () => {
  let service: TranslatorService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue(null),
    } as unknown as jest.Mocked<ConfigService>;

    service = new TranslatorService(mockConfigService);
  });

  describe('detectLanguage', () => {
    it('should detect English text', () => {
      const text =
        'The plantar fascia is a thick band of tissue that runs across the bottom of the foot.';

      const result = service.detectLanguage(text);

      expect(result).toBe('en');
    });

    it('should detect Spanish text', () => {
      const text =
        'La fascitis plantar es una inflamación del tejido grueso en la planta del pie.';

      const result = service.detectLanguage(text);

      expect(result).toBe('es');
    });
  });

  describe('translateToSpanish', () => {
    it('should skip translation if already Spanish', async () => {
      const text = 'El paciente presenta dolor en el pie derecho.';

      const result = await service.translateToSpanish(text);

      expect(result.translated).toBe(text);
      expect(result.language).toBe('es');
      expect(result.wasCached).toBe(false);
    });

    it('should preserve original quote in quoteOriginal', async () => {
      const text = 'The patient presents with foot pain.';

      const result = await service.translateToSpanish(text);

      expect(result.original).toBe(text);
    });
  });

  describe('caching', () => {
    it('should return same result for repeated Spanish text', async () => {
      const text = 'El paciente presenta dolor plantar.';

      const result1 = await service.translateToSpanish(text);
      const result2 = await service.translateToSpanish(text);

      expect(result1.translated).toBe(result2.translated);
      expect(result1.language).toBe('es');
    });
  });
});
