export type VisionImageType = 'POSTUROGRAM' | 'FOOTPRINT';

export type Severity = 'normal' | 'mild' | 'moderate' | 'severe';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Finding {
  area: string;
  observation: string;
  severity: Severity;
}

export interface Concern {
  description: string;
  clinicalImplication: string;
}

export interface StructuredAnalysis {
  findings: Finding[];
  concerns: Concern[];
  recommendations: string[];
  confidence: ConfidenceLevel;
}

export interface VisionAnalysisMetadata {
  processingTimeMs: number;
  modelUsed: string;
  imageType: VisionImageType;
}

export interface VisionAnalysisResult {
  rawAnalysis: string;
  structuredAnalysis: StructuredAnalysis;
  qualityWarning: string | null;
  metadata: VisionAnalysisMetadata;
}
