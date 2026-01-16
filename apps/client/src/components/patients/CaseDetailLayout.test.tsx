import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetailLayout } from './CaseDetailLayout';
import type {
  Patient,
  ClinicalCase,
  TreatmentSession,
  VoiceNote,
  Evaluation,
  Posturogram,
  PainScale,
} from '../../types/patient';
import { patientsApi } from '../../api/patients';

// Mock dependencies
const mockToast = vi.fn();

vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('../../api/patients', () => ({
  patientsApi: {
    updateEvaluation: vi.fn(),
  },
}));

// Mock EvaluationForm to simplify testing interaction
vi.mock('./EvaluationForm', () => ({
  EvaluationForm: ({
    onSave,
    onPosturogramChange,
    onPainScaleChange,
  }: {
    onSave: (evaluation: Evaluation) => void;
    onPosturogramChange: (posturogram: Posturogram) => void;
    onPainScaleChange: (painScale: PainScale) => void;
  }) => (
    <div data-testid="evaluation-form-mock">
      <button
        data-testid="trigger-save"
        onClick={() =>
          onSave({
            id: 'eval-001',
            clinicalCaseId: 'caso-001',
            date: '2024-01-01T00:00:00Z',
            type: 'INITIAL',
            posturogram: {},
            orthopedicTests: {
              thomas: { result: 'normal', interpretation: 'Negative' },
              ely: { result: 'normal', interpretation: 'Negative' },
              ober: { result: 'normal', interpretation: 'Negative' },
              schober: { result: 'normal', interpretation: 'Negative' },
            },
            avdEvaluation: {
              barthel: {
                feeding: 5,
                bathing: 5,
                grooming: 5,
                dressing: 5,
                bowels: 5,
                bladder: 5,
                toiletUse: 5,
                transfers: 5,
                mobility: 5,
                stairs: 5,
                total: 50,
                interpretation: 'Independencia moderada',
              },
              lawton: {
                phoneUse: 2,
                shopping: 2,
                foodPreparation: 2,
                housekeeping: 2,
                laundry: 2,
                transportation: 2,
                medication: 2,
                finances: 2,
                total: 16,
                interpretation: 'Independencia parcial',
              },
            },
            painScale: { activity: 5, rest: 2, palpation: 4, type: 'chronic' },
            diagnosis: {
              functionalIndicator: '',
              clinicalAspect: '',
              anatomopathology: '',
              avdConsequences: '',
            },
            footprints: [],
            postureVideos: [],
          })
        }
      >
        Trigger Save
      </button>
      <button
        data-testid="trigger-posturogram"
        onClick={() => onPosturogramChange({ anteriorView: {} })}
      >
        Trigger Posturogram
      </button>
      <button
        data-testid="trigger-pain"
        onClick={() =>
          onPainScaleChange({
            activity: 8,
            rest: 4,
            palpation: 6,
            type: 'chronic',
          })
        }
      >
        Trigger Pain
      </button>
    </div>
  ),
}));

