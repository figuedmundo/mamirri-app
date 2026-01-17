import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ObjectivesView } from './ObjectivesView';
import type { ClinicalCase } from '../../types/patient';

const mockClinicalCase: ClinicalCase = {
  id: 'case-1',
  patientId: 'patient-1',
  title: 'Lower Back Pain',
  status: 'active',
  startDate: '2024-01-15',
  consultationReason: 'Chronic lower back pain',
  evaluations: [],
  treatmentPlan: {
    id: 'plan-1',
    clinicalCaseId: 'case-1',
    createdAt: '2024-01-15',
    objectives: {
      therapeutic: 'Reducir dolor de 9/10 a 3/10',
      prophylactic: 'Prevenir recurrencia',
      educational: 'Enseñar postura correcta',
    },
    phases: [],
  },
  treatmentSessions: [],
};

const mockEmptyClinicalCase: ClinicalCase = {
  ...mockClinicalCase,
  treatmentPlan: {
    ...mockClinicalCase.treatmentPlan,
    objectives: {
      therapeutic: '',
      prophylactic: '',
      educational: '',
    },
  },
};

vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../hooks/use-debounce', () => ({
  useDebounce: <T,>(fn: T): T => fn,
}));

describe('ObjectivesView', () => {
  const mockOnObjectivesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders three objective cards', () => {
    render(
      <ObjectivesView
        clinicalCase={mockClinicalCase}
        onObjectivesChange={mockOnObjectivesChange}
      />,
    );

    expect(screen.getByText('Objetivo Terapéutico')).toBeInTheDocument();
    expect(screen.getByText('Objetivo Profiláctico')).toBeInTheDocument();
    expect(screen.getByText('Objetivo Educativo')).toBeInTheDocument();
  });

  it('displays existing objectives from clinicalCase prop', () => {
    render(
      <ObjectivesView
        clinicalCase={mockClinicalCase}
        onObjectivesChange={mockOnObjectivesChange}
      />,
    );

    expect(
      screen.getByDisplayValue('Reducir dolor de 9/10 a 3/10'),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Prevenir recurrencia'),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Enseñar postura correcta'),
    ).toBeInTheDocument();
  });

  it('calls onObjectivesChange callback when text changes', async () => {
    mockOnObjectivesChange.mockResolvedValue(undefined);

    render(
      <ObjectivesView
        clinicalCase={mockClinicalCase}
        onObjectivesChange={mockOnObjectivesChange}
      />,
    );

    const therapeuticTextarea = screen.getByDisplayValue(
      'Reducir dolor de 9/10 a 3/10',
    );
    fireEvent.change(therapeuticTextarea, {
      target: { value: 'Nuevo objetivo terapéutico' },
    });

    await waitFor(() => {
      expect(mockOnObjectivesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          therapeutic: 'Nuevo objetivo terapéutico',
        }),
      );
    });
  });

  it('shows empty state when all objectives are empty strings', () => {
    render(
      <ObjectivesView
        clinicalCase={mockEmptyClinicalCase}
        onObjectivesChange={mockOnObjectivesChange}
      />,
    );

    expect(
      screen.getByText('Define los objetivos del tratamiento'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Establece las metas terapéuticas/),
    ).toBeInTheDocument();
  });

  it('shows header with title when objectives exist', () => {
    render(
      <ObjectivesView
        clinicalCase={mockClinicalCase}
        onObjectivesChange={mockOnObjectivesChange}
      />,
    );

    expect(screen.getByText('Objetivos del Tratamiento')).toBeInTheDocument();
  });

  it('handles save error gracefully', async () => {
    mockOnObjectivesChange.mockRejectedValue(new Error('Save failed'));

    render(
      <ObjectivesView
        clinicalCase={mockClinicalCase}
        onObjectivesChange={mockOnObjectivesChange}
      />,
    );

    const therapeuticTextarea = screen.getByDisplayValue(
      'Reducir dolor de 9/10 a 3/10',
    );
    fireEvent.change(therapeuticTextarea, {
      target: { value: 'Updated value' },
    });

    await waitFor(() => {
      expect(mockOnObjectivesChange).toHaveBeenCalled();
    });
  });
});
