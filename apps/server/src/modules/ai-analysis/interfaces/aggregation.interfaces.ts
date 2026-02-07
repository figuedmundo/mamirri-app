import {
  ClinicalCase,
  Evaluation,
  TreatmentSession,
  Patient,
  Footprint,
} from '@prisma/client';

export interface VisionFinding {
  source: 'POSTUROGRAM' | 'FOOTPRINT';
  date: Date;
  findings: string;
  confidence?: string;
  id: string;
}

export interface VoiceNote {
  source: 'EVALUATION' | 'SESSION';
  date: Date;
  transcript: string;
  duration?: number;
  authorId?: string;
  id: string;
}

export interface VisionAnalysisStats {
  totalImages: number;
  cacheHits: number;
  apiCalls: number;
  failures: number;
  failedImageIds: string[];
}

export interface CaseDataAggregate extends ClinicalCase {
  patient: Patient;
  evaluations: (Evaluation & { footprints: Footprint[] })[];
  recentSessions: TreatmentSession[];
  visionFindings: VisionFinding[];
  voiceTranscripts: VoiceNote[];
  visionStats?: VisionAnalysisStats;
}
