import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseTimeline } from './CaseTimeline';
import type {
  ClinicalCase,
  TreatmentSession,
  VoiceNote,
} from '../../types/patient';

const mockVoiceNote: VoiceNote = {
  id: 'vn-001',
  type: 'evolution',
  date: '2024-01-15T10:00:00Z',
  audioUrl: 'https://example.com/audio.mp3',
  transcription: 'Paciente reporta mejoría en flexibilidad',
  durationSeconds: 30,
  transcriptionStatus: 'completed',
};

const mockSession1: TreatmentSession = {
  id: 'ses-001',
  clinicalCaseId: 'caso-001',
  date: '2024-01-15T10:00:00Z',
  phaseNumber: 1,
  procedures: ['Masaje lumbar'],
  patientResponse: 'Paciente reporta alivio',
  finalPainLevel: 4,
  observations: 'Buena respuesta',
  voiceNotes: [mockVoiceNote],
};

const mockSession2: TreatmentSession = {
  id: 'ses-002',
  clinicalCaseId: 'caso-001',
  date: '2024-01-22T10:00:00Z',
  phaseNumber: 1,
  procedures: ['Estiramientos'],
  patientResponse: 'Continúa mejorando',
  finalPainLevel: 3,
  observations: 'Progreso satisfactorio',
};

const mockSession3: TreatmentSession = {
  id: 'ses-003',
  clinicalCaseId: 'caso-001',
  date: '2024-02-05T10:00:00Z',
  phaseNumber: 2,
  procedures: ['Terapia manual'],
  patientResponse: 'Sin dolor',
  finalPainLevel: 2,
  observations: 'Excelente respuesta',
};

const mockClinicalCase: ClinicalCase = {
  id: 'caso-001',
  patientId: 'pac-001',
  title: 'Dolor Lumbar Crónico',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  consultationReason: 'Dolor lumbar persistente',
  treatmentPlan: {
    id: 'plan-001',
    clinicalCaseId: 'caso-001',
    createdAt: '2024-01-01T00:00:00Z',
    objectives: {
      therapeutic: 'Reducir dolor',
      prophylactic: 'Prevenir recaídas',
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
  treatmentSessions: [mockSession1, mockSession2, mockSession3],
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
        functionalIndicator: 'Dificultad para caminar',
        clinicalAspect: 'Hipertonía lumbar',
        anatomopathology: 'Hipercifosis',
        avdConsequences: 'Limitación en AVDs',
      },
      footprints: [],
      postureVideos: [],
    },
  ],
};

