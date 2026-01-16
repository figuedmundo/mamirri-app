import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PatientProfile } from './PatientProfile';
import { patientsApi } from '../../api/patients';
import { useToast } from '../../hooks/use-toast';
import type { Patient } from '../../types/patient';

vi.mock('../../api/patients', () => ({
  patientsApi: {
    updateEvaluation: vi.fn(),
  },
}));

vi.mock('../../hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

const mockToast = vi.fn();

const mockPatient: Patient = {
  id: 'p1',
  name: 'Juan Perez',
  age: 30,
  occupation: 'Dev',
  phone: '123456',
  birthDate: '1990-01-01',
  isActive: true,
  createdAt: '2023-01-01',
  clinicalCases: [
    {
      id: 'c1',
      patientId: 'p1',
      title: 'Back Pain',
      status: 'active',
      startDate: '2023-01-01',
      consultationReason: 'Pain',
      evaluation: {
        id: 'e1',
        clinicalCaseId: 'c1',
        date: '2023-01-01',
        posturogram: {},
        orthopedicTests: {
          thomas: { result: 'negative', interpretation: '' },
          ely: { result: 'negative', interpretation: '' },
          ober: { result: 'negative', interpretation: '' },
          schober: { result: 'negative', interpretation: '' },
        },
        avdEvaluation: {
          barthel: {
            total: 100,
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
            interpretation: 'Independent',
          },
          lawton: {
            total: 8,
            phoneUse: 1,
            shopping: 1,
            foodPreparation: 1,
            housekeeping: 1,
            laundry: 1,
            transportation: 1,
            medication: 1,
            finances: 1,
            interpretation: 'Independent',
          },
        },
        painScale: { activity: 5, rest: 2, palpation: 3, type: 'acute' },
        diagnosis: {
          functionalIndicator: '',
          clinicalAspect: '',
          anatomopathology: '',
          avdConsequences: '',
        },
        footprints: [],
        postureVideos: [],
      },
      treatmentPlan: {
        id: 'tp1',
        clinicalCaseId: 'c1',
        createdAt: '2023-01-01',
        objectives: { therapeutic: '', prophylactic: '', educational: '' },
        phases: [],
      },
      treatmentSessions: [],
    },
  ],
};

describe('PatientProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it('calls handleSaveEvaluation when "Nueva Evaluación" is clicked', async () => {
    render(<PatientProfile patient={mockPatient} />);

    const button = screen.getByText('Nueva Evaluación').closest('button');
    fireEvent.click(button!);

    await waitFor(() => {
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith(
        'e1',
        expect.objectContaining({ id: 'e1' }),
      );
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Evaluación guardada' }),
      );
    });
  });

  it('calls handlePainScaleChange when Pain MetricCard is clicked', async () => {
    render(<PatientProfile patient={mockPatient} />);

    const card = screen.getByText('Nivel de Dolor').closest('div');
    fireEvent.click(card!);

    await waitFor(() => {
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith('e1', {
        painScale: expect.objectContaining({ activity: 6 }),
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Escala de dolor actualizada' }),
      );
    });
  });

  it('calls handlePosturogramChange when Barthel MetricCard is clicked', async () => {
    render(<PatientProfile patient={mockPatient} />);

    const card = screen.getByText('Índice Barthel').closest('div');
    fireEvent.click(card!);

    await waitFor(() => {
      expect(patientsApi.updateEvaluation).toHaveBeenCalledWith('e1', {
        posturogram: {},
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Posturograma actualizado' }),
      );
    });
  });
});
