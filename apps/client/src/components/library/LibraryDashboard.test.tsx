import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LibraryDashboard } from './LibraryDashboard';
import type { SearchResult } from '@/types/library';

describe('LibraryDashboard', () => {
  it('renders title and search input', () => {
    render(
      <MemoryRouter>
        <LibraryDashboard
          searchResult={null}
          isLoading={false}
          searchQuery=""
          onSearch={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Asistente Clínico/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Describe el caso clínico/i),
    ).toBeInTheDocument();
  });

  it('renders grouped rag results by book', () => {
    const result: SearchResult = {
      protocols: [],
      ragResults: [
        {
          id: 'r1',
          documentId: 'doc-1',
          content: 'Pasaje sobre dolor lumbar.',
          pageNumber: 22,
          sectionType: 'NARRATIVE',
          documentTitle: 'Fisiologia Articular Tomo 1',
          documentAuthor: 'Kapandji',
          documentFilePath: 'data/library/markdowns/book-1.md',
        },
        {
          id: 'r2',
          documentId: 'doc-1',
          content: 'Pasaje sobre movilidad de hombro.',
          pageNumber: 49,
          documentTitle: 'Fisiologia Articular Tomo 1',
          documentAuthor: 'Kapandji',
        },
      ],
    };

    render(
      <MemoryRouter>
        <LibraryDashboard
          searchResult={result}
          isLoading={false}
          searchQuery="dolor"
          onSearch={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Encontramos 2 pasajes relevantes en 1 libros/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Fisiologia Articular Tomo 1')).toBeInTheDocument();
    expect(screen.getByText(/Pagina 22 - NARRATIVE/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /Abrir libro/i })[0],
    ).toHaveAttribute('href', '/biblioteca/libros/doc-1?page=22&q=dolor');
  });

  it('expands and collapses context when available', async () => {
    const longText = 'texto '.repeat(100);
    const result: SearchResult = {
      protocols: [],
      ragResults: [
        {
          id: 'r1',
          documentId: 'doc-1',
          content: longText,
          snippet: longText,
          context: `${longText}\n\nContexto adicional`,
          pageNumber: 7,
          documentTitle: 'Atlas de Anatomia',
          documentAuthor: 'Sinelnikov',
        },
      ],
    };

    render(
      <MemoryRouter>
        <LibraryDashboard
          searchResult={result}
          isLoading={false}
          searchQuery="texto"
          onSearch={vi.fn()}
        />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: /Ver contexto/i });
    await userEvent.click(toggle);

    expect(
      screen.getByRole('button', { name: /Ocultar contexto/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Contexto ampliado/i)).toBeInTheDocument();
  });
});