describe('CaseTimeline', () => {
  const onSelectSessionMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render timeline header', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
      expect(screen.getByText('Dolor Lumbar Crónico')).toBeInTheDocument();
    });

    it('should render all phases in correct order', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      expect(screen.getByText(/Fase 1:/)).toBeInTheDocument();
      expect(screen.getByText(/Fase 2:/)).toBeInTheDocument();
      expect(screen.getByText(/Fase 3:/)).toBeInTheDocument();
    });

    it('should render phase numbering indicators', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      const phase1Indicator = screen.getByText('1');
      const phase2Indicator = screen.getAllByText('2')[0];
      const phase3Indicator = screen.getAllByText('3')[0];

      expect(phase1Indicator).toBeInTheDocument();
      expect(phase2Indicator).toBeInTheDocument();
      expect(phase3Indicator).toBeInTheDocument();
    });
  });

  describe('Session Cards', () => {
    it('should render all sessions', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      expect(screen.getAllByText(/Sesión \d+/).length).toBe(3);
    });

    it('should render session observations', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      expect(screen.getByText(/Buena respuesta/)).toBeInTheDocument();
      expect(screen.getByText(/Progreso satisfactorio/)).toBeInTheDocument();
    });

    it('should display voice note indicator when voice notes exist', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      expect(screen.getByText('Nota de voz')).toBeInTheDocument();
    });

    it('should not display voice note indicator when no voice notes', () => {
      const caseWithoutVoiceNotes: ClinicalCase = {
        ...mockClinicalCase,
        treatmentSessions: [
          {
            ...mockSession1,
            voiceNotes: undefined,
          },
        ],
      };

      render(
        <CaseTimeline
          clinicalCase={caseWithoutVoiceNotes}
          onSelectSession={onSelectSessionMock}
        />,
      );

      expect(screen.queryByText('Nota de voz')).not.toBeInTheDocument();
    });

    it('should truncate long observations with line-clamp', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      const observationCards = screen.getAllByText(/Buena respuesta/);
      observationCards.forEach((card) => {
        expect(card).toHaveClass('line-clamp-2');
      });
    });
  });

  describe('Active Session Highlighting', () => {
    it('should highlight active session with teal border', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          activeSessionId="ses-001"
          onSelectSession={onSelectSessionMock}
        />,
      );

      const activeSession = screen.getByText(/Sesión.*001/).closest('button');
      expect(activeSession).toHaveClass('border-teal-500');
    });

    it('should highlight active session with ring', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          activeSessionId="ses-001"
          onSelectSession={onSelectSessionMock}
        />,
      );

      const activeSession = screen.getByText(/Sesión.*001/).closest('button');
      expect(activeSession).toHaveClass('ring-1');
      expect(activeSession).toHaveClass('ring-teal-500');
    });

    it('should apply shadow-sm to active session', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          activeSessionId="ses-001"
          onSelectSession={onSelectSessionMock}
        />,
      );

      const activeSession = screen.getByText(/Sesión.*001/).closest('button');
      expect(activeSession).toHaveClass('shadow-sm');
    });

    it('should not highlight inactive sessions', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          activeSessionId="ses-001"
          onSelectSession={onSelectSessionMock}
        />,
      );

      const inactiveSession = screen.getByText(/Sesión.*002/).closest('button');
      expect(inactiveSession).not.toHaveClass('border-teal-500');
      expect(inactiveSession).not.toHaveClass('ring-teal-500');
    });
  });

  describe('User Interactions', () => {
    it('should call onSelectSession when session is clicked', async () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      const sessionButton = screen.getByText(/Sesión.*001/);
      await userEvent.click(sessionButton);

      expect(onSelectSessionMock).toHaveBeenCalledTimes(1);
      expect(onSelectSessionMock).toHaveBeenCalledWith('ses-001');
    });

    it('should call onSelectSession with correct session id', async () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      const sessionButton2 = screen.getByText(/Sesión.*002/);
      const sessionButton3 = screen.getByText(/Sesión.*003/);

      await userEvent.click(sessionButton2);
      expect(onSelectSessionMock).toHaveBeenCalledWith('ses-002');

      await userEvent.click(sessionButton3);
      expect(onSelectSessionMock).toHaveBeenCalledWith('ses-003');
    });

    it('should handle rapid session switching', async () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      const session1 = screen.getByText(/Sesión.*001/);
      const session2 = screen.getByText(/Sesión.*002/);
      const session3 = screen.getByText(/Sesión.*003/);

      await userEvent.click(session1);
      await userEvent.click(session2);
      await userEvent.click(session3);

      expect(onSelectSessionMock).toHaveBeenCalledTimes(3);
      expect(onSelectSessionMock).toHaveBeenNthCalledWith(1, 'ses-001');
      expect(onSelectSessionMock).toHaveBeenNthCalledWith(2, 'ses-002');
      expect(onSelectSessionMock).toHaveBeenNthCalledWith(3, 'ses-003');
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no sessions in phase', () => {
      const caseWithEmptyPhases: ClinicalCase = {
        ...mockClinicalCase,
        treatmentSessions: [],
      };

      render(
        <CaseTimeline
          clinicalCase={caseWithEmptyPhases}
          onSelectSession={onSelectSessionMock}
        />,
      );

      // Should still render phase headers
      expect(screen.getByText(/Fase 1:/)).toBeInTheDocument();
      expect(screen.getByText(/Fase 2:/)).toBeInTheDocument();

      // But no session buttons
      expect(screen.queryByText(/Sesión/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should make session cards keyboard accessible via role="button"', () => {
      render(
        <CaseTimeline
          clinicalCase={mockClinicalCase}
          onSelectSession={onSelectSessionMock}
        />,
      );

      const sessionButtons = screen.getAllByRole('button');
      expect(sessionButtons.length).toBeGreaterThan(0);
    });
  });
});
