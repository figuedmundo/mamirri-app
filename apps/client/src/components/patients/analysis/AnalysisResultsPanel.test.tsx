import { render, screen } from '@testing-library/react';
import { AnalysisResultsPanel } from './AnalysisResultsPanel';
import type { AnalysisResult } from '@/types/analysis';
import { vi, describe, it, expect } from 'vitest';

const mockResult: AnalysisResult = {
  primarySuggestion: {
    title: 'Primary',
    description: 'Desc',
    confidence: 'HIGH',
    reasoning: 'Reason',
  },
  alternatives: [
    { title: 'Alt 1', description: 'Alt Desc', confidence: 'MEDIUM' },
  ],
  citations: [
    {
      quote: 'Quote',
      documentTitle: 'Doc',
      author: 'Author',
      relevance: 0.9,
    },
  ],
  reasoning: {
    step1_understanding: 'Understanding',
    step2_literature: 'Lit',
    step3_synthesis: 'Synth',
  },
  metadata: {
    queryTokens: 10,
    responseTokens: 20,
    processingTimeMs: 100,
    anonymizationApplied: true,
    translationsApplied: 0,
    serviceStatus: { rag: true, vision: true, voice: false, llm: true },
  },
};

describe('AnalysisResultsPanel', () => {
  it('renders nothing when closed', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText('Análisis Clínico IA')).not.toBeInTheDocument();
  });

  it('renders panel with suggestions when open', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Análisis Clínico IA')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Alt 1')).toBeInTheDocument();
  });

  it('displays pattern recognition section', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Comprensión del Caso:')).toBeInTheDocument();
    expect(screen.getByText('Understanding')).toBeInTheDocument();
  });

  it('displays citations section', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Evidencia Literaria')).toBeInTheDocument();
    expect(screen.getByText('Doc')).toBeInTheDocument();
  });

  it('displays service status indicator', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    const statusText = screen.getByText('Estado del sistema');
    expect(statusText).toBeInTheDocument();
  });

  it('displays disclaimer', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/AI-generated suggestion/)).toBeInTheDocument();
  });

  it('renders warning banners when present', () => {
    const resultWithWarnings: AnalysisResult = {
      ...mockResult,
      metadata: {
        ...mockResult.metadata,
        warnings: ['Warning 1', 'Warning 2'],
      },
    };
    render(
      <AnalysisResultsPanel
        analysisResult={resultWithWarnings}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Warning 1')).toBeInTheDocument();
    expect(screen.getByText('Warning 2')).toBeInTheDocument();
  });

  it('does not render warnings section when empty', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText('Warning 1')).not.toBeInTheDocument();
  });

  it('displays citation author when present', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockResult}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Doc')).toBeInTheDocument();
    expect(screen.getByText('— Author')).toBeInTheDocument();
  });

  it('falls back to title only when author is missing', () => {
    const resultNoAuthor: AnalysisResult = {
      ...mockResult,
      citations: [
        {
          quote: 'Quote',
          documentTitle: 'Only Title',
          author: '',
          relevance: 0.9,
        },
      ],
    };
    render(
      <AnalysisResultsPanel
        analysisResult={resultNoAuthor}
        isOpen={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Only Title')).toBeInTheDocument();
    expect(screen.queryByText(/Only Title — /)).not.toBeInTheDocument();
  });
});
