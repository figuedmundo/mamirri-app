// =============================================================================
// Data Types
// =============================================================================

export interface VoiceNote {
  id: string;
  type: 'anamnesis' | 'evolution' | 'quick-note';
  date: string;
  audioUrl: string;
  transcription: string;
  durationSeconds: number;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionError?: string;
}

export interface SessionPhoto {
  id: string;
  sessionId: string;
  url: string;
  caption?: string;
  capturedAt: string;
  createdAt: string;
}

export type AnatomicalPoint =
  | 'head'
  | 'shoulders'
  | 'spine'
  | 'pelvis'
  | 'knees'
  | 'feet';
export type DeviationSeverity = 'normal' | 'mild' | 'severe';
export type DeviationType =
  | 'normal'
  | 'scoliosis'
  | 'lordosis'
  | 'kyphosis'
  | 'rotation'
  | 'lateralization'
  | 'valgus'
  | 'varus'
  | 'anteversion'
  | 'retroversion'
  | 'external-rotation-left'
  | 'external-rotation-right'
  | 'lateralization-left'
  | 'lateralization-right'
  | string;

export interface AnatomicalPointStatus {
  deviation: DeviationType;
  severity: DeviationSeverity;
}

export interface Posturogram {
  anteriorView?: PosturalView;
  posteriorView?: PosturalView;
  lateralView?: PosturalView;
  gait?: string;
  // Legacy fields mapped to new structure
  head?: DeviationStatus | string | AnatomicalPointStatus;
  shoulders?: DeviationStatus | string | AnatomicalPointStatus;
  spine?: DeviationStatus | string | AnatomicalPointStatus;
  pelvis?: DeviationStatus | string | AnatomicalPointStatus;
  knees?: DeviationStatus | string | AnatomicalPointStatus;
  feet?: DeviationStatus | string | AnatomicalPointStatus;
}

export interface PosturalView {
  head?: AnatomicalPointStatus;
  shoulders?: AnatomicalPointStatus;
  spine?: AnatomicalPointStatus;
  pelvis?: AnatomicalPointStatus;
  knees?: AnatomicalPointStatus;
  feet?: AnatomicalPointStatus;
  talesTriangle?: AnatomicalPointStatus;
  iliacSpine?: AnatomicalPointStatus;
  cervicalSpine?: AnatomicalPointStatus;
  dorsalSpine?: AnatomicalPointStatus;
  lumbarSpine?: AnatomicalPointStatus;
}

export interface DeviationStatus {
  deviation: string;
  rotation: string;
  lateralization: string;
}

export interface OrthopedicTests {
  thomas: TestResult;
  ely: TestResult;
  ober: TestResult;
  schober: TestResult;
  ott?: TestResult;
  otto?: TestResult;
  patrick?: TestResult;
  lasegue?: TestResult;
  dedoSuelo?: TestResult;
}

export interface TestResult {
  result: number | string;
  interpretation: string;
}

export interface AVDEvaluation {
  barthel: BarthelScore;
  lawton: LawtonScore;
}

export interface BarthelScore {
  feeding: number;
  bathing: number;
  grooming: number;
  dressing: number;
  bowels: number;
  bladder: number;
  toiletUse: number;
  transfers: number;
  mobility: number;
  stairs: number;
  total: number;
  interpretation: string;
}

export interface LawtonScore {
  phoneUse: number;
  shopping: number;
  foodPreparation: number;
  housekeeping: number;
  laundry: number;
  transportation: number;
  medication: number;
  finances: number;
  total: number;
  interpretation: string;
}

export interface PainScale {
  activity: number;
  rest: number;
  palpation: number;
  type: 'acute' | 'chronic';
}

export interface Diagnosis {
  functionalIndicator: string;
  clinicalAspect: string;
  anatomopathology: string;
  avdConsequences: string;
}

export interface Footprint {
  id: string;
  evaluationId: string;
  type: 'initial' | 'final' | 'followup';
  side?: 'left' | 'right' | 'unknown';
  date: string;
  url: string;
  analysis?: FootprintAnalysis;
  comparison?: FootprintComparison;
}

