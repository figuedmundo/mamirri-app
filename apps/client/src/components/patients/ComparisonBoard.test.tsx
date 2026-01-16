import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparisonBoard } from './ComparisonBoard';
import type { ClinicalCase } from '../../types/patient';

describe('ComparisonBoard', () => {
  const onExportMock = vi.fn();
  const onShareMock = vi.fn();

  const mockCase: ClinicalCase = {
    id: 'c1',
    patientId: 'p1',
    title: 'Test Case',
    status: 'active',
    startDate: '2026-01-01',
    consultationReason: 'Reason',
    treatmentPlan: {
      id: 'tp1',
      clinicalCaseId: 'c1',
      createdAt: '2026-01-01',
      objectives: { therapeutic: '', prophylactic: '', educational: '' },
      phases: [],
    },
    treatmentSessions: [],
    evaluations: [
      {
        id: 'e1',
        clinicalCaseId: 'c1',
        date: '2026-01-01',
        type: 'INITIAL',
        posturogram: {},
        orthopedicTests: {
          thomas: { result: 'Negative', interpretation: '' },
          ely: { result: 'Negative', interpretation: '' },
          ober: { result: 'Negative', interpretation: '' },
          schober: { result: 13, interpretation: '' },
        },
        avdEvaluation: {
          barthel: {
            total: 100,
            interpretation: '',
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
          },
          lawton: {
            total: 8,
            interpretation: '',
            phoneUse: 1,
            shopping: 1,
            foodPreparation: 1,
            housekeeping: 1,
            laundry: 1,
            transportation: 1,
            medication: 1,
            finances: 1,
          },
        },
        painScale: { activity: 5, rest: 0, palpation: 0, type: 'chronic' },
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onExport when export button is clicked', async () => {
    render(
      <ComparisonBoard
        clinicalCase={mockCase}
        onExport={onExportMock}
        onShare={onShareMock}
      />,
    );

    const exportButton = screen.getByText('Exportar Informe');
    await userEvent.click(exportButton);

    expect(onExportMock).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when exporting', async () => {
    let resolveExport: (value: void) => void;
    const exportPromise = new Promise<void>((resolve) => {
      resolveExport = resolve;
    });
    onExportMock.mockReturnValue(exportPromise);

    render(
      <ComparisonBoard
        clinicalCase={mockCase}
        onExport={onExportMock}
        onShare={onShareMock}
      />,
    );

    const exportButton = screen.getByText('Exportar Informe').closest('button');
    if (!exportButton) throw new Error('Export button not found');

    await userEvent.click(exportButton);

    expect(exportButton).toBeDisabled();

    resolveExport!();

    await waitFor(() => {
      expect(exportButton).not.toBeDisabled();
    });
  });
});
