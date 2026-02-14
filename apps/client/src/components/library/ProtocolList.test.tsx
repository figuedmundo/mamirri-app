import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProtocolList } from './ProtocolList';
import type { Protocol, BibliographicReference } from '@/types/library';

const mockReference: BibliographicReference = {
  id: 'ref-1',
  author: 'McKenzie, R.',
  year: 1981,
  title: 'The Lumbar Spine: Mechanical Diagnosis',
  source: 'Journal of Manual Medicine',
  originalLanguage: 'English',
  summaryEs: 'Resumen en español del diagnóstico mecánico lumbar.',
  originalText: 'Original English text about mechanical diagnosis.',
  url: 'https://example.com/mckenzie',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockProtocol: Protocol = {
  id: 'prot-1',
  title: 'Posición de Esfinge',
  categoryId: 'cat-1',
  definition: 'Decúbito prono con apoyo antebrazos',
  rationale: 'Reducir carga sobre columna cervical',
  procedure: [
    'Colocar paciente en decúbito prono',
    'Flexionar rodillas a 90°',
    'Mantener 5-10 minutos',
  ],
  tags: ['McKenzie', 'Cervical', 'Extensión'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  documentId: null,
  category: {
    id: 'cat-1',
    name: 'Osteología',
    description: 'Bone',
    icon: 'bone',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  references: [
    { protocolId: 'prot-1', referenceId: 'ref-1', reference: mockReference },
  ],
};

describe('ProtocolList', () => {
  it('renders protocol cards with titles and definitions', () => {
    render(
      <ProtocolList protocols={[mockProtocol]} onSelectProtocol={vi.fn()} />,
    );

    expect(screen.getByText('Posición de Esfinge')).toBeInTheDocument();
    expect(
      screen.getByText('Decúbito prono con apoyo antebrazos'),
    ).toBeInTheDocument();
  });

  it('shows tags on each card', () => {
    render(
      <ProtocolList protocols={[mockProtocol]} onSelectProtocol={vi.fn()} />,
    );

    expect(screen.getByText('McKenzie')).toBeInTheDocument();
    expect(screen.getByText('Cervical')).toBeInTheDocument();
    expect(screen.getByText('Extensión')).toBeInTheDocument();
  });

  it('clicking a card calls onSelectProtocol with id', async () => {
    const onSelectProtocol = vi.fn();
    render(
      <ProtocolList
        protocols={[mockProtocol]}
        onSelectProtocol={onSelectProtocol}
      />,
    );

    await userEvent.click(screen.getByText('Posición de Esfinge'));
    expect(onSelectProtocol).toHaveBeenCalledWith('prot-1');
  });

  it('loading state shows skeleton placeholders', () => {
    const { container } = render(
      <ProtocolList
        protocols={[]}
        onSelectProtocol={vi.fn()}
        isLoading={true}
      />,
    );

    // Look for animate-pulse class
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('empty state shows "No se encontraron protocolos" message', () => {
    render(
      <ProtocolList
        protocols={[]}
        onSelectProtocol={vi.fn()}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText('No se encontraron protocolos'),
    ).toBeInTheDocument();
  });

  it('shows "Protocolos Sugeridos" heading when protocols exist', () => {
    render(
      <ProtocolList protocols={[mockProtocol]} onSelectProtocol={vi.fn()} />,
    );

    expect(screen.getByText('Protocolos Sugeridos')).toBeInTheDocument();
  });
});
