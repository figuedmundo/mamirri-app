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
}

export interface Posturogram {
  anteriorView?: PosturalView;
  posteriorView?: PosturalView;
  lateralView?: PosturalView;
  gait?: string;
  // Legacy fields mapped to new structure
  head?: DeviationStatus | string;
  shoulders?: DeviationStatus | string;
  spine?: DeviationStatus | string;
  pelvis?: DeviationStatus | string;
  knees?: DeviationStatus | string;
  feet?: DeviationStatus | string;
}

export interface PosturalView {
  head?: string;
  shoulders?: string;
  talesTriangle?: string;
  iliacSpine?: string;
  cervicalSpine?: string;
  dorsalSpine?: string;
  lumbarSpine?: string;
  knees?: string;
  feet?: string;
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

export interface Evaluation {
  id: string;
  clinicalCaseId: string;
  date: string;
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
  evaluation: Evaluation;
  treatmentPlan: TreatmentPlan;
  treatmentSessions: TreatmentSession[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  occupation: string;
  previousOccupation?: string;
  address?: string;
  gender?: string;
  phone: string;
  email?: string;
  birthDate: string;
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
}

export interface EvaluationFormProps {
  /** The clinical case being evaluated */
  clinicalCase: ClinicalCase;

  /** Called when user wants to save the evaluation */
  onSave?: (evaluation: Evaluation) => void;

  /** Called when user starts voice dictation */
  onVoiceDictation?: () => void;

  /** Called when user marks deviation on posturogram */
  onPosturogramChange?: (posturogram: Posturogram) => void;

  /** Called when user updates pain scale */
  onPainScaleChange?: (painScale: PainScale) => void;
}

export interface ComparisonProps {
  /** The clinical case with initial and final evaluations */
  clinicalCase: ClinicalCase;

  /** Called when user wants to export comparison report */
  onExport?: () => void;

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
