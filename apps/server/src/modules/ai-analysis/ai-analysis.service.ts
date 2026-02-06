import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { AnonymizerService } from './services/anonymizer.service';
import { TranslatorService } from './services/translator.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DataAggregationService } from './services/data-aggregation.service';
import { GoogleGenAI } from '@google/genai';
import { withRetry } from '../transcription/utils/retry';
import {
  AnalysisResult,
  RagChunk,
  Citation,
} from './interfaces/analysis.interfaces';
import { CaseDataAggregate } from './interfaces/aggregation.interfaces';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly genAI: GoogleGenAI;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly anonymizerService: AnonymizerService,
    private readonly translatorService: TranslatorService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly dataAggregationService: DataAggregationService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY not set. AI Analysis will use mock responses.',
      );
    }
    this.genAI = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });
    this.model =
      this.configService.get<string>('AI_MODEL') || 'gemini-3-flash-preview';
    this.temperature = parseFloat(
      this.configService.get<string>('AI_TEMPERATURE') || '0.3',
    );
    this.maxTokens = parseInt(
      this.configService.get<string>('AI_MAX_TOKENS') || '4096',
      10,
    );
  }

  async analyzeCase(
    clinicalCaseId: string,
    therapistId: string,
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    const caseData: CaseDataAggregate =
      await this.dataAggregationService.aggregateCaseData(
        clinicalCaseId,
        therapistId,
      );

    const anonymized = this.anonymizerService.anonymize(caseData as any);

    const ragChunks = await this.executeMultiQueryRag(caseData);

    const warnings: string[] = [];
    if (ragChunks.length === 0) {
      warnings.push('No se encontró literatura médica relevante para el caso.');
    }

    const serviceStatus = {
      rag: ragChunks.length > 0,
      vision: caseData.visionFindings && caseData.visionFindings.length > 0,
      voice: caseData.voiceTranscripts && caseData.voiceTranscripts.length > 0,
      llm: true,
    };

    const systemPrompt = this.promptBuilderService.buildSystemPrompt();
    const userPrompt = this.promptBuilderService.buildUserPrompt(
      anonymized.text,
      ragChunks,
      caseData.visionFindings,
      caseData.voiceTranscripts,
    );

    const llmResponse = await this.callLlm(systemPrompt, userPrompt);

    const parsedResult = this.parseResponse(llmResponse);

    const translatedCitations = await this.translateCitationsInternal(
      parsedResult.citations,
    );

    const rehydratedResult = this.rehydrateResult(
      parsedResult,
      anonymized.mapping,
    );

    const processingTimeMs = Date.now() - startTime;

    return {
      ...rehydratedResult,
      citations: translatedCitations,
      metadata: {
        ...rehydratedResult.metadata,
        processingTimeMs,
        anonymizationApplied: true,
        translationsApplied: translatedCitations.filter((c) => c.quoteOriginal)
          .length,
        serviceStatus,
        warnings,
      },
    };
  }

  private async executeMultiQueryRag(caseData: any): Promise<RagChunk[]> {
    const diagnosisQuery =
      this.promptBuilderService.buildDiagnosisQuery(caseData);
    const treatmentQuery =
      this.promptBuilderService.buildTreatmentQuery(caseData);
    const contraindicationsQuery =
      this.promptBuilderService.buildContraindicationsQuery(
        caseData.pharmacologicalHistory,
      );

    this.logger.debug('Executing multi-query RAG strategy');

    try {
      const [diagnosisResults, treatmentResults, contraindicationResults] =
        await Promise.all([
          this.knowledgeBaseService.findSimilar(diagnosisQuery, 5),
          this.knowledgeBaseService.findSimilar(treatmentQuery, 5),
          this.knowledgeBaseService.findSimilar(contraindicationsQuery, 3),
        ]);

      const allResults = [
        ...diagnosisResults,
        ...treatmentResults,
        ...contraindicationResults,
      ];

      const deduplicated = this.deduplicateChunks(allResults);

      this.logger.debug(
        `RAG returned ${deduplicated.length} unique chunks from ${allResults.length} total`,
      );

      return deduplicated;
    } catch (error) {
      this.logger.error(`RAG query failed: ${error.message}`);
      return [];
    }
  }

  private deduplicateChunks(chunks: any[]): RagChunk[] {
    const seen = new Set<string>();
    const unique: RagChunk[] = [];

    for (const chunk of chunks) {
      const contentHash = chunk.content.slice(0, 100);
      if (!seen.has(contentHash)) {
        seen.add(contentHash);
        unique.push({
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          documentTitle: chunk.documentTitle,
          documentAuthor: chunk.documentAuthor,
          documentFilePath: chunk.documentFilePath,
          documentMetadata: chunk.documentMetadata,
          similarity: parseFloat(chunk.similarity) || 0,
        });
      }
    }

    return unique.sort((a, b) => b.similarity - a.similarity);
  }

  private async callLlm(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      return this.getMockResponse();
    }

    return await withRetry(
      async () => {
        const response = await this.genAI.models.generateContent({
          model: this.model,
          config: {
            temperature: this.temperature,
            maxOutputTokens: this.maxTokens,
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
            {
              role: 'model',
              parts: [
                {
                  text: 'Entendido. Analizaré los casos clínicos siguiendo el proceso Chain-of-Thought y responderé en el formato JSON especificado.',
                },
              ],
            },
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
        });

        return response.text || '';
      },
      { maxRetries: 3 },
      this.logger,
    );
  }

  private parseResponse(llmResponse: string): AnalysisResult {
    try {
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        primarySuggestion: parsed.primarySuggestion || {
          title: 'Sin recomendación',
          description: 'No se pudo generar una recomendación',
          confidence: 'LOW',
        },
        alternatives: parsed.alternatives || [],
        citations: parsed.citations || [],
        reasoning: parsed.reasoning || {
          step1_understanding: '',
          step2_literature: '',
          step3_synthesis: '',
        },
        metadata: {
          queryTokens: 0,
          responseTokens: 0,
          processingTimeMs: 0,
          anonymizationApplied: false,
          translationsApplied: 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${error.message}`);
      return this.getDefaultResult();
    }
  }

  private rehydrateResult(
    result: AnalysisResult,
    mapping: Record<string, string>,
  ): AnalysisResult {
    const rehydratedPrimary = {
      ...result.primarySuggestion,
      description: this.anonymizerService.rehydrate(
        result.primarySuggestion.description,
        mapping,
      ),
      reasoning: result.primarySuggestion.reasoning
        ? this.anonymizerService.rehydrate(
            result.primarySuggestion.reasoning,
            mapping,
          )
        : undefined,
    };

    const rehydratedAlternatives = result.alternatives.map((alt) => ({
      ...alt,
      description: this.anonymizerService.rehydrate(alt.description, mapping),
    }));

    const rehydratedReasoning = {
      step1_understanding: this.anonymizerService.rehydrate(
        result.reasoning.step1_understanding,
        mapping,
      ),
      step2_literature: this.anonymizerService.rehydrate(
        result.reasoning.step2_literature,
        mapping,
      ),
      step3_synthesis: this.anonymizerService.rehydrate(
        result.reasoning.step3_synthesis,
        mapping,
      ),
    };

    return {
      ...result,
      primarySuggestion: rehydratedPrimary,
      alternatives: rehydratedAlternatives,
      reasoning: rehydratedReasoning,
    };
  }

  private async translateCitationsInternal(
    citations: Citation[],
  ): Promise<Citation[]> {
    const results = await Promise.all(
      citations.map(async (citation) => {
        const language = this.translatorService.detectLanguage(citation.quote);

        if (language === 'es') {
          return citation;
        }

        const translated = await this.translatorService.translateToSpanish(
          citation.quote,
        );
        return {
          ...citation,
          quote: translated.translated,
          quoteOriginal: translated.original,
        };
      }),
    );

    return results;
  }

  private getDefaultResult(): AnalysisResult {
    return {
      primarySuggestion: {
        title: 'Análisis no disponible',
        description:
          'El servicio de análisis no está disponible en este momento. Por favor, intente más tarde.',
        confidence: 'LOW',
      },
      alternatives: [],
      citations: [],
      reasoning: {
        step1_understanding: 'No se pudo procesar el caso.',
        step2_literature: 'No se pudo consultar la literatura.',
        step3_synthesis: 'No se pudo generar una síntesis.',
      },
      metadata: {
        queryTokens: 0,
        responseTokens: 0,
        processingTimeMs: 0,
        anonymizationApplied: false,
        translationsApplied: 0,
        serviceStatus: {
          rag: false,
          vision: false,
          voice: false,
          llm: false,
        },
        warnings: ['Service unavailable'],
      },
    };
  }

  private getMockResponse(): string {
    return JSON.stringify({
      primarySuggestion: {
        title: 'Tratamiento conservador para fascitis plantar',
        description:
          'Se recomienda un tratamiento conservador que incluya estiramientos específicos del tendón de Aquiles y fascia plantar, terapia manual, y uso de plantillas ortopédicas personalizadas.',
        confidence: 'HIGH',
        reasoning:
          'Basado en la presentación clínica y la literatura consultada, el tratamiento conservador tiene alta tasa de éxito.',
      },
      alternatives: [
        {
          title: 'Terapia de ondas de choque',
          description:
            'En casos refractarios al tratamiento conservador, la terapia de ondas de choque extracorpóreas puede ser considerada.',
          confidence: 'MEDIUM',
        },
      ],
      citations: [
        {
          quote:
            'El estiramiento de la fascia plantar y el tendón de Aquiles es el pilar del tratamiento conservador.',
          documentTitle: 'Manual de Fisioterapia',
          author: 'Kapandji',
          pageNumber: 234,
          relevance: 0.95,
        },
      ],
      reasoning: {
        step1_understanding:
          '[PATIENT] presenta dolor plantar característico de fascitis plantar, con mayor intensidad en los primeros pasos de la mañana.',
        step2_literature:
          'La literatura indica que el 80% de los casos responden al tratamiento conservador en un período de 10-12 meses.',
        step3_synthesis:
          'Se recomienda iniciar con un programa de estiramientos y terapia manual, evaluando la respuesta a las 6 semanas.',
      },
    });
  }
}
