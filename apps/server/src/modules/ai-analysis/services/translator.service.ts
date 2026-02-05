import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranslatedResult } from '../interfaces/analysis.interfaces';
import { createHash } from 'crypto';

@Injectable()
export class TranslatorService {
  private readonly logger = new Logger(TranslatorService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly cache: Map<string, TranslatedResult> = new Map();

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY not set. Translation will use passthrough mode.',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'mock-key');
  }

  detectLanguage(text: string): 'en' | 'es' {
    const spanishPatterns = [
      /\b(el|la|los|las|un|una|unos|unas)\b/i,
      /\b(que|para|por|con|sin|sobre)\b/i,
      /\b(es|son|está|están|ser|estar)\b/i,
      /\b(del|al|como|pero|porque|cuando)\b/i,
      /[áéíóúñ¿¡]/i,
    ];

    const englishPatterns = [
      /\b(the|a|an|this|that|these|those)\b/i,
      /\b(is|are|was|were|be|been|being)\b/i,
      /\b(of|to|in|for|on|with|at|by)\b/i,
      /\b(and|or|but|if|then|because)\b/i,
    ];

    let spanishScore = 0;
    let englishScore = 0;

    for (const pattern of spanishPatterns) {
      if (pattern.test(text)) spanishScore++;
    }

    for (const pattern of englishPatterns) {
      if (pattern.test(text)) englishScore++;
    }

    return spanishScore >= englishScore ? 'es' : 'en';
  }

  async translateToSpanish(text: string): Promise<TranslatedResult> {
    const detectedLanguage = this.detectLanguage(text);

    if (detectedLanguage === 'es') {
      return {
        translated: text,
        original: text,
        language: 'es',
        wasCached: false,
      };
    }

    const cacheKey = this.hashText(text);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Translation cache hit');
      return { ...cached, wasCached: true };
    }

    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      return {
        translated: text,
        original: text,
        language: 'en',
        wasCached: false,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash',
      });

      const prompt = `Translate the following medical text from English to Spanish. 
Preserve medical terminology accuracy. Only return the translation, no explanations.

Text to translate:
${text}`;

      const result = await model.generateContent(prompt);
      const translated = result.response.text().trim();

      const translationResult: TranslatedResult = {
        translated,
        original: text,
        language: 'en',
        wasCached: false,
      };

      this.cache.set(cacheKey, translationResult);

      this.logger.debug('Translation completed and cached');
      return translationResult;
    } catch (error) {
      this.logger.error(`Translation failed: ${error.message}`);
      return {
        translated: text,
        original: text,
        language: 'en',
        wasCached: false,
      };
    }
  }

  async translateCitations(
    citations: Array<{ quote: string; [key: string]: unknown }>,
  ): Promise<
    Array<{ quote: string; quoteOriginal?: string; [key: string]: unknown }>
  > {
    const results = await Promise.all(
      citations.map(async (citation) => {
        const language = this.detectLanguage(citation.quote);

        if (language === 'es') {
          return citation;
        }

        const translated = await this.translateToSpanish(citation.quote);
        return {
          ...citation,
          quote: translated.translated,
          quoteOriginal: translated.original,
        };
      }),
    );

    return results;
  }

  private hashText(text: string): string {
    return createHash('md5').update(text).digest('hex');
  }
}
