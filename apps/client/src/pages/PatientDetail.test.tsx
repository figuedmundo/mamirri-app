import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PatientDetail from './PatientDetail';

const mockNavigate = vi.fn();
const mutateCreateCase = vi.fn();

const patientWithNoActiveCase = {
  id: 'p1',
  name: 'Paciente Uno',
  occupation: 'Terapeuta',
  phone: '123456',
  birthDate: '1990-01-01',
  emergencyContact: { name: 'Contacto', phone: '999' },
  medicalFlags: [],
  isActive: true,
  createdAt: '2025-01-01',
  clinicalCases: [
    {
      id: 'c2',
      patientId: 'p1',
      title: 'Caso completado',
      status: 'completed',
      startDate: '2025-01-01',
      consultationReason: 'Seguimiento',
      evaluations: [],
      treatmentPlan: {
        id: 'tp',
        clinicalCaseId: 'c2',
        createdAt: '2025-01-01',
        objectives: { therapeutic: '', prophylactic: '', educational: '' },
        phases: [],
      },
      treatmentSessions: [],
    },
  ],
};

const patientWithActiveCase = {
  ...patientWithNoActiveCase,
  clinicalCases: [
    {
      ...patientWithNoActiveCase.clinicalCases[0],
      id: 'c1',
      status: 'active',
      title: 'Caso activo',
    },
  ],
};

let patientData = patientWithNoActiveCase;

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'p1' }),
  useNavigate: () => mockNavigate,
}));

vi.mock('../hooks/use-patients', () => ({
  usePatientQuery: () => ({
    data: patientData,
    isLoading: false,
    isError: false,
  }),
  useUpdatePatient: () => ({ mutateAsync: vi.fn() }),
  useCreateCase: () => ({ mutateAsync: mutateCreateCase, isPending: false }),
  useUpdateCase: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-media', () => ({
  useUploadEvaluationVoiceNote: () => ({ mutateAsync: vi.fn() }),
  useUploadPostureVideo: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('../hooks/use-voice-recorder', () => ({
  useVoiceRecorder: () => ({
    isRecording: false,
    duration: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    cancelRecording: vi.fn(),
    error: null,
  }),
}));

vi.mock('../components/patients/PatientProfile', () => ({
  PatientProfile: ({ onCreateCase }: { onCreateCase?: () => void }) => (
    <button onClick={onCreateCase}>Open Create Case</button>
  ),
}));

vi.mock('../components/patients/PatientForm', () => ({
  PatientForm: () => <div>PatientForm</div>,
}));

vi.mock('../components/patients/VideoRecorder', () => ({
  VideoRecorder: () => <div>VideoRecorder</div>,
}));

vi.mock('../components/patients/RecordingFloatingBar', () => ({
  RecordingFloatingBar: () => <div>RecordingFloatingBar</div>,
}));

describe('PatientDetail create case flow', () => {
  beforeEach(() => {
    patientData = patientWithNoActiveCase;
    mutateCreateCase.mockReset();
    mutateCreateCase.mockResolvedValue({ id: 'new-case' });
  });

  it('opens case creation dialog from Nuevo Caso action', () => {
    render(<PatientDetail />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Create Case' }));

    expect(screen.getByText('Nuevo Caso Clinico')).toBeInTheDocument();
    expect(screen.getByLabelText('Titulo *')).toBeInTheDocument();
  });

  it('validates title and submits correctly when valid', async () => {
    render(<PatientDetail />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Create Case' }));

    fireEvent.change(screen.getByLabelText('Titulo *'), {
      target: { value: 'Do' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Caso' }));
    expect(
      screen.getByText('El titulo debe tener al menos 3 caracteres.'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Titulo *'), {
      target: { value: 'Dolor de hombro' },
    });
    fireEvent.change(screen.getByLabelText('Motivo de consulta'), {
      target: { value: 'Molestia al elevar brazo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Caso' }));

    await waitFor(() => {
      expect(mutateCreateCase).toHaveBeenCalledWith({
        patientId: 'p1',
        title: 'Dolor de hombro',
        consultationReason: 'Molestia al elevar brazo',
      });
    });
  });

  it('shows confirmation AlertDialog when active case exists', async () => {
    patientData = patientWithActiveCase;
    render(<PatientDetail />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Create Case' }));

    fireEvent.change(screen.getByLabelText('Titulo *'), {
      target: { value: 'Caso nuevo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Caso' }));

    expect(
      screen.getByText('Este paciente ya tiene un caso activo'),
    ).toBeInTheDocument();
    expect(mutateCreateCase).not.toHaveBeenCalled();
  });

  it('submits directly without confirmation when no active case exists', async () => {
    patientData = patientWithNoActiveCase;
    render(<PatientDetail />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Create Case' }));

    fireEvent.change(screen.getByLabelText('Titulo *'), {
      target: { value: 'Caso preventivo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Caso' }));

    await waitFor(() => {
      expect(mutateCreateCase).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.queryByText('Este paciente ya tiene un caso activo'),
    ).not.toBeInTheDocument();
  });
});
