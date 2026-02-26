import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PatientProfile } from './PatientProfile';
import type { Patient, TreatmentPhase } from '../../types/patient';

vi.mock('../../api/media', () => ({
  mediaApi: {
    uploadFootprint: vi.fn().mockResolvedValue({}),
    uploadPostureVideo: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('./CameraCapture', () => ({
  CameraCapture: ({
    onCapture,
  }: {
    onCapture: (blob: Blob, meta: unknown) => void;
  }) => (
    <button
      onClick={() =>
        onCapture(new Blob(), {
          overlayType: 'footprint-left',
          width: 100,
          height: 100,
          timestamp: Date.now(),
        })
      }
    >
      Mock Capture
    </button>
  ),
}));

vi.mock('./VideoRecorder', () => ({
  VideoRecorder: ({
    onCapture,
  }: {
    onCapture: (blob: Blob, meta: unknown) => void;
  }) => (
    <button onClick={() => onCapture(new Blob(), { durationSeconds: 10 })}>
      Mock Video Capture
    </button>
  ),
}));

const mockPhases: TreatmentPhase[] = [
  {
    number: 1,
    name: 'Inicial',
    durationWeeks: 3,
    objectives: 'Alivio del dolor',
    techniques: ['Movilizaciones', 'Crioterapia'],
  },
  {
    number: 2,
    name: 'Temprana Intermedia',
    durationWeeks: 3,
    objectives: 'Iniciar estiramientos',
    techniques: ['Estiramientos suaves'],
  },
  {
    number: 3,
    name: 'Intermedia',
    durationWeeks: 3,
    objectives: 'Ganancia de flexibilidad',
    techniques: ['Estiramientos progresivos'],
  },
  {
    number: 4,
    name: 'Tardía Intermedia',
    durationWeeks: 3,
    objectives: 'Fortalecimiento muscular',
    techniques: ['Ejercicios terapéuticos'],
  },
  {
    number: 5,
    name: 'Avanzada',
    durationWeeks: 3,
    objectives: 'Preparación para alta',
    techniques: ['Fortalecimiento funcional'],
  },
];

const mockPatient: Patient = {
  id: 'p1',
  name: 'Juan Perez',
  occupation: 'Desarrollador',
  phone: '+34 600 123 456',
  email: 'juan@example.com',
  birthDate: '1994-05-15',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '987654321',
  },
  medicalFlags: [],
  isActive: true,
  createdAt: '2025-01-01',
  clinicalCases: [
    {
      id: 'c1',
      patientId: 'p1',
      title: 'Dolor Lumbar Cronico',
      status: 'active',
      startDate: '2025-01-10',
      consultationReason: 'Dolor en zona lumbar persistente',
      evaluations: [
        {
          id: 'e1',
          clinicalCaseId: 'c1',
          date: '2025-01-10',
          posturogram: {},
          orthopedicTests: {
            thomas: { result: 'negative', interpretation: '' },
            ely: { result: 'negative', interpretation: '' },
            ober: { result: 'negative', interpretation: '' },
            schober: { result: 'negative', interpretation: '' },
          },
          avdEvaluation: {
            barthel: {
              total: 90,
              feeding: 10,
              bathing: 5,
              grooming: 5,
              dressing: 10,
              bowels: 10,
              bladder: 10,
              toiletUse: 10,
              transfers: 15,
              mobility: 10,
              stairs: 5,
              interpretation: 'Dependencia leve',
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
              interpretation: 'Independiente',
            },
          },
          painScale: { activity: 7, rest: 4, palpation: 6, type: 'chronic' },
          diagnosis: {
            functionalIndicator: 'Limitacion funcional moderada',
            clinicalAspect: 'Dolor cronico lumbar',
            anatomopathology: 'Artrosis lumbar',
            avdConsequences: 'Dificultad para agacharse',
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
          therapeutic: 'Reducir dolor de 7/10 a 4/10',
          prophylactic: 'Prevenir recaidas',
          educational: 'Higiene postural',
        },
        phases: mockPhases,
        protocols: [
          {
            treatmentPlanId: 'tp1',
            protocolId: 'prot-1',
            addedAt: '2025-01-10',
            notes: 'Uso en fase inicial',
            protocol: {
              id: 'prot-1',
              title: 'Posición de Esfinge',
              tags: ['McKenzie'],
            },
          },
        ],
      },
      treatmentSessions: [
        {
          id: 's1',
          clinicalCaseId: 'c1',
          date: '2025-01-15',
          phaseNumber: 1,
          procedures: ['Masaje'],
          patientResponse: 'Buena',
          finalPainLevel: 6,
          observations: 'Mejoria leve',
        },
      ],
    },
  ],
};

describe('PatientProfile', () => {
  it('renders patient name and status badge', () => {
    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getAllByText('Activo').length).toBeGreaterThanOrEqual(1);
  });

  it('renders patient info grid with all fields', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-03'));

    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('31 años')).toBeInTheDocument();
    expect(screen.getByText('Desarrollador')).toBeInTheDocument();
    expect(screen.getByText('+34 600 123 456')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Nacido:/)).toBeInTheDocument();
    expect(screen.getByText(/Expediente creado/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders action buttons and triggers callbacks', async () => {
    const onVoiceDictation = vi.fn();
    const onCaptureFootprint = vi.fn();
    const onCaptureVideo = vi.fn();
    const onSchedule = vi.fn();
    const onEdit = vi.fn();

    render(
      <PatientProfile
        patient={mockPatient}
        onVoiceDictation={onVoiceDictation}
        onCaptureFootprint={onCaptureFootprint}
        onCaptureVideo={onCaptureVideo}
        onSchedule={onSchedule}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByText('Dictar nota'));
    expect(onVoiceDictation).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Huella'));

    fireEvent.click(screen.getByText('Mock Capture'));

    await waitFor(() => {
      expect(onCaptureFootprint).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Video'));
    fireEvent.click(screen.getByText('Mock Video Capture'));
    await waitFor(() => {
      expect(onCaptureVideo).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Agendar'));
    expect(onSchedule).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Editar'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('renders clinical case card with title and status', () => {
    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('Casos Clínicos')).toBeInTheDocument();
    expect(screen.getByText('Dolor Lumbar Cronico')).toBeInTheDocument();
    expect(
      screen.getByText('Dolor en zona lumbar persistente'),
    ).toBeInTheDocument();
  });

  it('renders pain scale with 3 progress bars', () => {
    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('Escala de Dolor')).toBeInTheDocument();
    expect(screen.getByText('Actividad')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('Reposo')).toBeInTheDocument();
    expect(screen.getByText('4/10')).toBeInTheDocument();
    expect(screen.getByText('Palpación')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
    expect(screen.getByText(/Crónico/)).toBeInTheDocument();
  });

  it('renders treatment phases with technique chips', () => {
    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('Fases del Tratamiento')).toBeInTheDocument();
    expect(screen.getByText('Inicial')).toBeInTheDocument();
    expect(screen.getAllByText('3 sem').length).toBeGreaterThan(0);
    expect(screen.getByText('Movilizaciones')).toBeInTheDocument();
    expect(screen.getByText('Crioterapia')).toBeInTheDocument();
  });

  it('renders attached treatment plan protocols when present', () => {
    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('Protocolos Adjuntos')).toBeInTheDocument();
    expect(screen.getByText('Posición de Esfinge')).toBeInTheDocument();
  });

  it('renders sessions footer with count', () => {
    render(<PatientProfile patient={mockPatient} />);

    expect(screen.getByText('Sesiones registradas')).toBeInTheDocument();
    expect(screen.getByText('Última sesión:')).toBeInTheDocument();
  });

  it('renders empty state when no clinical cases', () => {
    const patientWithoutCases = { ...mockPatient, clinicalCases: [] };
    render(<PatientProfile patient={patientWithoutCases} />);

    expect(screen.getByText('Sin casos clínicos')).toBeInTheDocument();
  });

  it('calls onViewCase when clicking on case card', () => {
    const onViewCase = vi.fn();
    render(<PatientProfile patient={mockPatient} onViewCase={onViewCase} />);

    const caseCard = screen
      .getByText('Dolor Lumbar Cronico')
      .closest('div[class*="cursor-pointer"]');
    fireEvent.click(caseCard!);

    expect(onViewCase).toHaveBeenCalledWith('c1');
  });
});
