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
import { CohereClientV2 } from 'cohere-ai';
import { withRetry } from '../transcription/utils/retry';
import {
  AnalysisResult,
  ConfidenceJustification,
  RagChunk,
  Citation,
  DifferentialDiagnosisItem,
  FollowUpQuestion,
  RedFlag,
  Suggestion,
} from './interfaces/analysis.interfaces';
import { CaseDataAggregate } from './interfaces/aggregation.interfaces';
import { ROLES, type Role } from '../../common/constants/roles';

type StoredAnalysisResult = AnalysisResult & {
  metadata?: AnalysisResult['metadata'] & { rawModelResponse?: string };
};

type OwnedAnalysisRecord = {
  id: string;
  createdAt: Date;
  result: unknown;
  clinicalCase: {
    patient: {
      therapistId: string;
      clinicId: string | null;
    };
  };
};

type OwnedClinicalCaseRecord = {
  id: string;
  patient: {
    therapistId: string;
    clinicId: string | null;
  };
};

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly genAI: GoogleGenAI;
  private readonly cohereClient: CohereClientV2 | null;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly enableHyde: boolean;

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

    // Initialize Cohere client
    const cohereApiKey = this.configService.get<string>('COHERE_API_KEY');
    if (cohereApiKey) {
      this.cohereClient = new CohereClientV2({ token: cohereApiKey });
    } else {
      this.logger.warn('COHERE_API_KEY not set. Reranking will be skipped.');
      this.cohereClient = null;
    }

    this.model =
      this.configService.get<string>('AI_MODEL') || 'gemini-3-flash-preview';
    this.temperature = parseFloat(
      this.configService.get<string>('AI_TEMPERATURE') || '0.3',
    );
    this.maxTokens = parseInt(
      this.configService.get<string>('AI_MAX_TOKENS') || '4096',
      10,
    );

    this.enableHyde = this.configService.get<string>('ENABLE_HYDE') === 'true';

    if (this.enableHyde) {
      this.logger.log('HyDE (Hypothetical Document Embeddings) enabled');
    } else {
      this.logger.log('HyDE disabled. Using standard RAG queries.');
    }
  }

  async analyzeCase(
    clinicalCaseId: string,
    therapistId: string,
    forceVision = false,
    clinicId?: string | null,
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    const caseData: CaseDataAggregate =
      await this.dataAggregationService.aggregateCaseData(
        clinicalCaseId,
        therapistId,
        forceVision,
        clinicId,
      );

    const anonymized = this.anonymizerService.anonymize(caseData as any);

    const ragChunks = await this.executeMultiQueryRag(caseData);

    const warnings: string[] = [];
    if (ragChunks.length === 0) {
      warnings.push('No se encontró literatura médica relevante para el caso.');
    }

    const serviceStatus = {
      rag: ragChunks.length > 0,
      vision:
        caseData.visionFindings &&
        caseData.visionFindings.filter((f) => f.source === 'FOOTPRINT').length >
          0,
      voice: caseData.voiceTranscripts && caseData.voiceTranscripts.length > 0,
      llm: true,
    };

    const systemPrompt = this.promptBuilderService.buildSystemPrompt();
    const userPrompt = this.promptBuilderService.buildUserPrompt(
      anonymized.text,
      ragChunks,
      caseData.visionFindings,
      caseData.voiceTranscripts,
      caseData.soapDecomposition,
    );

    const llmResponse = await this.callLlm(systemPrompt, userPrompt);

    this.logger.debug(
      `Raw LLM response received (${llmResponse.length} chars): ${llmResponse.slice(0, 600)}`,
    );

    const parsedResult = this.parseResponse(llmResponse);

    const translatedCitations = await this.translateCitationsInternal(
      parsedResult.citations,
    );

    const rehydratedResult = this.rehydrateResult(
      parsedResult,
      anonymized.mapping,
    );

    const processingTimeMs = Date.now() - startTime;

    const resultWithoutId: AnalysisResult = {
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
        visionAnalysis: caseData.visionStats,
      },
    };

    let analysisId: string | undefined;
    try {
      const resultForPersistence = {
        ...resultWithoutId,
        metadata: {
          ...resultWithoutId.metadata,
          rawModelResponse: llmResponse,
        },
      };

      const persisted = await (this.prisma as any).aiAnalysis.create({
        data: {
          clinicalCaseId,
          therapistId,
          clinicId: clinicId ?? null,
          result: resultForPersistence as any,
        },
      });
      analysisId = persisted.id;
    } catch (error) {
      this.logger.error(`Failed to persist AI analysis: ${error.message}`);
    }

    return {
      ...resultWithoutId,
      metadata: {
        ...resultWithoutId.metadata,
        analysisId,
      },
    };
  }

  async getLatestAnalysis(
    clinicalCaseId: string,
    therapistId: string,
    clinicId?: string | null,
  ): Promise<AnalysisResult | null> {
    const clinicalCase = (await (this.prisma as any).clinicalCase.findUnique({
      where: { id: clinicalCaseId },
      include: {
        patient: true,
      },
    })) as OwnedClinicalCaseRecord | null;

    if (!clinicalCase) {
      throw new NotFoundException('Clinical case not found');
    }

    if (clinicalCase.patient.therapistId !== therapistId) {
      throw new ForbiddenException(
        'You do not have access to this clinical case',
      );
    }

    if (clinicId && clinicalCase.patient.clinicId !== clinicId) {
      throw new ForbiddenException(
        'You do not have access to this clinical case',
      );
    }

    const latest = (await (this.prisma as any).aiAnalysis.findFirst({
      where: {
        clinicalCaseId,
      },
      orderBy: { createdAt: 'desc' },
    })) as OwnedAnalysisRecord | null;

    if (!latest) {
      return null;
    }

    const result = latest.result as StoredAnalysisResult;

    const sanitizedMetadata = {
      ...(result.metadata || {}),
    } as AnalysisResult['metadata'] & {
      rawModelResponse?: string;
    };
    delete sanitizedMetadata.rawModelResponse;

    return {
      ...result,
      metadata: {
        ...sanitizedMetadata,
        analysisId: result.metadata?.analysisId ?? latest.id,
      },
    };
  }

  async getRawModelResponse(
    analysisId: string,
    therapistId: string,
    userRole: Role,
    clinicId?: string | null,
    includeSensitive = false,
  ): Promise<{
    analysisId: string;
    rawModelResponse: string | null;
    createdAt: Date;
    isRedacted: boolean;
  }> {
    if (userRole !== ROLES.ADMIN && userRole !== ROLES.CLINIC_OWNER) {
      throw new ForbiddenException(
        'Only clinic owners or admins can access raw AI responses',
      );
    }

    const analysis = await this.getOwnedAnalysisRecord(
      analysisId,
      therapistId,
      clinicId,
      {
        notFoundMessage: 'Analysis not found',
        forbiddenMessage: 'You do not have access to this analysis',
      },
      {
        allowClinicOwner: userRole === ROLES.CLINIC_OWNER,
        allowAdmin: userRole === ROLES.ADMIN,
      },
    );

    const result = analysis.result as StoredAnalysisResult;
    const rawModelResponse =
      typeof result.metadata?.rawModelResponse === 'string'
        ? result.metadata.rawModelResponse
        : null;
    const responseText =
      rawModelResponse && !includeSensitive
        ? this.redactRawModelResponse(rawModelResponse)
        : rawModelResponse;

    this.logRawResponseAccess({
      analysisId,
      accessorUserId: therapistId,
      role: userRole,
      includeSensitive,
      hasPayload: responseText !== null,
      payloadLength: responseText?.length ?? 0,
    });

    return {
      analysisId: analysis.id,
      rawModelResponse: responseText,
      createdAt: analysis.createdAt,
      isRedacted: !includeSensitive,
    };
  }

  async submitFeedback(
    analysisId: string,
    suggestionIndex: number,
    isPositive: boolean,
    comment: string | undefined,
    therapistId: string,
    clinicId?: string | null,
  ) {
    await this.verifyAnalysisOwnership(analysisId, therapistId, clinicId);

    return await (this.prisma as any).aiFeedback.upsert({
      where: {
        aiAnalysisId_suggestionIndex: {
          aiAnalysisId: analysisId,
          suggestionIndex,
        },
      },
      update: {
        isPositive,
        comment,
      },
      create: {
        aiAnalysisId: analysisId,
        suggestionIndex,
        isPositive,
        comment,
        clinicId: clinicId ?? null,
      },
    });
  }

  async deleteFeedback(
    analysisId: string,
    suggestionIndex: number,
    therapistId: string,
    clinicId?: string | null,
  ) {
    await this.verifyAnalysisOwnership(analysisId, therapistId, clinicId);

    try {
      await (this.prisma as any).aiFeedback.delete({
        where: {
          aiAnalysisId_suggestionIndex: {
            aiAnalysisId: analysisId,
            suggestionIndex,
          },
        },
      });
    } catch {
      // ignore
    }
  }

  async getFeedbacks(
    analysisId: string,
    therapistId: string,
    clinicId?: string | null,
  ) {
    await this.verifyAnalysisOwnership(analysisId, therapistId, clinicId);

    return await (this.prisma as any).aiFeedback.findMany({
      where: {
        aiAnalysisId: analysisId,
        ...(clinicId ? { clinicId } : {}),
      },
    });
  }

  private async verifyAnalysisOwnership(
    analysisId: string,
    therapistId: string,
    clinicId?: string | null,
  ) {
    await this.getOwnedAnalysisRecord(analysisId, therapistId, clinicId, {
      notFoundMessage: 'Analysis not found',
      forbiddenMessage: 'You do not have access to this analysis',
    });
  }

  private async getOwnedAnalysisRecord(
    analysisId: string,
    therapistId: string,
    clinicId: string | null | undefined,
    messages: { notFoundMessage: string; forbiddenMessage: string },
    permissions: { allowClinicOwner?: boolean; allowAdmin?: boolean } = {},
  ): Promise<OwnedAnalysisRecord> {
    const analysis = (await (this.prisma as any).aiAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        clinicalCase: {
          include: {
            patient: true,
          },
        },
      },
    })) as OwnedAnalysisRecord | null;

    this.assertAnalysisAccess(
      analysis,
      therapistId,
      clinicId,
      messages,
      permissions,
    );

    return analysis;
  }

  private assertAnalysisAccess(
    analysis: OwnedAnalysisRecord | null,
    therapistId: string,
    clinicId: string | null | undefined,
    messages: { notFoundMessage: string; forbiddenMessage: string },
    permissions: { allowClinicOwner?: boolean; allowAdmin?: boolean } = {},
  ): asserts analysis is OwnedAnalysisRecord {
    if (!analysis) {
      throw new NotFoundException(messages.notFoundMessage);
    }

    if (permissions.allowAdmin) {
      return;
    }

    if (permissions.allowClinicOwner) {
      if (!clinicId || analysis.clinicalCase.patient.clinicId !== clinicId) {
        throw new ForbiddenException(messages.forbiddenMessage);
      }
      return;
    }

    if (analysis.clinicalCase.patient.therapistId !== therapistId) {
      throw new ForbiddenException(messages.forbiddenMessage);
    }

    if (clinicId && analysis.clinicalCase.patient.clinicId !== clinicId) {
      throw new ForbiddenException(messages.forbiddenMessage);
    }
  }

  private redactRawModelResponse(value: string): string {
    return value
      .replace(
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        '[REDACTED_EMAIL]',
      )
      .replace(/\+?\d[\d()\-\s]{6,}\d/g, '[REDACTED_PHONE]')
      .replace(
        /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
        '[REDACTED_TOKEN]',
      );
  }

  private logRawResponseAccess(entry: {
    analysisId: string;
    accessorUserId: string;
    role: Role;
    includeSensitive: boolean;
    hasPayload: boolean;
    payloadLength: number;
  }): void {
    this.logger.log(
      `AUDIT_RAW_RESPONSE_READ ${JSON.stringify({
        ...entry,
        timestamp: new Date().toISOString(),
      })}`,
    );
  }

  private async rerankChunks(
    query: string,
    chunks: RagChunk[],
    topN: number = 5,
  ): Promise<RagChunk[]> {
    // Skip if no client or no chunks
    if (!this.cohereClient || chunks.length === 0) {
      return chunks.slice(0, topN);
    }

    try {
      const documents = chunks.map((c) => c.content);

      const response = await withRetry(
        async () => {
          return this.cohereClient!.rerank({
            model: 'rerank-v4.0-pro',
            query: query,
            documents: documents,
            topN: topN,
          });
        },
        { maxRetries: 3 },
        this.logger,
      );

      // Map results back to chunks
      const rerankedChunks: RagChunk[] = response.results.map((result) => ({
        ...chunks[result.index],
        relevanceScore: result.relevanceScore,
      }));

      this.logger.debug(
        `Reranked ${chunks.length} chunks to top ${rerankedChunks.length}`,
      );

      return rerankedChunks;
    } catch (error) {
      this.logger.error(
        `Cohere reranking failed: ${error.message}. Using original order.`,
      );
      return chunks.slice(0, topN);
    }
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
      let finalDiagnosisQuery = diagnosisQuery;
      let finalTreatmentQuery = treatmentQuery;

      if (this.enableHyde) {
        try {
          this.logger.debug('Generating HyDE synthetic documents...');
          const [hydeDiagnosisDoc, hydeTreatmentDoc] = await Promise.all([
            this.generateHydeDocument(
              this.promptBuilderService.buildHydeDiagnosisPrompt(
                diagnosisQuery,
              ),
            ),
            this.generateHydeDocument(
              this.promptBuilderService.buildHydeTreatmentPrompt(
                treatmentQuery,
              ),
            ),
          ]);

          if (hydeDiagnosisDoc) {
            finalDiagnosisQuery = hydeDiagnosisDoc;
            this.logger.debug(
              `Using HyDE document for diagnosis (${hydeDiagnosisDoc.length} chars)`,
            );
          }
          if (hydeTreatmentDoc) {
            finalTreatmentQuery = hydeTreatmentDoc;
            this.logger.debug(
              `Using HyDE document for treatment (${hydeTreatmentDoc.length} chars)`,
            );
          }
        } catch (hydeError) {
          this.logger.warn(
            `HyDE generation failed, falling back to query translation: ${hydeError.message}`,
          );
          // Fallback: Translate queries to English for better retrieval against English docs
          try {
            const [transDiagnosis, transTreatment] = await Promise.all([
              this.translatorService.translateToEnglish(diagnosisQuery),
              this.translatorService.translateToEnglish(treatmentQuery),
            ]);
            finalDiagnosisQuery = transDiagnosis;
            finalTreatmentQuery = transTreatment;
            this.logger.debug('Translated queries to English (HyDE fallback)');
          } catch (transError) {
            this.logger.warn(
              `Translation fallback failed: ${transError.message}. Using original queries.`,
            );
          }
        }
      } else {
        // If HyDE is disabled, we still want to translate Spanish queries to English
        // to ensure they match the English-heavy medical library.
        try {
          const [transDiagnosis, transTreatment] = await Promise.all([
            this.translatorService.translateToEnglish(diagnosisQuery),
            this.translatorService.translateToEnglish(treatmentQuery),
          ]);
          finalDiagnosisQuery = transDiagnosis;
          finalTreatmentQuery = transTreatment;
          this.logger.debug('Translated queries to English (HyDE disabled)');
        } catch (transError) {
          this.logger.warn(
            `Direct translation failed: ${transError.message}. Using original queries.`,
          );
        }
      }

      // Retrieve MORE candidates for reranking (was 5, 5, 3 - now 8, 8, 4)
      const [diagnosisResults, treatmentResults, contraindicationResults] =
        await Promise.all([
          this.knowledgeBaseService.findSimilar(finalDiagnosisQuery, 8),
          this.knowledgeBaseService.findSimilar(finalTreatmentQuery, 8),
          this.knowledgeBaseService.findSimilar(contraindicationsQuery, 4),
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

      // NEW: Rerank deduplicated results
      // Build a combined query for reranking
      const combinedQuery = `${finalDiagnosisQuery} ${finalTreatmentQuery}`;
      const reranked = await this.rerankChunks(combinedQuery, deduplicated, 5);

      this.logger.debug(
        `After reranking: ${reranked.length} chunks (top relevance: ${reranked[0]?.relevanceScore?.toFixed(3) || 'N/A'})`,
      );

      return reranked;
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

  private async generateHydeDocument(hydePrompt: string): Promise<string> {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      return '';
    }

    try {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        config: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: hydePrompt }],
          },
        ],
      });

      return response.text || '';
    } catch (error) {
      this.logger.error(`HyDE document generation failed: ${error.message}`);
      return '';
    }
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
      const parsed = this.extractJsonObject(llmResponse);
      if (!parsed) {
        throw new Error('No JSON found in LLM response');
      }

      return {
        summary:
          typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
            ? parsed.summary
            : undefined,
        primarySuggestion: this.normalizeSuggestion(parsed.primarySuggestion, {
          title: 'Sin recomendación',
          description: 'No se pudo generar una recomendación',
        }),
        alternatives: this.normalizeAlternatives(parsed.alternatives),
        followUpQuestions: this.normalizeFollowUpQuestions(
          parsed.followUpQuestions,
        ),
        redFlags: this.normalizeRedFlags(parsed.redFlags),
        differentialDiagnosis: this.normalizeDifferentialDiagnosis(
          parsed.differentialDiagnosis,
        ),
        confidenceJustification: this.normalizeConfidenceJustification(
          parsed.confidenceJustification,
        ),
        citations: this.normalizeCitations(parsed.citations),
        reasoning: this.normalizeReasoning(parsed.reasoning),
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

  private extractJsonObject(
    llmResponse: string,
  ): Record<string, unknown> | null {
    const candidates: string[] = [];
    const trimmed = llmResponse.trim();
    if (trimmed.length > 0) {
      candidates.push(trimmed);
    }

    const markdownMatches = llmResponse.matchAll(
      /```(?:json)?\s*([\s\S]*?)\s*```/gi,
    );
    for (const match of markdownMatches) {
      if (match[1]) {
        candidates.push(match[1].trim());
      }
    }

    const balancedSlices = this.extractBalancedJsonSlices(llmResponse);
    candidates.push(...balancedSlices);

    for (const candidate of candidates) {
      if (!candidate) continue;

      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private extractBalancedJsonSlices(text: string): string[] {
    const slices: string[] = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === '{') {
        if (depth === 0) {
          start = i;
        }
        depth += 1;
      } else if (char === '}') {
        if (depth > 0) {
          depth -= 1;
          if (depth === 0 && start >= 0) {
            slices.push(text.slice(start, i + 1));
            start = -1;
          }
        }
      }
    }

    return slices;
  }

  private normalizeSuggestion(
    value: unknown,
    fallback: { title: string; description: string },
  ): Suggestion {
    const payload =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};

    const title =
      this.coerceString(payload.title, fallback.title).trim() || fallback.title;
    const description =
      this.coerceString(payload.description, fallback.description).trim() ||
      fallback.description;
    const confidence = this.normalizeConfidence(
      this.coerceString(payload.confidence, 'LOW') || 'LOW',
    );
    const reasoning = this.coerceString(payload.reasoning).trim();

    return {
      title,
      description,
      confidence,
      ...(reasoning.length > 0 ? { reasoning } : {}),
    };
  }

  private normalizeAlternatives(value: unknown): Suggestion[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) =>
        this.normalizeSuggestion(item, {
          title: 'Alternativa clínica',
          description:
            'No se proporcionó una descripción para esta alternativa.',
        }),
      )
      .filter((item) => item.title.length > 0 && item.description.length > 0);
  }

  private normalizeCitations(value: unknown): Citation[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        quote: this.coerceString(item.quote).trim(),
        quoteOriginal:
          typeof item.quoteOriginal === 'string'
            ? item.quoteOriginal.trim() || undefined
            : undefined,
        documentTitle: this.coerceString(item.documentTitle).trim(),
        author: this.coerceString(item.author).trim(),
        pageNumber:
          typeof item.pageNumber === 'number' &&
          Number.isFinite(item.pageNumber)
            ? item.pageNumber
            : undefined,
        relevance:
          typeof item.relevance === 'number' && Number.isFinite(item.relevance)
            ? item.relevance
            : 0,
      }))
      .filter((citation) => citation.quote.length > 0);
  }

  private normalizeReasoning(value: unknown): AnalysisResult['reasoning'] {
    const payload =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};

    return {
      step1_understanding: this.coerceString(
        payload.step1_understanding,
      ).trim(),
      step2_literature: this.coerceString(payload.step2_literature).trim(),
      step3_synthesis: this.coerceString(payload.step3_synthesis).trim(),
    };
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
      summary: result.summary
        ? this.anonymizerService.rehydrate(result.summary, mapping)
        : undefined,
      followUpQuestions: result.followUpQuestions?.map((question) => ({
        ...question,
        question: this.anonymizerService.rehydrate(question.question, mapping),
        reason: this.anonymizerService.rehydrate(question.reason, mapping),
      })),
      redFlags: result.redFlags?.map((flag) => ({
        ...flag,
        flag: this.anonymizerService.rehydrate(flag.flag, mapping),
        recommendedAction: this.anonymizerService.rehydrate(
          flag.recommendedAction,
          mapping,
        ),
      })),
      differentialDiagnosis: result.differentialDiagnosis?.map((diagnosis) => ({
        ...diagnosis,
        condition: this.anonymizerService.rehydrate(
          diagnosis.condition,
          mapping,
        ),
        supportingEvidence: this.anonymizerService.rehydrate(
          diagnosis.supportingEvidence,
          mapping,
        ),
        contradictingEvidence: this.anonymizerService.rehydrate(
          diagnosis.contradictingEvidence,
          mapping,
        ),
      })),
      confidenceJustification: result.confidenceJustification
        ? {
            ...result.confidenceJustification,
            literatureSupport: this.anonymizerService.rehydrate(
              result.confidenceJustification.literatureSupport,
              mapping,
            ),
            clinicalAlignment: this.anonymizerService.rehydrate(
              result.confidenceJustification.clinicalAlignment,
              mapping,
            ),
            limitingFactors:
              result.confidenceJustification.limitingFactors?.map((factor) =>
                this.anonymizerService.rehydrate(factor, mapping),
              ) || [],
          }
        : undefined,
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
      summary: 'No se pudo generar un resumen clínico.',
      primarySuggestion: {
        title: 'Análisis no disponible',
        description:
          'El servicio de análisis no está disponible en este momento. Por favor, intente más tarde.',
        confidence: 'LOW',
      },
      followUpQuestions: [],
      redFlags: [],
      differentialDiagnosis: [],
      confidenceJustification: {
        literatureSupport: 'Sin soporte suficiente',
        clinicalAlignment: 'Alineación clínica no evaluable',
        limitingFactors: ['Servicio no disponible'],
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
      summary:
        'Paciente con presentación compatible con fascitis plantar. Se prioriza manejo conservador con seguimiento clínico estrecho.',
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
      followUpQuestions: [
        {
          question: '¿Se evaluó la primera pisada matutina y su intensidad?',
          reason: 'Ayuda a confirmar patrón típico de fascitis plantar.',
          soapSection: 'SUBJETIVO',
        },
      ],
      redFlags: [],
      differentialDiagnosis: [
        {
          condition: 'Neuropatía del nervio tibial posterior',
          supportingEvidence: 'Dolor plantar persistente.',
          contradictingEvidence:
            'No hay síntomas neurológicos claros en el caso presentado.',
        },
      ],
      confidenceJustification: {
        literatureSupport: 'Soporte moderado con fuentes concordantes.',
        clinicalAlignment: 'Alta alineación con clínica reportada.',
        limitingFactors: ['Falta de pruebas complementarias funcionales.'],
      },
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

  private normalizeFollowUpQuestions(value: unknown): FollowUpQuestion[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        question: this.coerceString(item.question),
        reason: this.coerceString(item.reason),
        soapSection: this.normalizeSoapSection(item.soapSection),
      }))
      .filter((item) => item.question.length > 0);
  }

  private normalizeRedFlags(value: unknown): RedFlag[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        flag: this.coerceString(item.flag),
        urgency: this.normalizeConfidence(
          this.coerceString(item.urgency, 'LOW') || 'LOW',
        ),
        recommendedAction: this.coerceString(item.recommendedAction),
      }))
      .filter((item) => item.flag.length > 0);
  }

  private normalizeDifferentialDiagnosis(
    value: unknown,
  ): DifferentialDiagnosisItem[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object',
      )
      .map((item) => ({
        condition: this.coerceString(item.condition),
        supportingEvidence: this.coerceString(item.supportingEvidence),
        contradictingEvidence: this.coerceString(item.contradictingEvidence),
      }))
      .filter((item) => item.condition.length > 0);
  }

  private normalizeConfidenceJustification(
    value: unknown,
  ): ConfidenceJustification | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const payload = value as Record<string, unknown>;

    return {
      literatureSupport: this.coerceString(payload.literatureSupport),
      clinicalAlignment: this.coerceString(payload.clinicalAlignment),
      limitingFactors: Array.isArray(payload.limitingFactors)
        ? payload.limitingFactors.map((factor) => String(factor))
        : [],
    };
  }

  private normalizeSoapSection(
    value: unknown,
  ): 'SUBJETIVO' | 'OBJETIVO' | 'ANALISIS' | 'PLAN' | 'GENERAL' {
    const raw = this.coerceString(value, 'GENERAL').toUpperCase();
    if (raw === 'SUBJETIVO') return 'SUBJETIVO';
    if (raw === 'OBJETIVO') return 'OBJETIVO';
    if (raw === 'ANALISIS') return 'ANALISIS';
    if (raw === 'PLAN') return 'PLAN';
    return 'GENERAL';
  }

  private normalizeConfidence(value: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const normalized = value.toUpperCase().trim();
    if (normalized === 'HIGH') return 'HIGH';
    if (normalized === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  }

  private coerceString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return fallback;
  }
}
