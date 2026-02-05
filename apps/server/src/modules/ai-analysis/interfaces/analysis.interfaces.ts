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

export interface Reasoning {
  step1_understanding: string;
  step2_literature: string;
  step3_synthesis: string;
}

export interface AnalysisMetadata {
  queryTokens: number;
  responseTokens: number;
  processingTimeMs: number;
  anonymizationApplied: boolean;
  translationsApplied: number;
}

export interface AnalysisResult {
  primarySuggestion: Suggestion;
  alternatives: Suggestion[];
  citations: Citation[];
  reasoning: Reasoning;
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
}
