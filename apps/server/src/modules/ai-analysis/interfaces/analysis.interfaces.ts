export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Suggestion {
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  reasoning?: string;
}

export interface FollowUpQuestion {
  question: string;
  reason: string;
  soapSection: 'SUBJETIVO' | 'OBJETIVO' | 'ANALISIS' | 'PLAN' | 'GENERAL';
}

export interface RedFlag {
  flag: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
}

export interface DifferentialDiagnosisItem {
  condition: string;
  supportingEvidence: string;
  contradictingEvidence: string;
}

export interface ConfidenceJustification {
  literatureSupport: string;
  clinicalAlignment: string;
  limitingFactors: string[];
}

export interface Citation {
  quote: string;
  quoteOriginal?: string;
  documentTitle: string;
  author: string;
  pageNumber?: number;
  relevance: number;
}

export interface Reasoning {
  step1_understanding: string;
  step2_literature: string;
  step3_synthesis: string;
}

export interface ServiceStatus {
  rag: boolean;
  vision: boolean;
  voice: boolean;
  llm: boolean;
}

export interface AnalysisMetadata {
  analysisId?: string;
  queryTokens: number;
  responseTokens: number;
  processingTimeMs: number;
  anonymizationApplied: boolean;
  translationsApplied: number;
  serviceStatus?: ServiceStatus;
  warnings?: string[];
  visionAnalysis?: {
    totalImages: number;
    cacheHits: number;
    apiCalls: number;
    failures: number;
    failedImageIds: string[];
  };
}

export interface AnalysisResult {
  primarySuggestion: Suggestion;
  alternatives: Suggestion[];
  citations: Citation[];
  reasoning: Reasoning;
  summary?: string;
  followUpQuestions?: FollowUpQuestion[];
  redFlags?: RedFlag[];
  differentialDiagnosis?: DifferentialDiagnosisItem[];
  confidenceJustification?: ConfidenceJustification;
  metadata: AnalysisMetadata;
}

export interface AnonymizationMapping {
  [placeholder: string]: string;
}

export interface AnonymizedResult {
  text: string;
  data: Record<string, unknown>;
  mapping: AnonymizationMapping;
}

export interface TranslatedResult {
  translated: string;
  original: string;
  language: 'en' | 'es';
  wasCached: boolean;
}

export interface RagChunk {
  content: string;
  pageNumber: number;
  documentTitle: string;
  documentAuthor: string;
  documentFilePath: string;
  documentMetadata: Record<string, unknown>;
  similarity: number;
  relevanceScore?: number;
}
