import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BibliographyPanel } from './BibliographyPanel';
import type { BibliographicReference } from '@/types/library';

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

const mockReferenceNoEng: BibliographicReference = {
  ...mockReference,
  id: 'ref-2',
  originalLanguage: 'Spanish',
  originalText: null,
};

describe('BibliographyPanel', () => {
  it('renders "Bibliografía Relevante" heading', () => {
    render(<BibliographyPanel references={[]} />);
    expect(screen.getByText('Bibliografía Relevante')).toBeInTheDocument();
  });

  it('empty state shows message', () => {
    render(<BibliographyPanel references={[]} />);
    expect(
      screen.getByText('Selecciona un protocolo para ver sus referencias.'),
    ).toBeInTheDocument();
  });

  it('renders reference details', () => {
    render(<BibliographyPanel references={[mockReference]} />);
    expect(screen.getByText('The Lumbar Spine')).toBeInTheDocument();
    expect(screen.getByText('McKenzie, R.')).toBeInTheDocument();
    expect(screen.getByText('1981')).toBeInTheDocument();
    expect(screen.getByText('Journal of Manual Medicine')).toBeInTheDocument();
  });

  it('language toggle works for English references', async () => {
    render(<BibliographyPanel references={[mockReference]} />);

    // Default is Spanish summary
    expect(screen.getByText('Resumen en español')).toBeInTheDocument();

    // Find toggle button (EN)
    const toggleBtn = screen.getByText('EN');
    await userEvent.click(toggleBtn);

    // Now should show English text
    expect(screen.getByText('Original English text')).toBeInTheDocument();

    // Button changes to ES
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('no toggle for references without original text', () => {
    render(<BibliographyPanel references={[mockReferenceNoEng]} />);

    // Toggle button should not be present
    // We search for the button text which is usually EN/ES.
    expect(screen.queryByText('EN')).not.toBeInTheDocument();
  });

  it('external link icon renders when URL exists', () => {
    const { container } = render(
      <BibliographyPanel references={[mockReference]} />,
    );
    // Looking for the anchor tag with the href
    const link = container.querySelector(`a[href="${mockReference.url}"]`);
    expect(link).toBeInTheDocument();
  });
});
