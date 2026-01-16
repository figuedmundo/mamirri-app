import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetailLayout } from './CaseDetailLayout';
import type {
  Patient,
  ClinicalCase,
  TreatmentSession,
  VoiceNote,
} from '../../types/patient';
import { patientsApi } from '../../api/patients';

// Mock dependencies
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../api/patients', () => ({
  patientsApi: {
    updateEvaluation: vi.fn(),
  },
}));

// Mock EvaluationForm to simplify testing interaction
vi.mock('./EvaluationForm', () => ({
  EvaluationForm: ({ onSave, onPosturogramChange, onPainScaleChange }: any) => (
    <div data-testid="evaluation-form-mock">
      <button
        data-testid="trigger-save"
        onClick={() =>
          onSave({
            id: 'eval-001',
            posturogram: {},
            painScale: { activity: 5 },
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
        onClick={() => onPainScaleChange({ activity: 8 })}
      >
        Trigger Pain
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
  evaluation: {
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
};

const mockClinicalCaseWithoutSessions: ClinicalCase = {
  ...mockClinicalCaseWithSessions,
  treatmentSessions: [],
};

const mockClinicalCaseWithPosturogram: ClinicalCase = {
  ...mockClinicalCaseWithSessions,
  evaluation: {
    id: 'eval-002',
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
    footprints: [
      {
        id: 'fp-001',
        evaluationId: 'eval-002',
        type: 'initial',
        date: '2024-01-01T00:00:00Z',
        url: 'https://example.com/posturogram-before.jpg',
      },
      {
        id: 'fp-002',
        evaluationId: 'eval-002',
        type: 'final',
        date: '2024-04-01T00:00:00Z',
        url: 'https://example.com/posturogram-after.jpg',
      },
    ],
    postureVideos: [],
  },
};

describe('CaseDetailLayout', () => {
  const onBackMock = vi.fn();
  const onAddSessionMock = vi.fn();
  const onEditSessionMock = vi.fn();

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
      expect(screen.getByText('Dolor Lumbar Crónico')).toBeInTheDocument();
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

    it('should render "Nueva Sesión" button when onAddSession provided', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
          onAddSession={onAddSessionMock}
        />,
      );

      expect(screen.getByText('Nueva Sesión')).toBeInTheDocument();
    });

    it('should not render "Nueva Sesión" button when onAddSession not provided', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.queryByText('Nueva Sesión')).not.toBeInTheDocument();
    });

    it('should render "Grabar Evolución" button', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.getByText('Grabar Evolución')).toBeInTheDocument();
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

      expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no sessions exist', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithoutSessions}
          onBack={onBackMock}
          onAddSession={onAddSessionMock}
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
          onAddSession={onAddSessionMock}
        />,
      );

      expect(
        screen.getByText(
          /Agrega la primera sesión para comenzar a registrar la evolución del paciente/,
        ),
      ).toBeInTheDocument();
    });

    it('should render "Agregar Primera Sesión" button in empty state', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithoutSessions}
          onBack={onBackMock}
          onAddSession={onAddSessionMock}
        />,
      );

      expect(screen.getByText('Agregar Primera Sesión')).toBeInTheDocument();
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
          onEditSession={onEditSessionMock}
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
      expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
      expect(
        screen.queryByTestId('evaluation-form-mock'),
      ).not.toBeInTheDocument();

      const evalTab = screen.getByText('Evaluación');
      await userEvent.click(evalTab);

      expect(screen.getByTestId('evaluation-form-mock')).toBeInTheDocument();
      expect(screen.queryByText('Línea de Tiempo')).not.toBeInTheDocument();

      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
    });

    it('should call API when saving evaluation', async () => {
      await userEvent.click(screen.getByText('Evaluación'));

      await userEvent.click(screen.getByTestId('trigger-save'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'eval-001',
        expect.objectContaining({
          id: 'eval-001',
          painScale: { activity: 5 },
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
      expect(screen.getAllByText('Nota de voz').length).toBeGreaterThan(0);
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

    it('should call onAddSession when "Nueva Sesión" button is clicked', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
          onAddSession={onAddSessionMock}
        />,
      );

      const addButton = screen.getByText('Nueva Sesión');
      await userEvent.click(addButton);

      expect(onAddSessionMock).toHaveBeenCalledTimes(1);
    });

    it('should call onAddSession when "Agregar Primera Sesión" button is clicked', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithoutSessions}
          onBack={onBackMock}
          onAddSession={onAddSessionMock}
        />,
      );

      const addButton = screen.getByText('Agregar Primera Sesión');
      await userEvent.click(addButton);

      expect(onAddSessionMock).toHaveBeenCalledTimes(1);
    });

    it('should call onEditSession when edit button is clicked', async () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
          onEditSession={onEditSessionMock}
        />,
      );

      const editButton = screen.getByLabelText('Editar sesión');
      await userEvent.click(editButton);

      expect(onEditSessionMock).toHaveBeenCalledTimes(1);
      // Expect session 2 (the latest)
      expect(onEditSessionMock).toHaveBeenCalledWith('ses-002');
    });

    it('should not render edit button when onEditSession not provided', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      expect(screen.queryByLabelText('Editar sesión')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should hide "Nueva Sesión" text on small screens', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
          onAddSession={onAddSessionMock}
        />,
      );

      const button = screen.getByText('Nueva Sesión');
      expect(button).toHaveClass('hidden');
      expect(button).toHaveClass('sm:inline');
    });

    it('should hide "Grabar Evolución" text on small screens', () => {
      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCaseWithSessions}
          onBack={onBackMock}
        />,
      );

      const button = screen.getByText('Grabar Evolución');
      expect(button).toHaveClass('hidden');
      expect(button).toHaveClass('sm:inline');
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
      expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
      expect(
        screen.queryByTestId('evaluation-form-mock'),
      ).not.toBeInTheDocument();

      // Switch to Evaluation
      const evalTab = screen.getByText('Evaluación');
      await userEvent.click(evalTab);

      expect(screen.getByTestId('evaluation-form-mock')).toBeInTheDocument();
      expect(screen.queryByText('Línea de Tiempo')).not.toBeInTheDocument();

      // Switch back to Timeline
      const timelineTab = screen.getByText('Seguimiento');
      await userEvent.click(timelineTab);

      expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
    });

    it('should call API when saving evaluation', async () => {
      // Go to Evaluation view
      await userEvent.click(screen.getByText('Evaluación'));

      // Trigger save
      await userEvent.click(screen.getByTestId('trigger-save'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledTimes(1);
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'eval-001',
        expect.objectContaining({
          id: 'eval-001',
          painScale: { activity: 5 },
        }),
      );
    });

    it('should call API when posturogram changes', async () => {
      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-posturogram'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'eval-001',
        expect.objectContaining({
          posturogram: { anteriorView: {} },
        }),
      );
    });

    it('should call API when pain scale changes', async () => {
      await userEvent.click(screen.getByText('Evaluación'));
      await userEvent.click(screen.getByTestId('trigger-pain'));

      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'eval-001',
        expect.objectContaining({
          painScale: { activity: 8 },
        }),
      );
    });
  });
});