// Mock TreatmentTimeline to spy on props
vi.mock('./TreatmentTimeline', () => ({
  TreatmentTimeline: ({
    clinicalCase,
    onSessionCreated,
    onSessionUpdated,
    onSessionDeleted,
    onViewSession,
  }: {
    clinicalCase: ClinicalCase;
    onSessionCreated?: (session: TreatmentSession) => void;
    onSessionUpdated?: (session: TreatmentSession) => void;
    onSessionDeleted?: (sessionId: string) => void;
    onViewSession?: (sessionId: string) => void;
  }) => (
    <div data-testid="treatment-timeline-mock">
      Línea de Tratamiento
      <div data-testid="timeline-pain-scale">
        {JSON.stringify(clinicalCase.evaluations?.[0]?.painScale)}
      </div>
      <button
        data-testid="trigger-session-created"
        onClick={() =>
          onSessionCreated?.({
            id: 'ses-new',
            clinicalCaseId: 'caso-001',
            date: '2024-02-01T00:00:00Z',
            phaseNumber: 1,
            procedures: [],
            finalPainLevel: 2,
            voiceNotes: [],
            patientResponse: 'Better',
            observations: 'Good',
          })
        }
      >
        Trigger Session Created
      </button>
      <button
        data-testid="trigger-session-updated"
        onClick={() =>
          onSessionUpdated?.({
            id: 'ses-002',
            clinicalCaseId: 'caso-001',
            date: '2024-01-22T10:00:00Z',
            phaseNumber: 2,
            procedures: [],
            finalPainLevel: 1,
            voiceNotes: [],
            patientResponse: 'Better',
            observations: 'Good',
          })
        }
      >
        Trigger Session Updated
      </button>
      <button
        data-testid="trigger-session-deleted"
        onClick={() => onSessionDeleted?.('ses-001')}
      >
        Trigger Session Deleted
      </button>
      <button
        data-testid="trigger-view-session"
        onClick={() => onViewSession?.('ses-001')}
      >
        Trigger View Session
      </button>
    </div>
  ),
}));

const mockPatient: Patient = {
  id: 'pac-001',
  name: 'María García',
  age: 45,
  occupation: 'Enfermera',
  phone: '+34 600 123 456',
  email: 'maria@example.com',
  birthDate: '1980-01-15',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  clinicalCases: [],
};

const mockVoiceNote: VoiceNote = {
  id: 'vn-001',
  type: 'evolution',
  date: '2024-01-15T10:00:00Z',
  audioUrl: 'https://example.com/audio.mp3',
  transcription: 'Paciente reporta mejoría en flexibilidad de columna',
  durationSeconds: 30,
};

const mockSession1: TreatmentSession = {
  id: 'ses-001',
  clinicalCaseId: 'caso-001',
  date: '2024-01-15T10:00:00Z',
  phaseNumber: 1,
  procedures: ['Masaje lumbar', 'Estiramientos isquiotibiales'],
  patientResponse: 'Paciente reporta alivio del dolor post-tratamiento',
  finalPainLevel: 4,
  observations: 'Buena respuesta al tratamiento',
  voiceNotes: [mockVoiceNote],
};

const mockSession2: TreatmentSession = {
  id: 'ses-002',
  clinicalCaseId: 'caso-001',
  date: '2024-01-22T10:00:00Z',
  phaseNumber: 2,
  procedures: ['Terapia manual'],
  patientResponse: 'Sin cambios significativos',
  finalPainLevel: 6,
  observations: 'Continuar con plan de tratamiento',
};

