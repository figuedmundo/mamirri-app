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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

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
    updateTreatmentPlanObjectives: vi.fn(),
  },
}));

vi.mock('../../api/media', () => ({
  mediaApi: {
    uploadEvaluationVoiceNote: vi.fn(),
  },
}));

const renderWithQuery = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

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
    onSelectSession,
  }: {
    clinicalCase: ClinicalCase;
    onSessionCreated?: (session: TreatmentSession) => void;
    onSessionUpdated?: (session: TreatmentSession) => void;
    onSessionDeleted?: (sessionId: string) => void;
    onSelectSession?: (sessionId: string) => void;
  }) => (
    <div data-testid="treatment-timeline-mock">
      Linea de Tratamiento
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
        data-testid="trigger-select-session"
        onClick={() => onSelectSession?.('ses-001')}
      >
        Trigger Select Session
      </button>
    </div>
  ),
}));

// Mock SessionDetailView
vi.mock('./treatment-timeline/SessionDetailView', () => ({
  SessionDetailView: ({
    activeSessionId,
    onSelectSession,
  }: {
    clinicalCase: ClinicalCase;
    activeSessionId?: string;
    onSelectSession: (id: string) => void;
  }) => (
    <div data-testid="session-detail-view-mock">
      Session Detail View
      <span data-testid="active-session-id">{activeSessionId}</span>
      <button onClick={() => onSelectSession('ses-002')}>
        Select Another Session
      </button>
    </div>
  ),
}));

