import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionDetailView } from './SessionDetailView';
import type { ClinicalCase } from '../../../types/patient';
import { EvaluationType } from '../../../types/patient';

vi.mock('./TimelineSidebar', () => ({
  TimelineSidebar: ({
    clinicalCase,
    activeSessionId,
    onSelectSession,
  }: {
    clinicalCase: ClinicalCase;
    activeSessionId?: string;
    onSelectSession: (id: string) => void;
  }) => (
    <div data-testid="timeline-sidebar-mock">
      <span>Sidebar: {clinicalCase.title}</span>
      <span>Active: {activeSessionId}</span>
      <button onClick={() => onSelectSession('ses-002')}>
        Select Session 2
      </button>
    </div>
  ),
}));

vi.mock('../PosturogramViewer', () => ({
  PosturogramViewer: () => (
    <div data-testid="posturogram-viewer-mock">Posturogram</div>
  ),
}));

const mockClinicalCase: ClinicalCase = {
  id: 'case-001',
  patientId: 'patient-001',
  title: 'Dolor Lumbar Cronico',
  status: 'active',
  startDate: '2024-01-01',
  consultationReason: 'Dolor persistente',
  treatmentPlan: {
    id: 'plan-001',
    clinicalCaseId: 'case-001',
    createdAt: '2024-01-01',
    objectives: {
      therapeutic: 'Reducir dolor',
      prophylactic: 'Prevenir recaidas',
      educational: 'Educar sobre postura',
    },
    phases: [
      {
        number: 1,
        name: 'Alivio',
        durationWeeks: 4,
        techniques: ['Masaje'],
        objectives: 'Reducir dolor',
      },
    ],
  },
  treatmentSessions: [
    {
      id: 'ses-001',
      clinicalCaseId: 'case-001',
      date: '2024-01-15',
      phaseNumber: 1,
      procedures: ['Masaje lumbar', 'Estiramientos'],
      patientResponse: 'Paciente reporta mejoria leve',
      finalPainLevel: 4,
      observations: 'Buena respuesta al tratamiento',
      voiceNotes: [
        {
          id: 'vn-001',
          type: 'evolution',
          date: '2024-01-15',
          audioUrl: 'https://example.com/audio.mp3',
          transcription: 'Paciente progresa adecuadamente',
          durationSeconds: 45,
        },
      ],
    },
    {
      id: 'ses-002',
      clinicalCaseId: 'case-001',
      date: '2024-01-22',
      phaseNumber: 1,
      procedures: ['Terapia manual'],
      patientResponse: 'Dolor reducido significativamente',
      finalPainLevel: 2,
      observations: '',
    },
  ],
  evaluations: [
    {
      id: 'eval-initial',
      clinicalCaseId: 'case-001',
      date: '2024-01-01',
      type: EvaluationType.INITIAL,
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
          interpretation: 'Independiente',
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
          interpretation: 'Independiente',
        },
      },
      painScale: { activity: 7, rest: 4, palpation: 6, type: 'chronic' },
      diagnosis: {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
      footprints: [
        {
          id: 'fp-1',
          evaluationId: 'eval-initial',
          type: 'initial',
          date: '2024-01-01',
          url: 'https://example.com/before.jpg',
        },
      ],
      postureVideos: [],
    },
    {
      id: 'eval-final',
      clinicalCaseId: 'case-001',
      date: '2024-02-01',
      type: EvaluationType.FINAL,
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
          interpretation: 'Independiente',
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
          interpretation: 'Independiente',
        },
      },
      painScale: { activity: 3, rest: 1, palpation: 2, type: 'chronic' },
      diagnosis: {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
      footprints: [
        {
          id: 'fp-2',
          evaluationId: 'eval-final',
          type: 'final',
          date: '2024-02-01',
          url: 'https://example.com/after.jpg',
        },
      ],
      postureVideos: [],
    },
  ],
};

describe('SessionDetailView', () => {
  const mockOnSelectSession = vi.fn();

  beforeEach(() => {
    mockOnSelectSession.mockClear();
  });

  it('should render the timeline sidebar', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByTestId('timeline-sidebar-mock')).toBeInTheDocument();
  });

  it('should pass activeSessionId to sidebar', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('Active: ses-001')).toBeInTheDocument();
  });

  it('should display session report when session is selected', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('Reporte de Evolucion')).toBeInTheDocument();
  });

  it('should display pain level', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('4/10')).toBeInTheDocument();
    expect(screen.getByText('Dolor END')).toBeInTheDocument();
  });

  it('should display techniques applied', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('Masaje lumbar')).toBeInTheDocument();
    expect(screen.getByText('Estiramientos')).toBeInTheDocument();
  });

  it('should display patient response', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(
      screen.getByText('Paciente reporta mejoria leve'),
    ).toBeInTheDocument();
  });

  it('should display observations', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(
      screen.getByText('Buena respuesta al tratamiento'),
    ).toBeInTheDocument();
  });

  it('should display voice note transcription when available', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(
      screen.getByText(/"Paciente progresa adecuadamente"/),
    ).toBeInTheDocument();
  });

  it('should show placeholder when no session is selected', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId={undefined}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(
      screen.getByText('Selecciona una sesion para ver los detalles'),
    ).toBeInTheDocument();
  });

  it('should render posturogram when footprints are available', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByTestId('posturogram-viewer-mock')).toBeInTheDocument();
  });

  it('should call onSelectSession from sidebar', async () => {
    const user = userEvent.setup();
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    await user.click(screen.getByText('Select Session 2'));

    expect(mockOnSelectSession).toHaveBeenCalledWith('ses-002');
  });

  it('should format session date correctly', () => {
    render(
      <SessionDetailView
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-001"
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText(/lunes, 15 de enero de 2024/i)).toBeInTheDocument();
  });
});