const mockClinicalCaseWithSessions: ClinicalCase = {
  id: 'caso-001',
  patientId: 'pac-001',
  title: 'Dolor Lumbar Crónico',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  consultationReason: 'Dolor persistente en zona lumbar',
  treatmentPlan: {
    id: 'plan-001',
    clinicalCaseId: 'caso-001',
    createdAt: '2024-01-01T00:00:00Z',
    objectives: {
      therapeutic: 'Reducir dolor lumbar',
      prophylactic: 'Mejorar postura',
      educational: 'Ejercicios domiciliarios',
    },
    phases: [
      {
        number: 1,
        name: 'Alivio del dolor',
        durationWeeks: 4,
        techniques: ['Masaje', 'Terapia manual'],
        objectives: 'Reducir dolor a nivel 3',
      },
      {
        number: 2,
        name: 'Movilización',
        durationWeeks: 4,
        techniques: ['Estiramientos'],
        objectives: 'Mejorar rango de movimiento',
      },
    ],
  },
  treatmentSessions: [mockSession1, mockSession2],
  evaluations: [
    {
      id: 'eval-001',
      clinicalCaseId: 'caso-001',
      date: '2024-01-01T00:00:00Z',
      type: 'INITIAL',
      posturogram: {},
      orthopedicTests: {
        thomas: { result: 'normal', interpretation: 'Negative' },
        ely: { result: 'normal', interpretation: 'Negative' },
        ober: { result: 'normal', interpretation: 'Negative' },
        schober: { result: 'normal', interpretation: 'Negative' },
      },
      avdEvaluation: {
        barthel: {
          feeding: 5,
          bathing: 5,
          grooming: 5,
          dressing: 5,
          bowels: 5,
          bladder: 5,
          toiletUse: 5,
          transfers: 5,
          mobility: 5,
          stairs: 5,
          total: 50,
          interpretation: 'Independencia moderada',
        },
        lawton: {
          phoneUse: 2,
          shopping: 2,
          foodPreparation: 2,
          housekeeping: 2,
          laundry: 2,
          transportation: 2,
          medication: 2,
          finances: 2,
          total: 16,
          interpretation: 'Independencia parcial',
        },
      },
      painScale: {
        activity: 4,
        rest: 3,
        palpation: 5,
        type: 'chronic',
      },
      diagnosis: {
        functionalIndicator: 'Dificultad para caminar largas distancias',
        clinicalAspect: 'Hipertonía lumbar',
        anatomopathology: 'Hipercifosis torácica',
        avdConsequences: 'Limitación en AVDs',
      },
      footprints: [],
      postureVideos: [],
    },
  ],
};

const mockClinicalCaseWithoutSessions: ClinicalCase = {
  ...mockClinicalCaseWithSessions,
  treatmentSessions: [],
};

