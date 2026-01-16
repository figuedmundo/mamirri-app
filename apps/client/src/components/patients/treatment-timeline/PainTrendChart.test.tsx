import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PainTrendChart } from './PainTrendChart';
import type { TreatmentSession } from '../../../types/patient';

const createSession = (
  id: string,
  painLevel: number,
  date: string,
): TreatmentSession => ({
  id,
  clinicalCaseId: 'case-1',
  date,
  phaseNumber: 1,
  procedures: ['Masaje'],
  patientResponse: 'OK',
  finalPainLevel: painLevel,
  observations: '',
});

describe('PainTrendChart', () => {
  it('should show fallback message when less than 2 sessions', () => {
    const sessions = [createSession('1', 5, '2024-01-10')];
    render(<PainTrendChart sessions={sessions} />);

    expect(screen.getByText(/tendencia no disponible/i)).toBeInTheDocument();
    expect(screen.getByText(/mínimo 2 sesiones/i)).toBeInTheDocument();
  });

  it('should show improving trend when pain decreases', () => {
    const sessions = [
      createSession('1', 8, '2024-01-10'),
      createSession('2', 6, '2024-01-17'),
      createSession('3', 4, '2024-01-24'),
    ];
    render(<PainTrendChart sessions={sessions} />);

    expect(screen.getByText('Mejorando')).toBeInTheDocument();
  });

  it('should show worsening trend when pain increases', () => {
    const sessions = [
      createSession('1', 3, '2024-01-10'),
      createSession('2', 5, '2024-01-17'),
      createSession('3', 7, '2024-01-24'),
    ];
    render(<PainTrendChart sessions={sessions} />);

    expect(screen.getByText('Empeorando')).toBeInTheDocument();
  });

  it('should show stable trend when pain stays same', () => {
    const sessions = [
      createSession('1', 5, '2024-01-10'),
      createSession('2', 5, '2024-01-17'),
    ];
    render(<PainTrendChart sessions={sessions} />);

    expect(screen.getByText('Estable')).toBeInTheDocument();
  });

  it('should show average pain level', () => {
    const sessions = [
      createSession('1', 4, '2024-01-10'),
      createSession('2', 6, '2024-01-17'),
    ];
    render(<PainTrendChart sessions={sessions} />);

    expect(screen.getByText(/promedio: 5\.0/i)).toBeInTheDocument();
  });

  it('should render SVG chart', () => {
    const sessions = [
      createSession('1', 8, '2024-01-10'),
      createSession('2', 4, '2024-01-24'),
    ];
    render(<PainTrendChart sessions={sessions} />);

    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
  });
});
