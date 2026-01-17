import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhaseProgress } from './PhaseProgress';
import type { TreatmentPhase, TreatmentSession } from '../../../types/patient';

const mockPhases: TreatmentPhase[] = [
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
];

const mockSessions: TreatmentSession[] = [
  {
    id: 'ses-1',
    clinicalCaseId: 'case-1',
    date: '2024-01-10',
    phaseNumber: 1,
    procedures: ['Masaje'],
    patientResponse: 'Bien',
    finalPainLevel: 5,
    observations: '',
  },
  {
    id: 'ses-2',
    clinicalCaseId: 'case-1',
    date: '2024-01-17',
    phaseNumber: 1,
    procedures: ['Masaje'],
    patientResponse: 'Mejor',
    finalPainLevel: 4,
    observations: '',
  },
  {
    id: 'ses-3',
    clinicalCaseId: 'case-1',
    date: '2024-01-24',
    phaseNumber: 2,
    procedures: ['Estiramientos'],
    patientResponse: 'Progreso',
    finalPainLevel: 3,
    observations: '',
  },
];

describe('PhaseProgress', () => {
  const mockOnPhaseClick = vi.fn();

  it('should render all phases', () => {
    render(
      <PhaseProgress
        phases={mockPhases}
        currentPhase={2}
        sessions={mockSessions}
        selectedPhase={null}
        onPhaseClick={mockOnPhaseClick}
      />,
    );

    expect(screen.getByText('Inicial')).toBeInTheDocument();
    expect(screen.getByText('Temprana Intermedia')).toBeInTheDocument();
    expect(screen.getByText('Intermedia')).toBeInTheDocument();
    expect(screen.getByText('Tardía Intermedia')).toBeInTheDocument();
    expect(screen.getByText('Avanzada')).toBeInTheDocument();
  });

  it('should show session count per phase', () => {
    render(
      <PhaseProgress
        phases={mockPhases}
        currentPhase={2}
        sessions={mockSessions}
        selectedPhase={null}
        onPhaseClick={mockOnPhaseClick}
      />,
    );

    expect(screen.getByText('2 sesiones')).toBeInTheDocument();
    expect(screen.getByText('1 sesión')).toBeInTheDocument();
    expect(screen.getAllByText('0 sesiones').length).toBe(3);
  });

  it('should call onPhaseClick when phase is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PhaseProgress
        phases={mockPhases}
        currentPhase={2}
        sessions={mockSessions}
        selectedPhase={null}
        onPhaseClick={mockOnPhaseClick}
      />,
    );

    const phase1Button = screen.getByRole('button', { name: /fase 1/i });
    await user.click(phase1Button);

    expect(mockOnPhaseClick).toHaveBeenCalledWith(1);
  });

  it('should show checkmark for completed phases', () => {
    render(
      <PhaseProgress
        phases={mockPhases}
        currentPhase={2}
        sessions={mockSessions}
        selectedPhase={null}
        onPhaseClick={mockOnPhaseClick}
      />,
    );

    const phase1Button = screen.getByRole('button', { name: /fase 1/i });
    const checkIcon = phase1Button.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
  });

  it('should show "Ver todas" button when phase is selected', () => {
    render(
      <PhaseProgress
        phases={mockPhases}
        currentPhase={2}
        sessions={mockSessions}
        selectedPhase={1}
        onPhaseClick={mockOnPhaseClick}
      />,
    );

    expect(screen.getByText('Ver todas')).toBeInTheDocument();
  });

  it('should clear selection when "Ver todas" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PhaseProgress
        phases={mockPhases}
        currentPhase={2}
        sessions={mockSessions}
        selectedPhase={1}
        onPhaseClick={mockOnPhaseClick}
      />,
    );

    const clearButton = screen.getByText('Ver todas');
    await user.click(clearButton);

    expect(mockOnPhaseClick).toHaveBeenCalledWith(null);
  });
});