const mockClinicalCaseWithPosturogram: ClinicalCase = {
  ...mockClinicalCaseWithSessions,
  evaluations: [
    {
      id: 'eval-002',
      clinicalCaseId: 'caso-001',
      date: '2024-01-01T00:00:00Z',
      type: 'INITIAL',
      posturogram: {},
      orthopedicTests: {
        thomas: { result: 'normal', interpretation: 'Negative' },
        ely: { result: 'normal', interpretation: 'Negative' },
        ober: { result: 'normal', interpretation: 'Negative' },
        schober: { result: 'normal', interpretation: 'Negative' },
      },
      avdEvaluation: {
        barthel: {
          feeding: 5,
          bathing: 5,
          grooming: 5,
          dressing: 5,
          bowels: 5,
          bladder: 5,
          toiletUse: 5,
          transfers: 5,
          mobility: 5,
          stairs: 5,
          total: 50,
          interpretation: 'Independencia moderada',
        },
        lawton: {
          phoneUse: 2,
          shopping: 2,
          foodPreparation: 2,
          housekeeping: 2,
          laundry: 2,
          transportation: 2,
          medication: 2,
          finances: 2,
          total: 16,
          interpretation: 'Independencia parcial',
        },
      },
      painScale: {
        activity: 4,
        rest: 3,
        palpation: 5,
        type: 'chronic',
      },
      diagnosis: {
        functionalIndicator: 'Dificultad para caminar largas distancias',
        clinicalAspect: 'Hipertonía lumbar',
        anatomopathology: 'Hipercifosis torácica',
        avdConsequences: 'Limitación en AVDs',
      },
      footprints: [
        {
          id: 'fp-001',
          evaluationId: 'eval-002',
          type: 'initial',
          date: '2024-01-01T00:00:00Z',
          url: 'https://example.com/posturogram-before.jpg',
        },
      ],
      postureVideos: [],
    },
    {
      id: 'eval-003',
      clinicalCaseId: 'caso-001',
      date: '2024-04-01T00:00:00Z',
      type: 'FINAL',
      posturogram: {},
      orthopedicTests: {
        thomas: { result: 'normal', interpretation: 'Negative' },
        ely: { result: 'normal', interpretation: 'Negative' },
        ober: { result: 'normal', interpretation: 'Negative' },
        schober: { result: 'normal', interpretation: 'Negative' },
      },
      avdEvaluation: {
        barthel: {
          feeding: 10,
          bathing: 5,
          grooming: 5,
          dressing: 10,
          bowels: 10,
          bladder: 10,
          toiletUse: 10,
          transfers: 15,
          mobility: 15,
          stairs: 10,
          total: 100,
          interpretation: 'Independent',
        },
        lawton: {
          phoneUse: 1,
          shopping: 1,
          foodPreparation: 1,
          housekeeping: 1,
          laundry: 1,
          transportation: 1,
          medication: 1,
          finances: 1,
          total: 8,
          interpretation: 'Independent',
        },
      },
      painScale: { activity: 0, rest: 0, palpation: 0, type: 'chronic' },
      diagnosis: {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
      footprints: [
        {
          id: 'fp-002',
          evaluationId: 'eval-003',
          type: 'final',
          date: '2024-04-01T00:00:00Z',
          url: 'https://example.com/posturogram-after.jpg',
        },
      ],
      postureVideos: [],
    },
  ],
};

describe('CaseDetailLayout', () => {
  const onBackMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render patient name and case title in header', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('María García')).toBeInTheDocument();
      // Use regex for partial match as text is split by children
      expect(screen.getByText(/Dolor Lumbar Crónico/)).toBeInTheDocument();
    });

    it('should render case status badge', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('should render completed case status', () => {
      const completedCase: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        status: 'completed',
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={completedCase}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Completado')).toBeInTheDocument();
    });

    it('should render inactive case status', () => {
      const inactiveCase: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        status: 'inactive',
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={inactiveCase}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Inactivo')).toBeInTheDocument();
    });

    it('should render back button with correct aria-label', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const backButton = screen.getByLabelText('Volver al perfil del paciente');
      expect(backButton).toBeInTheDocument();
    });

    it('should render timeline component', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Línea de Tratamiento')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no sessions exist', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithoutSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Sin sesiones registradas')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Este caso clínico aún no tiene sesiones de tratamiento/,
        ),
      ).toBeInTheDocument();
    });

    it('should render helpful message in empty state', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithoutSessions}
          onBack={onBackMock}
        />,
      );

      expect(
        screen.getByText(
          /Agrega la primera sesión para comenzar a registrar la evolución del paciente/,
        ),
      ).toBeInTheDocument();
    });

    /*
    it('should render "Selecciona una sesión" message when no session selected', () => {
      // This state is unreachable with current auto-select logic unless we add way to deselect
      // Skipping for now as it contradicts the feature "auto-select latest session"
    });
    */
  });

  describe('Session Details', () => {
    beforeEach(() => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );
    });

    it('should render active session details', () => {
      expect(screen.getByText('Reporte de Evolución')).toBeInTheDocument();
      // Since it auto-selects the last session (2 of 2)
      expect(screen.getByText(/Sesión 2 de 2/)).toBeInTheDocument();
    });

    it('should render session date in full format', () => {
      // Date of session 2: 2024-01-22
      expect(
        screen.getByText(/lunes, 22 de enero de 2024/),
      ).toBeInTheDocument();
    });

    it('should render pain level indicator', () => {
      expect(screen.getByText('Dolor END')).toBeInTheDocument();
      // Session 2 has pain 6
      expect(screen.getByText('6/10')).toBeInTheDocument();
    });

    it('should render pain level in emerald color when pain is ≤ 5', () => {
      // Need a case where the LAST session has pain <= 5
      const caseWithLowPain: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [
          mockSession1, // pain 4
          {
            ...mockSession2,
            finalPainLevel: 3,
          },
        ],
      };

      // Re-render with new case
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithLowPain}
          onBack={onBackMock}
        />,
      );

      const painIndicator = screen.getByText('3/10');
      expect(painIndicator).toHaveClass('text-emerald-500');
    });

    it('should render pain level in rose color when pain is > 5', () => {
      const caseWithHighPain: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [
          {
            ...mockSession1,
            finalPainLevel: 7,
          },
        ],
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithHighPain}
          onBack={onBackMock}
        />,
      );

      const painIndicator = screen.getByText('7/10');
      expect(painIndicator).toHaveClass('text-rose-500');
    });

    it('should switch between Timeline and Evaluation views', async () => {
      expect(screen.getByText('Línea de Tratamiento')).toBeInTheDocument();
      expect(
        screen.queryByTestId('evaluation-form-mock'),
      ).not.toBeInTheDocument();

      const evalTab = screen.getByText('Evaluación');
      await userEvent.click(evalTab);

      expect(screen.getByTestId('evaluation-form-mock')).toBeInTheDocument();
      expect(
        screen.queryByText('Línea de Tratamiento'),
      ).not.toBeInTheDocument();

      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByText('Línea de Tratamiento')).toBeInTheDocument();
    });

    it('should call API when saving evaluation', async () => {
      await userEvent.click(screen.getByText('Evaluación'));

      await userEvent.click(screen.getByTestId('trigger-save'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'eval-001',
        expect.objectContaining({
          id: 'eval-001',
          painScale: expect.objectContaining({ activity: 5 }),
        }),
      );
    });

    it('should render patient response', () => {
      // Session 2 response
      expect(
        screen.getByText('Sin cambios significativos'),
      ).toBeInTheDocument();
    });

    it('should render observations when present', () => {
      // Session 2 observations
      // Note: Text appears in both timeline and main detail view
      const observations = screen.getAllByText(
        'Continuar con plan de tratamiento',
      );
      expect(observations.length).toBeGreaterThan(0);
      expect(observations[0]).toBeInTheDocument();
    });

    it('should render "Sin respuesta registrada" when no response', () => {
      const sessionWithoutResponse: TreatmentSession = {
        ...mockSession1,
        patientResponse: '',
      };

      const caseWithoutResponse: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [sessionWithoutResponse],
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithoutResponse}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText(/Sin respuesta registrada/)).toBeInTheDocument();
    });

    it('should render "Sin técnicas registradas" when no procedures', () => {
      const sessionWithoutProcedures: TreatmentSession = {
        ...mockSession1,
        procedures: [],
      };

      const caseWithoutProcedures: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [sessionWithoutProcedures],
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithoutProcedures}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText(/Sin técnicas registradas/)).toBeInTheDocument();
    });
  });

  describe('Voice Notes', () => {
    it('should render voice note player when voice notes exist', () => {
      // Session 2 doesn't have voice notes in mock
      // Need to use session 1 which has voice notes, or add voice notes to session 2
      const caseWithVoiceNotesInLastSession: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [
          mockSession1,
          {
            ...mockSession2,
            voiceNotes: [mockVoiceNote],
          },
        ],
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithVoiceNotesInLastSession}
          onBack={onBackMock}
        />,
      );

      // "Nota de voz" might appear in timeline and detail view
      expect(
        screen.getByText(
          /"Paciente reporta mejoría en flexibilidad de columna"/,
        ),
      ).toBeInTheDocument();
    });

    it('should render play button for voice note', () => {
      const caseWithVoiceNotesInLastSession: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [
          mockSession1,
          {
            ...mockSession2,
            voiceNotes: [mockVoiceNote],
          },
        ],
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithVoiceNotesInLastSession}
          onBack={onBackMock}
        />,
      );

      const playButton = screen.getByLabelText('Reproducir nota de voz');
      expect(playButton).toBeInTheDocument();
    });

    it('should not render voice note section when no voice notes', () => {
      const sessionWithoutVoiceNotes: TreatmentSession = {
        ...mockSession1,
        voiceNotes: undefined,
      };

      const caseWithoutVoiceNotes: ClinicalCase = {
        ...mockClinicalCaseWithSessions,
        treatmentSessions: [sessionWithoutVoiceNotes],
      };

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={caseWithoutVoiceNotes}
          onBack={onBackMock}
        />,
      );

      expect(screen.queryByText('Nota de voz')).not.toBeInTheDocument();
    });
  });

  describe('Posturogram Comparison', () => {
    it('should render posturogram viewer when images are available', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithPosturogram}
          onBack={onBackMock}
        />,
      );

      expect(
        screen.getByText('Evolución Postural (Sagital)'),
      ).toBeInTheDocument();
    });

    it('should render empty state for posturogram when no images', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Evolución Postural')).toBeInTheDocument();
      expect(
        screen.getByText(/No hay imágenes de comparación disponibles/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Capture una huella inicial y final para ver la evolución/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const backButton = screen.getByLabelText('Volver al perfil del paciente');
      await userEvent.click(backButton);

      expect(onBackMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Session Lifecycle Callbacks', () => {
    it('should update local case when session created', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const trigger = screen.getByTestId('trigger-session-created');
      await userEvent.click(trigger);

      // Verify that the new session is displayed (e.g. by checking session count or date)
      // Since local state update is internal, we check rendered output
      expect(screen.getByText(/Sesión 3 de 3/)).toBeInTheDocument();
    });

    it('should update local case when session updated', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const trigger = screen.getByTestId('trigger-session-updated');
      await userEvent.click(trigger);

      // Verify pain level updated from 4 to 1
      expect(screen.getByText('1/10')).toBeInTheDocument();
    });

    it('should update local case when session deleted', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const trigger = screen.getByTestId('trigger-session-deleted');
      await userEvent.click(trigger);

      // Should have 1 session left
      expect(screen.getByText(/Sesión 1 de 1/)).toBeInTheDocument();
    });
  });

  describe('Evaluation Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );
    });

    it('should switch between Timeline and Evaluation views', async () => {
      // Default view is Timeline
      expect(screen.getByText('Línea de Tratamiento')).toBeInTheDocument();
      expect(
        screen.queryByTestId('evaluation-form-mock'),
      ).not.toBeInTheDocument();

      // Switch to Evaluation
      const evalTab = screen.getByText('Evaluación');
      await userEvent.click(evalTab);

      expect(screen.getByTestId('evaluation-form-mock')).toBeInTheDocument();
      expect(
        screen.queryByText('Línea de Tratamiento'),
      ).not.toBeInTheDocument();

      // Switch back to Timeline
      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByText('Línea de Tratamiento')).toBeInTheDocument();
    });

    it('should call API and show success toast when saving evaluation', async () => {
      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-save'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'eval-001',
        expect.objectContaining({
          id: 'eval-001',
          painScale: expect.objectContaining({ activity: 5 }),
        }),
      );

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Evaluación actualizada',
        description: 'Los cambios se han guardado correctamente.',
      });
    });

    it('should show error toast when saving evaluation fails', async () => {
      const error = new Error('Failed to save');
      vi.mocked(patientsApi.updateEvaluation).mockRejectedValueOnce(error);

      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-save'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);

      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo guardar la evaluación.',
        });
      });
    });

    it('should call API and show error toast when posturogram update fails', async () => {
      const error = new Error('Failed to update posturogram');
      vi.mocked(patientsApi.updateEvaluation).mockRejectedValueOnce(error);

      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-posturogram'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);

      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo actualizar el posturograma.',
        });
      });
    });

    it('should update clinicalCase and pass to children when pain scale changes', async () => {
      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-pain'));

      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByTestId('timeline-pain-scale')).toHaveTextContent(
        '"activity":8',
      );
    });

    it('should call API and show error toast when pain scale update fails', async () => {
      const error = new Error('Failed to update pain scale');
      vi.mocked(patientsApi.updateEvaluation).mockRejectedValueOnce(error);

      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-pain'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);

      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo actualizar la escala de dolor.',
        });
      });
    });
  });
});
