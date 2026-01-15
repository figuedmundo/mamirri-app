export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  contact?: {
    phone?: string;
    email?: string;
  };
  photoUrl?: string;
  clinicalCases: ClinicalCase[];
}

export interface ClinicalCase {
  id: string;
  patientId: string;
  diagnosis: string;
  startDate: Date;
  status: 'active' | 'completed' | 'follow_up';
  initialEvaluation?: Evaluation;
  treatmentPlan?: TreatmentPlan;
  sessions: TreatmentSession[];
  insoles?: Insole[];
}

export interface Evaluation {
  id: string;
  caseId: string;
  date: Date;
  consultationReason?: string;
  medicalHistory?: string;
  exams: FunctionalExam[];
  footprints: Footprint[];
  postureVideos: PostureVideo[];
  notes?: string;
}

export interface FunctionalExam {
  id: string;
  evaluationId: string;
  type: 'Thomas' | 'Ely' | 'Schober' | 'Finger_Floor' | 'Barthel' | 'Lawton';
  result: string | number;
  observations?: string;
}

export interface TreatmentPlan {
  id: string;
  caseId: string;
  goals: string[];
  modalities: ('insoles' | 'massages' | 'exercises' | 'combined')[];
  bibliographicReferences: BibliographicReference[];
  notes?: string;
}

export interface TreatmentSession {
  id: string;
  caseId: string;
  date: Date;
  sessionNumber: number;
  painLevel?: number;
  barthelIndex?: number;
  progressNotes?: string;
  proceduresPerformed: string[];
}

export interface Footprint {
  id: string;
  evaluationId: string;
  foot: 'left' | 'right';
  imageUrl: string;
  archType?: 'flat' | 'high' | 'normal';
  pressureZones?: PressureZone[];
  captureDate: Date;
}

export interface PressureZone {
  zone: string;
  level: number;
  type: 'high' | 'medium' | 'low';
}

export interface PostureVideo {
  id: string;
  evaluationId: string;
  type: 'gait' | 'static_posture';
  views: PostureView[];
  videoUrl: string;
  duration?: number;
  captureDate: Date;
}

export interface PostureView {
  id: string;
  videoId: string;
  type: 'anterior' | 'posterior' | 'lateral_left' | 'lateral_right';
  imageUrl?: string;
  anatomicalPoints?: AnatomicalPoint[];
}

export interface AnatomicalPoint {
  id: string;
  viewId: string;
  name: string;
  position: { x: number; y: number };
}

export interface Insole {
  id: string;
  caseId: string;
  design: InsoleDesign;
  materials: InsoleMaterial[];
  pdfUrl?: string;
  createdAt: Date;
}

export interface InsoleDesign {
  archHeight: number;
  heelIncline: number;
  reliefZones: ReliefZone[];
}

export interface ReliefZone {
  location: { x: number; y: number };
  radius: number;
  level: number;
}

export interface InsoleMaterial {
  layer: 'base' | 'middle' | 'cover';
  type: 'EVA_rigid' | 'EVA_medium' | 'EVA_soft';
  thickness?: number;
}

export interface BibliographicReference {
  id: string;
  planId: string;
  author?: string;
  year?: number;
  title: string;
  source: string;
  url?: string;
  originalLanguage?: string;
}
