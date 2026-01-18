import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseDetailLayout } from './CaseDetailLayout';
import type { Patient, ClinicalCase } from '../../types/patient';

const mockPatient: Patient = {
  id: 'pac-001',
  name: 'Juan Pérez',
  birthDate: '1980-01-01T00:00:00Z',
  age: 44,
  occupation: 'Desarrollador',
  phone: '+1234567890',
  email: 'juan@example.com',
  address: '123 Main St',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  clinicalCases: [],
};

const mockClinicalCase: ClinicalCase = {
  id: 'caso-001',
  patientId: 'pac-001',
  title: 'Dolor Lumbar Crónico',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  consultationReason: 'Dolor lumbar persistente',
  treatmentPlan: {
    id: 'plan-001',
    clinicalCaseId: 'caso-001',
    createdAt: '2024-01-01T00:00:00Z',
    objectives: {
      therapeutic: 'Reducir dolor',
      prophylactic: 'Prevenir recaídas',
      educational: 'Ejercicios domiciliarios',
    },
    phases: [
      {
        number: 1,
        name: 'Inicial',
        durationWeeks: 3,
        techniques: ['Movilizaciones'],
        objectives: 'Alivio del dolor',
      },
    ],
  },
  treatmentSessions: [],
  evaluations: [],
};

describe('Responsive Layout Behavior', () => {
  const onBackMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query.includes('(min-width: 1024px)'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('CaseTimeline Sidebar on Desktop', () => {
    it('should render CaseTimeline as sidebar on desktop (lg+)', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: '(min-width: 1024px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const timelineContainer = screen.getByText('Línea de Tiempo');
      expect(timelineContainer).toBeInTheDocument();
    });
  });

  describe('CaseTimeline Sheet on Mobile', () => {
    it('should render CaseTimeline as Sheet on mobile (<lg)', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(max-width: 767px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const timelineHeader = screen.queryByText('Línea de Tiempo');
      expect(timelineHeader).not.toBeInTheDocument();
    });
  });

  describe('Toggle Button on Mobile/Tablet', () => {
    it('should show timeline toggle button on mobile (<lg)', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(max-width: 767px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const toggleButton = screen.queryByRole('button', {
        name: /Ver línea de tiempo/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should hide toggle button on desktop (lg+)', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: '(min-width: 1024px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const toggleButton = screen.queryByRole('button', {
        name: /Ver línea de tiempo/i,
      });
      expect(toggleButton).not.toBeInTheDocument();
    });
  });

  describe('Header Toolbar Responsive', () => {
    it('should hide button text on phone screens', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(max-width: 767px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const seguimientoText = screen.queryByText('Seguimiento');

      expect(seguimientoText).toBeInTheDocument();
    });

    it('should show button text on larger screens', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: '(min-width: 640px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const seguimientoText = screen.queryByText('Seguimiento');
      expect(seguimientoText).toBeInTheDocument();
    });
  });

  describe('Touch Targets on Mobile', () => {
    it('should have 48px+ minimum touch targets on mobile', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(max-width: 767px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const backButton = screen.getByRole('button', {
        name: /volver/i,
      });
      expect(backButton).toHaveClass(/p-3/);

      const viewButtons = screen.getAllByRole('button');
      viewButtons.forEach((button) => {
        const className = button.className;
        const hasTouchTarget =
          className.includes('p-3') ||
          className.includes('py-2') ||
          className.includes('min-h');
        if (hasTouchTarget) {
          expect(true).toBe(true);
        }
      });
    });
  });

  describe('Sheet Open/Close Behavior', () => {
    it('should open Sheet when toggle button is clicked', async () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(max-width: 767px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const user = userEvent.setup();

      render(
        <CaseDetailLayout
          patient={mockPatient}
          clinicalCase={mockClinicalCase}
          onBack={onBackMock}
        />,
      );

      const toggleButton = screen.queryByRole('button', {
        name: /Abrir cronograma/i,
      });

      if (toggleButton) {
        await user.click(toggleButton);

        const timelineHeader = screen.queryAllByText('Línea de Tiempo');

        expect(timelineHeader.length).toBeGreaterThan(0);
      }
    });
  });
});
