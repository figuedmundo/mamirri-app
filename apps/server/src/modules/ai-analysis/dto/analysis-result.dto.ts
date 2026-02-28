import { ApiProperty } from '@nestjs/swagger';

class SuggestionDto {
  @ApiProperty({ description: 'Title of the suggestion' })
  title: string;

  @ApiProperty({ description: 'Detailed description of the suggestion' })
  description: string;

  @ApiProperty({
    description: 'Confidence level of the suggestion',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
  })
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({
    description: 'Reasoning behind the suggestion',
    required: false,
  })
  reasoning?: string;
}

class CitationDto {
  @ApiProperty({ description: 'Quote from the medical literature in Spanish' })
  quote: string;

  @ApiProperty({
    description: 'Original quote in English if translated',
    required: false,
  })
  quoteOriginal?: string;

  @ApiProperty({ description: 'Title of the source document' })
  documentTitle: string;

  @ApiProperty({ description: 'Author of the source document' })
  author: string;

  @ApiProperty({ description: 'Page number in the source document' })
  pageNumber?: number;

  @ApiProperty({
    description: 'Relevance score between 0 and 1',
    minimum: 0,
    maximum: 1,
  })
  relevance: number;
}

class ReasoningDto {
  @ApiProperty({
    description: 'Step 1: Understanding the patient presentation',
  })
  step1_understanding: string;

  @ApiProperty({ description: 'Step 2: Literature review and evidence' })
  step2_literature: string;

  @ApiProperty({ description: 'Step 3: Synthesis and recommendations' })
  step3_synthesis: string;
}

class FollowUpQuestionDto {
  @ApiProperty({ description: 'Pregunta clínica de seguimiento' })
  question: string;

  @ApiProperty({ description: 'Motivo clínico de la pregunta' })
  reason: string;

  @ApiProperty({
    description: 'Sección SOAP relacionada',
    enum: ['SUBJETIVO', 'OBJETIVO', 'ANALISIS', 'PLAN', 'GENERAL'],
  })
  soapSection: 'SUBJETIVO' | 'OBJETIVO' | 'ANALISIS' | 'PLAN' | 'GENERAL';
}

class RedFlagDto {
  @ApiProperty({ description: 'Señal de alarma detectada' })
  flag: string;

  @ApiProperty({
    description: 'Nivel de urgencia',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
  })
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({ description: 'Acción recomendada' })
  recommendedAction: string;
}

class DifferentialDiagnosisDto {
  @ApiProperty({ description: 'Condición considerada' })
  condition: string;

  @ApiProperty({ description: 'Evidencia a favor de la condición' })
  supportingEvidence: string;

  @ApiProperty({ description: 'Evidencia en contra de la condición' })
  contradictingEvidence: string;
}

class ConfidenceJustificationDto {
  @ApiProperty({ description: 'Soporte de literatura para la recomendación' })
  literatureSupport: string;

  @ApiProperty({ description: 'Alineación clínica con el caso' })
  clinicalAlignment: string;

  @ApiProperty({
    description: 'Factores que limitan la confianza',
    type: [String],
  })
  limitingFactors: string[];
}

class ServiceStatusDto {
  @ApiProperty({ description: 'RAG service status' })
  rag: boolean;

  @ApiProperty({ description: 'Vision service status' })
  vision: boolean;

  @ApiProperty({ description: 'Voice service status' })
  voice: boolean;

  @ApiProperty({ description: 'LLM service status' })
  llm: boolean;
}

class VisionAnalysisDto {
  @ApiProperty({ description: 'Total number of footprint images found' })
  totalImages: number;

  @ApiProperty({ description: 'Number of images with cached analysis' })
  cacheHits: number;

  @ApiProperty({ description: 'Number of Vision AI API calls made' })
  apiCalls: number;

  @ApiProperty({ description: 'Number of images that failed analysis' })
  failures: number;

  @ApiProperty({
    description: 'IDs of images that failed analysis',
    type: [String],
  })
  failedImageIds: string[];
}

class MetadataDto {
  @ApiProperty({
    description: 'Unique ID of the persisted analysis',
    required: false,
  })
  analysisId?: string;

  @ApiProperty({ description: 'Number of tokens in the query' })
  queryTokens: number;

  @ApiProperty({ description: 'Number of tokens in the response' })
  responseTokens: number;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTimeMs: number;

  @ApiProperty({ description: 'Whether anonymization was applied' })
  anonymizationApplied: boolean;

  @ApiProperty({ description: 'Number of translations applied' })
  translationsApplied: number;

  @ApiProperty({
    description: 'Status of underlying services',
    type: ServiceStatusDto,
    required: false,
  })
  serviceStatus?: ServiceStatusDto;

  @ApiProperty({
    description: 'Warnings generated during analysis',
    type: [String],
    required: false,
  })
  warnings?: string[];

  @ApiProperty({
    description: 'Statistics about vision analysis',
    type: VisionAnalysisDto,
    required: false,
  })
  visionAnalysis?: VisionAnalysisDto;
}

export class AnalysisResultDto {
  @ApiProperty({
    description: 'Resumen breve del análisis clínico',
    required: false,
  })
  summary?: string;

  @ApiProperty({
    description: 'Primary treatment suggestion',
    type: SuggestionDto,
  })
  primarySuggestion: SuggestionDto;

  @ApiProperty({
    description: 'Alternative suggestions',
    type: [SuggestionDto],
    maxItems: 3,
  })
  alternatives: SuggestionDto[];

  @ApiProperty({
    description: 'Preguntas de seguimiento sugeridas',
    type: [FollowUpQuestionDto],
    required: false,
  })
  followUpQuestions?: FollowUpQuestionDto[];

  @ApiProperty({
    description: 'Red flags detectadas durante el análisis',
    type: [RedFlagDto],
    required: false,
  })
  redFlags?: RedFlagDto[];

  @ApiProperty({
    description: 'Diagnóstico diferencial considerado',
    type: [DifferentialDiagnosisDto],
    required: false,
  })
  differentialDiagnosis?: DifferentialDiagnosisDto[];

  @ApiProperty({
    description: 'Justificación de la confianza del análisis',
    type: ConfidenceJustificationDto,
    required: false,
  })
  confidenceJustification?: ConfidenceJustificationDto;

  @ApiProperty({
    description: 'Citations from medical literature',
    type: [CitationDto],
  })
  citations: CitationDto[];

  @ApiProperty({
    description: 'Chain-of-Thought reasoning process',
    type: ReasoningDto,
  })
  reasoning: ReasoningDto;

  @ApiProperty({
    description: 'Analysis metadata',
    type: MetadataDto,
  })
  metadata: MetadataDto;
}
