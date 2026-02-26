import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimelineSidebar } from './TimelineSidebar';
import type { ClinicalCase } from '../../../types/patient';

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
        name: 'Inicial',
        durationWeeks: 3,
        techniques: ['Movilizaciones'],
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
  treatmentSessions: [
    {
      id: 'ses-001',
      clinicalCaseId: 'case-001',
      date: '2024-01-10',
      phaseNumber: 1,
      procedures: ['Masaje lumbar'],
      patientResponse: 'Mejoria leve',
      finalPainLevel: 6,
      observations: 'Continuar con movilizacion suave',
    },
    {
      id: 'ses-002',
      clinicalCaseId: 'case-001',
      date: '2024-01-20',
      phaseNumber: 1,
      procedures: ['Estiramientos'],
      patientResponse: 'Mejoria moderada',
      finalPainLevel: 5,
      observations: 'Introducir ejercicios de fortalecimiento',
      voiceNotes: [
        {
          id: 'vn-001',
          type: 'evolution',
          date: '2024-01-20',
          audioUrl: 'https://example.com/audio.mp3',
          transcription: 'Paciente progresa bien',
          durationSeconds: 30,
          transcriptionStatus: 'completed',
        },
      ],
    },
    {
      id: 'ses-003',
      clinicalCaseId: 'case-001',
      date: '2024-02-01',
      phaseNumber: 2,
      procedures: ['Ejercicios de cadera'],
      patientResponse: 'Progreso significativo',
      finalPainLevel: 4,
      observations: 'Continuar fortalecimiento',
    },
  ],
  evaluations: [
    {
      id: 'eval-001',
      clinicalCaseId: 'case-001',
      date: '2024-01-01',
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
      footprints: [],
      postureVideos: [],
    },
  ],
};

describe('TimelineSidebar', () => {
  const mockOnSelectSession = vi.fn();

  beforeEach(() => {
    mockOnSelectSession.mockClear();
  });

  it('should render the case title', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('Dolor Lumbar Cronico')).toBeInTheDocument();
  });

  it('should render all phases', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText(/Fase 1: Inicial/)).toBeInTheDocument();
    expect(screen.getByText(/Fase 2: Temprana Intermedia/)).toBeInTheDocument();
    expect(screen.getByText(/Fase 3: Intermedia/)).toBeInTheDocument();
    expect(screen.getByText(/Fase 4: Tardía Intermedia/)).toBeInTheDocument();
    expect(screen.getByText(/Fase 5: Avanzada/)).toBeInTheDocument();
  });

  it('should display phase duration', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getAllByText('3 semanas').length).toBe(5);
  });

  it('should group sessions under correct phases', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    const sessionButtons = screen.getAllByRole('button');
    expect(sessionButtons.length).toBe(3);
  });

  it('should call onSelectSession when session is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    const sessionButtons = screen.getAllByRole('button');
    await user.click(sessionButtons[0]);

    expect(mockOnSelectSession).toHaveBeenCalledWith('ses-001');
  });

  it('should highlight active session', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        activeSessionId="ses-002"
        onSelectSession={mockOnSelectSession}
      />,
    );

    const sessionButtons = screen.getAllByRole('button');
    expect(sessionButtons[1]).toHaveClass('ring-1', 'ring-teal-500');
  });

  it('should display session observations', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(
      screen.getByText('Continuar con movilizacion suave'),
    ).toBeInTheDocument();
  });

  it('should show voice note indicator when session has voice notes', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('Nota de voz')).toBeInTheDocument();
  });

  it('should display session dates', () => {
    render(
      <TimelineSidebar
        clinicalCase={mockClinicalCase}
        onSelectSession={mockOnSelectSession}
      />,
    );

    expect(screen.getByText('10 ene')).toBeInTheDocument();
    expect(screen.getByText('20 ene')).toBeInTheDocument();
  });
});
