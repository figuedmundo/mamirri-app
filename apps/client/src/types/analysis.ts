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
  urgency: ConfidenceLevel;
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
}

export interface Reasoning {
  step1_understanding: string;
  step2_literature: string;
  step3_synthesis: string;
}

export interface AnalysisResult {
  summary?: string;
  primarySuggestion: Suggestion;
  alternatives: Suggestion[];
  followUpQuestions?: FollowUpQuestion[];
  redFlags?: RedFlag[];
  differentialDiagnosis?: DifferentialDiagnosisItem[];
  confidenceJustification?: ConfidenceJustification;
  citations: Citation[];
  reasoning: Reasoning;
  metadata: AnalysisMetadata;
}
