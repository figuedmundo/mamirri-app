export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Suggestion {
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  reasoning?: string;
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
  primarySuggestion: Suggestion;
  alternatives: Suggestion[];
  citations: Citation[];
  reasoning: Reasoning;
  metadata: AnalysisMetadata;
}
