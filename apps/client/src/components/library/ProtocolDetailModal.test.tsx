import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProtocolDetailModal } from './ProtocolDetailModal';
import type { Protocol, BibliographicReference } from '@/types/library';

// Mock shadcn Dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

const mockReference: BibliographicReference = {
  id: 'ref-1',
  author: 'McKenzie, R.',
  year: 1981,
  title: 'The Lumbar Spine',
  source: 'Journal of Manual Medicine',
  originalLanguage: 'English',
  summaryEs: 'Resumen en español',
  originalText: 'Original English text',
  url: 'https://example.com/mckenzie',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockProtocol: Protocol = {
  id: 'prot-1',
  title: 'Posición de Esfinge',
  categoryId: 'cat-1',
  definition: 'Decúbito prono con apoyo antebrazos',
  rationale: 'Reducir carga sobre columna cervical',
  procedure: ['Colocar paciente en decúbito prono', 'Flexionar rodillas a 90°'],
  tags: ['McKenzie'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
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

const mockProtocolNoRefs: Protocol = {
  ...mockProtocol,
  id: 'prot-2',
  references: [],
};

describe('ProtocolDetailModal', () => {
  it('returns null when protocol is null', () => {
    render(
      <ProtocolDetailModal protocol={null} open={true} onClose={vi.fn()} />,
    );
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <ProtocolDetailModal
        protocol={mockProtocol}
        open={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders all sections when open', () => {
    render(
      <ProtocolDetailModal
        protocol={mockProtocol}
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Posición de Esfinge')).toBeInTheDocument();
    expect(screen.getByText('Definición')).toBeInTheDocument();
    expect(
      screen.getByText(/Decúbito prono con apoyo antebrazos/),
    ).toBeInTheDocument();
    expect(screen.getByText('Justificación')).toBeInTheDocument();
    expect(
      screen.getByText(/Reducir carga sobre columna cervical/),
    ).toBeInTheDocument();
    expect(screen.getByText('Procedimiento')).toBeInTheDocument();
  });

  it('renders numbered procedure steps', () => {
    render(
      <ProtocolDetailModal
        protocol={mockProtocol}
        open={true}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByText('Colocar paciente en decúbito prono'),
    ).toBeInTheDocument();
    expect(screen.getByText('Flexionar rodillas a 90°')).toBeInTheDocument();
  });

  it('shows evidence section when references exist', () => {
    render(
      <ProtocolDetailModal
        protocol={mockProtocol}
        open={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Evidencia Científica')).toBeInTheDocument();
    expect(screen.getByText('The Lumbar Spine')).toBeInTheDocument();
  });

  it('language toggle on references works', async () => {
    render(
      <ProtocolDetailModal
        protocol={mockProtocol}
        open={true}
        onClose={vi.fn()}
      />,
    );

    // Similar to BibliographyPanel
    expect(screen.getByText('Resumen en español')).toBeInTheDocument();

    const toggleBtn = screen.getByText('EN');
    await userEvent.click(toggleBtn);

    expect(screen.getByText('Original English text')).toBeInTheDocument();
  });

  it('does not render references section when empty', () => {
    render(
      <ProtocolDetailModal
        protocol={mockProtocolNoRefs}
        open={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText('Evidencia Científica')).not.toBeInTheDocument();
  });
});
