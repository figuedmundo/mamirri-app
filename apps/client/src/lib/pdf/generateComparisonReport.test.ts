import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateComparisonReport } from './generateComparisonReport';
import type { ClinicalCase, Patient } from '@/types/patient';

const { saveMock } = vi.hoisted(() => {
  return { saveMock: vi.fn() };
});

vi.mock('jspdf', () => {
  return {
    jsPDF: class {
      constructor() {
        return {
          setFontSize: vi.fn(),
          setFont: vi.fn(),
          setTextColor: vi.fn(),
          text: vi.fn(),
          addImage: vi.fn(),
          addPage: vi.fn(),
          save: saveMock,
          rect: vi.fn(),
          roundedRect: vi.fn(),
          line: vi.fn(),
          setDrawColor: vi.fn(),
          setLineWidth: vi.fn(),
          setFillColor: vi.fn(),
          splitTextToSize: vi.fn().mockReturnValue([]),
          getNumberOfPages: vi.fn().mockReturnValue(1),
          setPage: vi.fn(),
          internal: {
            pageSize: {
              getWidth: () => 210,
              getHeight: () => 297,
            },
          },
        };
      }
    },
  };
});

vi.mock('html2canvas', () => vi.fn());

vi.mock('./fetchImageAsBase64', () => ({
  fetchImageAsBase64: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

describe('generateComparisonReport', () => {
  const mockPatient: Patient = {
    id: 'p1',
    name: 'Maria Garcia',
    age: 58,
    occupation: 'Teacher',
    phone: '123456789',
    birthDate: '1965-05-15',
    isActive: true,
    createdAt: '2025-01-01',
    clinicalCases: [],
  };

  const mockCase: ClinicalCase = {
    id: 'c1',
    patientId: 'p1',
    title: 'Fascitis Plantar',
    status: 'active',
    startDate: '2026-01-15',
    consultationReason: 'Pain in feet',
    evaluation: {
      id: 'e1',
      clinicalCaseId: 'c1',
      date: '2026-01-15',
      posturogram: {},
      orthopedicTests: {
        schober: { result: 13, interpretation: 'Normal' },
        thomas: { result: 'Negative', interpretation: 'Normal' },
        ely: { result: 'Negative', interpretation: 'Normal' },
        ober: { result: 'Negative', interpretation: 'Normal' },
      },
      avdEvaluation: {
        barthel: {
          total: 90,
          interpretation: 'Independent',
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
          interpretation: 'Independent',
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
      painScale: { activity: 8, rest: 3, palpation: 5, type: 'chronic' },
      diagnosis: {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
      footprints: [
        {
          id: 'f1',
          evaluationId: 'e1',
          type: 'initial',
          date: '2026-01-15',
          url: 'http://img/1.jpg',
        },
        {
          id: 'f2',
          evaluationId: 'e1',
          type: 'final',
          date: '2026-03-15',
          url: 'http://img/2.jpg',
        },
      ],
      postureVideos: [],
    },
    treatmentPlan: {
      id: 'tp1',
      clinicalCaseId: 'c1',
      createdAt: '2026-01-15',
      objectives: { therapeutic: '', prophylactic: '', educational: '' },
      phases: [],
    },
    treatmentSessions: [
      {
        id: 's1',
        clinicalCaseId: 'c1',
        date: '2026-03-15',
        phaseNumber: 1,
        procedures: [],
        patientResponse: '',
        finalPainLevel: 4,
        observations: '',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a PDF without errors', async () => {
    await expect(
      generateComparisonReport(mockCase, mockPatient),
    ).resolves.not.toThrow();
  });

  it('should handle missing footprint images gracefully', async () => {
    const caseWithoutImages = {
      ...mockCase,
      evaluation: {
        ...mockCase.evaluation,
        footprints: [],
      },
    };
    await expect(
      generateComparisonReport(caseWithoutImages, mockPatient),
    ).resolves.not.toThrow();
  });

  it('should include patient name in PDF filename', async () => {
    await generateComparisonReport(mockCase, mockPatient);

    expect(saveMock).toHaveBeenCalled();
    const filename = saveMock.mock.calls[0][0];
    expect(filename).toContain('informe-maria-garcia');
    expect(filename).toMatch(/informe-maria-garcia-\d{4}-\d{2}-\d{2}\.pdf/);
  });
});
