import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BibliotecaBook from './BibliotecaBook';

vi.mock('@/hooks/use-library', () => {
  return {
    useBookMarkdownQuery: () => ({
      data: {
        documentId: 'doc-1',
        title: 'Atlas de Anatomia',
        author: 'Sinelnikov',
        filePath: 'data/library/markdowns/book-1.md',
        content: [
          '<!-- PAGE_NUMBER: 1 -->',
          '# Titulo',
          '',
          'Contenido de prueba.',
          '',
          '<!-- PAGE_NUMBER: 2 -->',
          '## Segunda pagina',
          'Texto con dolor lumbar.',
        ].join('\n'),
      },
      isLoading: false,
      isError: false,
    }),
  };
});

describe('BibliotecaBook', () => {
  it('renders markdown source and page sections', () => {
    render(
      <MemoryRouter
        initialEntries={['/biblioteca/libros/doc-1?page=2&q=dolor']}
      >
        <Routes>
          <Route
            path="/biblioteca/libros/:documentId"
            element={<BibliotecaBook />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Atlas de Anatomia')).toBeInTheDocument();
    expect(screen.getByText(/Pagina 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Segunda pagina/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dolor/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/lumbar/i)).toBeInTheDocument();
  });
});