export interface FootprintAnalysis {
  arch: string;
  heelPressure: string;
  forefootPressure: string;
  deviation: string;
}

export interface FootprintComparison {
  archDifference: number;
  painImprovement: string;
  romRecovery: string;
}

export interface PostureVideo {
  id: string;
  evaluationId: string;
  type: 'gait' | 'static' | 'dynamic';
  date: string;
  url: string;
  duration: number;
  observations: string;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  timestamp: Date;
  facingMode: 'user' | 'environment';
  overlayType: string;
}

export interface VideoMetadata {
  durationSeconds: number;
  facingMode: 'user' | 'environment';
  width: number;
  height: number;
  timestamp: Date;
  type?: 'gait' | 'static' | 'dynamic';
}

export type CameraCaptureState =
  | 'idle'
  | 'requesting'
  | 'previewing'
  | 'captured'
  | 'error';

export type VideoRecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'preview'
  | 'confirm';

export type PostureView =
  | 'posture-anterior'
  | 'posture-posterior'
  | 'posture-lateral-left'
  | 'posture-lateral-right'
  | 'footprint-left'
  | 'footprint-right';

export const EvaluationType = {
  INITIAL: 'INITIAL',
  PROGRESS: 'PROGRESS',
  FINAL: 'FINAL',
} as const;

export type EvaluationTypeValue =
  (typeof EvaluationType)[keyof typeof EvaluationType];

/**
 * Evaluation type options available in UI (PROGRESS is reserved for future use)
 */
export const EVALUATION_TYPE_OPTIONS = [
  { value: EvaluationType.INITIAL, label: 'Evaluación Inicial', icon: '🟢' },
  { value: EvaluationType.FINAL, label: 'Evaluación Final', icon: '🔵' },
] as const;

export interface Evaluation {
  id: string;
  clinicalCaseId: string;
  date: string;
  type: EvaluationTypeValue;
  posturogram: Posturogram;
  orthopedicTests: OrthopedicTests;
  avdEvaluation: AVDEvaluation;
  painScale: PainScale;
  diagnosis: Diagnosis;
  footprints: Footprint[];
  postureVideos: PostureVideo[];
  voiceNotes?: VoiceNote[];
}

export interface TreatmentPhase {
  number: number;
  name: string;
  durationWeeks: number;
  techniques: string[];
  objectives: string;
}

export interface TreatmentObjectives {
  therapeutic: string;
  prophylactic: string;
  educational: string;
}

export interface Insole {
  id: string;
  clinicalCaseId: string;
  type: 'orthopedic-insole' | 'ankle-brace' | 'other';
  material: 'cork' | 'neoprene' | 'eva' | 'other';
  features?: {
    internalRaise?: number;
    archSupport?: string;
    heelCup?: string;
    totalHeight?: number;
    fixationType?: string;
    immobilizationLevel?: string;
    height?: number | string;
  };
}

export interface TreatmentPlan {
  id: string;
  clinicalCaseId: string;
  createdAt: string;
  objectives: TreatmentObjectives;
  phases: TreatmentPhase[];
  insole?: Insole | null;
  protocols?: TreatmentPlanProtocol[];
}

export interface TreatmentPlanProtocol {
  treatmentPlanId: string;
  protocolId: string;
  addedAt: string;
  notes?: string | null;
  protocol: {
    id: string;
    title: string;
    tags: string[];
  };
}

export interface TreatmentSession {
  id: string;
  clinicalCaseId: string;
  date: string;
  phaseNumber: number;
  procedures: string[];
  patientResponse: string;
  finalPainLevel: number;
  observations: string;
  voiceNotes?: VoiceNote[];
  photos?: SessionPhoto[];
}