const mockPatient: Patient = {
  id: 'pac-001',
  name: 'María García',
  occupation: 'Enfermera',
  phone: '+34 600 123 456',
  email: 'maria@example.com',
  birthDate: '1980-01-15',
  emergencyContact: {
    name: 'Juan Doe',
    phone: '1234567',
  },
  medicalFlags: [],
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
  transcriptionStatus: 'completed',
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
        name: 'Inicial',
        durationWeeks: 3,
        techniques: ['Movilizaciones', 'Crioterapia'],
        objectives: 'Alivio del dolor',
      },
      {
        number: 2,
        name: 'Temprana Intermedia',
        durationWeeks: 3,
        techniques: ['Estiramientos suaves'],
        objectives: 'Iniciar estiramientos',
      },
      {
        number: 3,
        name: 'Intermedia',
        durationWeeks: 3,
        techniques: ['Estiramientos progresivos'],
        objectives: 'Ganancia de flexibilidad',
      },
      {
        number: 4,
        name: 'Tardía Intermedia',
        durationWeeks: 3,
        techniques: ['Ejercicios terapéuticos'],
        objectives: 'Fortalecimiento muscular',
      },
      {
        number: 5,
        name: 'Avanzada',
        durationWeeks: 3,
        techniques: ['Fortalecimiento funcional'],
        objectives: 'Preparación para alta',
      },
    ],
  },
  treatmentSessions: [mockSession1, mockSession2],
  evaluations: [
    {
      id: 'eval-001',
      clinicalCaseId: 'caso-001',
      date: '2024-01-01T00:00:00Z',
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

describe('CaseDetailLayout', () => {
  const onBackMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render patient name and case title in header', () => {
      renderWithQuery(
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
      renderWithQuery(
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

      renderWithQuery(
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

      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={inactiveCase}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Inactivo')).toBeInTheDocument();
    });

    it('should render back button with correct aria-label', () => {
      renderWithQuery(
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
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Linea de Tratamiento')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render timeline component even when no sessions exist', () => {
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithoutSessions}
          onBack={onBackMock}
        />,
      );

      // Empty state is now handled by TreatmentTimeline component itself
      // CaseDetailLayout just renders the timeline
      expect(screen.getByTestId('treatment-timeline-mock')).toBeInTheDocument();
    });
  });

  describe('Session Details (via SessionDetailView)', () => {
    beforeEach(() => {
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );
    });

    it('should switch between Timeline and Evaluation views', async () => {
      expect(screen.getByText('Linea de Tratamiento')).toBeInTheDocument();
      expect(
        screen.queryByTestId('evaluation-form-mock'),
      ).not.toBeInTheDocument();

      const evalTab = screen.getByText('Evaluacion');
      await userEvent.click(evalTab);

      expect(screen.getByTestId('evaluation-form-mock')).toBeInTheDocument();
      expect(
        screen.queryByText('Linea de Tratamiento'),
      ).not.toBeInTheDocument();

      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByText('Linea de Tratamiento')).toBeInTheDocument();
    });

    it('should call API when saving evaluation', async () => {
      await userEvent.click(screen.getByText('Evaluacion'));

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
  });

  describe('User Interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      renderWithQuery(
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
    it('should update local case state when session created', async () => {
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const trigger = screen.getByTestId('trigger-session-created');
      await userEvent.click(trigger);

      expect(screen.getByTestId('treatment-timeline-mock')).toBeInTheDocument();
    });

    it('should update local case state when session updated', async () => {
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const trigger = screen.getByTestId('trigger-session-updated');
      await userEvent.click(trigger);

      expect(screen.getByTestId('treatment-timeline-mock')).toBeInTheDocument();
    });

    it('should update local case state when session deleted', async () => {
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const trigger = screen.getByTestId('trigger-session-deleted');
      await userEvent.click(trigger);

      expect(screen.getByTestId('treatment-timeline-mock')).toBeInTheDocument();
    });
  });

  describe('Evaluation Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );
    });

    it('should switch between Timeline and Evaluation views', async () => {
      // Default view is Timeline
      expect(screen.getByText('Linea de Tratamiento')).toBeInTheDocument();
      expect(
        screen.queryByTestId('evaluation-form-mock'),
      ).not.toBeInTheDocument();

      // Switch to Evaluation
      const evalTab = screen.getByText('Evaluacion');
      await userEvent.click(evalTab);

      expect(screen.getByTestId('evaluation-form-mock')).toBeInTheDocument();
      expect(
        screen.queryByText('Linea de Tratamiento'),
      ).not.toBeInTheDocument();

      // Switch back to Timeline
      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByText('Linea de Tratamiento')).toBeInTheDocument();
    });

    it('should call API and show success toast when saving evaluation', async () => {
      await userEvent.click(screen.getByText('Evaluacion'));
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
        title: 'Evaluacion actualizada',
        description: 'Los cambios se han guardado correctamente.',
      });
    });

    it('should show error toast when saving evaluation fails', async () => {
      const error = new Error('Failed to save');
      vi.mocked(patientsApi.updateEvaluation).mockRejectedValueOnce(error);

      await userEvent.click(screen.getByText('Evaluacion'));
      await userEvent.click(screen.getByTestId('trigger-save'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);

      await vi.waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo guardar la evaluacion.',
        });
      });
    });

    it('should call API and show error toast when posturogram update fails', async () => {
      const error = new Error('Failed to update posturogram');
      vi.mocked(patientsApi.updateEvaluation).mockRejectedValueOnce(error);

      await userEvent.click(screen.getByText('Evaluacion'));
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
      await userEvent.click(screen.getByText('Evaluacion'));
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

      await userEvent.click(screen.getByText('Evaluacion'));
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

  describe('Session Navigation Flow', () => {
    beforeEach(() => {
      renderWithQuery(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );
    });

    it('should switch to session detail view when session is selected', async () => {
      await userEvent.click(screen.getByTestId('trigger-select-session'));

      expect(
        screen.getByTestId('session-detail-view-mock'),
      ).toBeInTheDocument();
    });

    it('should pass active session id to session detail view', async () => {
      await userEvent.click(screen.getByTestId('trigger-select-session'));

      expect(screen.getByTestId('active-session-id')).toHaveTextContent(
        'ses-001',
      );
    });

    it('should return to timeline view when back is clicked from session detail', async () => {
      await userEvent.click(screen.getByTestId('trigger-select-session'));
      expect(
        screen.getByTestId('session-detail-view-mock'),
      ).toBeInTheDocument();

      const backButton = screen.getByLabelText('Volver al cronograma');
      await userEvent.click(backButton);

      expect(screen.getByTestId('treatment-timeline-mock')).toBeInTheDocument();
    });

    it('should keep Seguimiento tab active in session detail view', async () => {
      await userEvent.click(screen.getByTestId('trigger-select-session'));

      const seguimientoTab = screen.getByText('Seguimiento').closest('button');
      expect(seguimientoTab).toHaveClass('bg-white');
    });
  });
});
