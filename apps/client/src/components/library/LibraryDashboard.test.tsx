import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryDashboard } from './LibraryDashboard';
import type {
  Protocol,
  ClinicalCategory,
  BibliographicReference,
  SearchResult,
} from '@/types/library';

// Mock ProtocolDetailModal
vi.mock('./ProtocolDetailModal', () => ({
  ProtocolDetailModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="protocol-detail-modal">Modal Open</div> : null,
}));

const mockCategory: ClinicalCategory = {
  id: 'cat-1',
  name: 'Osteología',
  description: 'Bone-related protocols',
  icon: 'bone',
  createdAt: '2026-01-01T00:00:00.000Z',
};

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
  procedure: ['Colocar paciente en decúbito prono'],
  tags: ['McKenzie'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  category: mockCategory,
  references: [
    { protocolId: 'prot-1', referenceId: 'ref-1', reference: mockReference },
  ],
};

describe('LibraryDashboard', () => {
  it('renders page title', () => {
    render(
      <LibraryDashboard
        categories={[]}
        protocols={[]}
        references={[]}
        searchResult={null}
        isLoading={false}
        onSearch={vi.fn()}
        onSelectCategory={vi.fn()}
      />,
    );
    expect(screen.getByText(/Asistente Clínico/)).toBeInTheDocument();
    expect(screen.getByText(/Inteligente/)).toBeInTheDocument();
  });

  it('renders main components', () => {
    render(
      <LibraryDashboard
        categories={[mockCategory]}
        protocols={[mockProtocol]}
        references={[mockReference]}
        searchResult={null}
        isLoading={false}
        onSearch={vi.fn()}
        onSelectCategory={vi.fn()}
      />,
    );

    // SearchBar
    expect(
      screen.getByPlaceholderText(/Describe el caso clínico/),
    ).toBeInTheDocument();

    // CategoryNav
    expect(screen.getByText('Osteología')).toBeInTheDocument();

    // ProtocolList
    expect(screen.getByText('Posición de Esfinge')).toBeInTheDocument();

    // BibliographyPanel
    expect(screen.getByText('Bibliografía Relevante')).toBeInTheDocument();
  });

  it('shows search result count when provided', () => {
    const searchResult: SearchResult = {
      protocols: [mockProtocol, mockProtocol], // 2 protocols
      ragResults: [],
    };

    render(
      <LibraryDashboard
        categories={[]}
        protocols={[]}
        references={[]}
        searchResult={searchResult}
        isLoading={false}
        onSearch={vi.fn()}
        onSelectCategory={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Se han encontrado 2 protocolos relevantes/),
    ).toBeInTheDocument();
  });

  it('shows loading indicator', () => {
    render(
      <LibraryDashboard
        categories={[]}
        protocols={[]}
        references={[]}
        searchResult={null}
        isLoading={true}
        onSearch={vi.fn()}
        onSelectCategory={vi.fn()}
      />,
    );

    expect(screen.getByText('Actualizando evidencia...')).toBeInTheDocument();
  });

  it('clicking a protocol card opens ProtocolDetailModal', async () => {
    render(
      <LibraryDashboard
        categories={[mockCategory]}
        protocols={[mockProtocol]}
        references={[mockReference]}
        searchResult={null}
        isLoading={false}
        onSearch={vi.fn()}
        onSelectCategory={vi.fn()}
      />,
    );

    // Click on protocol
    await userEvent.click(screen.getByText('Posición de Esfinge'));

    // Check if modal mock is rendered
    expect(screen.getByTestId('protocol-detail-modal')).toBeInTheDocument();
  });
});