export interface ClinicalCase {
  id: string;
  patientId: string;
  title: string;
  status: 'active' | 'completed' | 'inactive';
  startDate: string;
  endDate?: string;
  consultationReason: string;
  pathologicalHistory?: string[];
  pharmacologicalHistory?: string;
  initialMedicalDiagnosis?: string;
  evaluations: Evaluation[];
  treatmentPlan: TreatmentPlan;
  treatmentSessions: TreatmentSession[];
}

export interface Patient {
  id: string;
  name: string;
  occupation: string;
  previousOccupation?: string;
  gender?: string;
  phone: string;
  email?: string;
  birthDate: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  referralSource?: string;
  referralSourceDetails?: string;
  medicalFlags: string[];
  medicalFlagsOther?: string;
  isActive: boolean;
  createdAt: string;
  clinicalCases: ClinicalCase[];
}

// =============================================================================
// Component Props
// =============================================================================

export interface PatientListProps {
  /** The list of patients to display */
  patients: Patient[];

  /** Called when user wants to view a patient's details */
  onView?: (id: string) => void;

  /** Called when user wants to create a new patient */
  onCreate?: () => void;

  /** Called when user wants to edit a patient */
  onEdit?: (id: string) => void;

  /** Called when user wants to delete a patient */
  onDelete?: (id: string) => void;

  /** Called when user wants to schedule appointment in Google Calendar */
  onSchedule?: (patientId: string) => void;
}

export interface PatientProfileProps {
  /** The patient to display */
  patient: Patient;

  /** Called when user wants to edit patient info */
  onEdit?: () => void;

  /** Called when user wants to start voice dictation */
  onVoiceDictation?: () => void;

  /** Called when user wants to capture footprint */
  onCaptureFootprint?: () => void;

  /** Called when user wants to capture posture video */
  onCaptureVideo?: () => void;

  /** Called when user wants to schedule appointment in Google Calendar */
  onSchedule?: () => void;

  /** Called when patient data needs to be refreshed */
  onRefresh?: () => void;
}

export interface EvaluationFormProps {
  /** The clinical case being evaluated */
  clinicalCase: ClinicalCase;

  /** Called when user wants to save evaluation */
  onSave?: (evaluation: Evaluation) => void;

  /** Called when user starts voice dictation */
  onVoiceDictation?: () => void;

  /** Called when user marks deviation on posturogram */
  onPosturogramChange?: (posturogram: Posturogram) => void;

  /** Called when user updates pain scale */
  onPainScaleChange?: (painScale: PainScale) => void;

  /** Evaluation type being edited (for new evaluations, this is auto-defaulted) */
  evaluationType?: EvaluationTypeValue;
}

export interface ComparisonProps {
  /** The clinical case with initial and final evaluations */
  clinicalCase: ClinicalCase;

  /** Called when user wants to export comparison report */
  onExport?: () => Promise<void> | void;

  /** Called when user wants to share comparison with patient */
  onShare?: () => void;
}

export interface TimelineProps {
  /** The treatment sessions to display */
  sessions: TreatmentSession[];

  /** Called when user wants to view session details */
  onViewSession?: (id: string) => void;

  /** Called when user wants to add a new session */
  onAddSession?: () => void;

  /** Called when user wants to edit a session */
  onEditSession?: (id: string) => void;
}

export interface CameraCaptureProps {
  /** Called when user confirms a captured photo */
  onCapture: (blob: Blob, metadata: PhotoMetadata) => void;

  /** Called when user cancels/closes the camera */
  onCancel?: () => void;

  /** Overlay guide to show over camera preview */
  overlayType?: PostureView | 'none';

  /** Initial camera facing mode */
  defaultFacingMode?: 'user' | 'environment';

  /** Additional CSS classes */
  className?: string;
}

export interface VideoRecorderProps {
  /** Called when user confirms a captured video */
  onCapture: (blob: Blob, metadata: VideoMetadata) => void;

  /** Called when user cancels/closes the recorder */
  onCancel?: () => void;

  /** Maximum recording duration in seconds (default: 30) */
  maxDuration?: number;

  /** Additional CSS classes */
  className?: string;
}
