import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CaseDetailLayout } from './CaseDetailLayout';
import type { Patient, ClinicalCase } from '../../types/patient';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '../ui/toaster';

vi.mock('../../api/patients', () => ({
  patientsApi: {
    updateEvaluation: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../api/media', () => ({
  mediaApi: {
    uploadEvaluationVoiceNote: vi.fn().mockResolvedValue({ id: 'vn1' }),
  },
}));

vi.mock('../../lib/pdf', () => ({
  generateComparisonReport: vi.fn(),
}));

const mockPatient: Patient = {
  id: 'p1',
  name: 'Juan Perez',
  age: 30,
  occupation: 'Desarrollador',
  phone: '+34 600 123 456',
  email: 'juan@example.com',
  birthDate: '1994-05-15',
  isActive: true,
  createdAt: '2025-01-01',
  clinicalCases: [],
};

const mockCase: ClinicalCase = {
  id: 'c1',
  patientId: 'p1',
  title: 'Dolor Lumbar',
  status: 'active',
  startDate: '2025-01-10',
  consultationReason: 'Dolor lumbar',
  evaluations: [
    {
      id: 'e1',
      clinicalCaseId: 'c1',
      date: '2025-01-10',
      type: 'INITIAL',
      posturogram: {},
      orthopedicTests: {
        thomas: { result: 'negative', interpretation: '' },
        ely: { result: 'negative', interpretation: '' },
        ober: { result: 'negative', interpretation: '' },
        schober: { result: 'negative', interpretation: '' },
      },
      avdEvaluation: {
        barthel: {
          total: 0,
          feeding: 0,
          bathing: 0,
          grooming: 0,
          dressing: 0,
          bowels: 0,
          bladder: 0,
          toiletUse: 0,
          transfers: 0,
          mobility: 0,
          stairs: 0,
          interpretation: '',
        },
        lawton: {
          total: 0,
          phoneUse: 0,
          shopping: 0,
          foodPreparation: 0,
          housekeeping: 0,
          laundry: 0,
          transportation: 0,
          medication: 0,
          finances: 0,
          interpretation: '',
        },
      },
      painScale: { activity: 7, rest: 4, palpation: 6, type: 'chronic' },
      diagnosis: {
        functionalIndicator: 'Limitacion functional',
        clinicalAspect: 'Dolor',
        anatomopathology: 'Artrosis',
        avdConsequences: 'Limitacion',
      },
      footprints: [],
      postureVideos: [],
    },
  ],
  treatmentPlan: {
    id: 'tp1',
    clinicalCaseId: 'c1',
    createdAt: '2025-01-10',
    objectives: {
      therapeutic: 'Reducir dolor',
      prophylactic: '',
      educational: '',
    },
    phases: [],
  },
  treatmentSessions: [],
};

const mockStream = {
  getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
};

const mockMediaRecorder = {
  start: vi.fn().mockImplementation(() => {
    mockMediaRecorder.state = 'recording';
  }),
  stop: vi.fn().mockImplementation(() => {
    mockMediaRecorder.state = 'inactive';
  }),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
};

describe('ZeroFrictionVoiceFlow Integration', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
    });

    (window as unknown as { MediaRecorder: unknown }).MediaRecorder = vi.fn(
      function () {
        return mockMediaRecorder;
      },
    );

    window.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    window.URL.revokeObjectURL = vi.fn();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('starts recording immediately and shows floating bar when "Grabar Evolucion" is clicked', async () => {
    render(
      <MemoryRouter>
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockCase}
          onBack={vi.fn()}
        />
        <Toaster />
      </MemoryRouter>,
    );

    const recordButton = screen.getByRole('button', {
      name: /grabar evolucion/i,
    });

    await act(async () => {
      fireEvent.click(recordButton);
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    expect(mockMediaRecorder.start).toHaveBeenCalled();
    expect(screen.getAllByText(/grabando/i).length).toBeGreaterThanOrEqual(1);

    expect(recordButton).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:02')).toBeInTheDocument();
  });

  it('stops recording and auto-saves when stop button is clicked', async () => {
    render(
      <MemoryRouter>
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockCase}
          onBack={vi.fn()}
        />
        <Toaster />
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /grabar evolucion/i }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const stopButton = screen.getByLabelText('Detener grabación');
    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();

    await act(async () => {
      if (mockMediaRecorder.onstop) {
        (mockMediaRecorder as unknown as { onstop: () => void }).onstop();
      }
    });

    vi.useRealTimers();

    await waitFor(
      () => {
        expect(
          screen.getByText('Nota de voz guardada correctamente.'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByText('Deshacer')).toBeInTheDocument();
    expect(screen.queryByText(/grabando/i)).not.toBeInTheDocument();
  });

  it('shows error toast when microphone permission is denied', async () => {
    const error = new Error('Permission denied');
    (
      navigator.mediaDevices.getUserMedia as unknown as {
        mockRejectedValue: (e: Error) => void;
      }
    ).mockRejectedValue(error);

    render(
      <MemoryRouter>
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockCase}
          onBack={vi.fn()}
        />
        <Toaster />
      </MemoryRouter>,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /grabar evolucion/i }),
      );
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(
        screen.getByText(/permite el acceso al micrófono/i),
      ).toBeInTheDocument();
    });
  });
});
