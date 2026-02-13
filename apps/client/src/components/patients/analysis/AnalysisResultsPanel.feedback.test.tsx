import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalysisResultsPanel } from './AnalysisResultsPanel';
import type { AnalysisResult } from '@/types/analysis';

vi.mock('@/hooks/use-suggestion-feedback', () => ({
  useSuggestionFeedback: vi.fn(() => ({
    feedbacks: new Map(),
    submitFeedback: vi.fn(),
    removeFeedback: vi.fn(),
    isLoading: false,
  })),
}));

describe('AnalysisResultsPanel Feedback Integration', () => {
  const mockAnalysisResult: AnalysisResult = {
    primarySuggestion: {
      title: 'Primary',
      description: 'Desc',
      confidence: 'HIGH',
    },
    alternatives: [
      { title: 'Alt 1', description: 'Desc 1', confidence: 'MEDIUM' },
    ],
    citations: [],
    reasoning: {
      step1_understanding: 'u',
      step2_literature: 'l',
      step3_synthesis: 's',
    },
    metadata: {
      analysisId: 'analysis-123',
      queryTokens: 0,
      responseTokens: 0,
      processingTimeMs: 10,
      anonymizationApplied: true,
      translationsApplied: 0,
      serviceStatus: { rag: true, vision: true, voice: true, llm: true },
    },
  };

  it('5.1 should pass correct suggestionIndex to all SuggestionCards', () => {
    render(
      <AnalysisResultsPanel
        analysisResult={mockAnalysisResult}
        isOpen={true}
        onClose={() => {}}
      />,
    );

    const primaryCard = screen
      .getByText('Primary')
      .closest('[data-suggestion-index]');
    expect(primaryCard?.getAttribute('data-suggestion-index')).toBe('0');

    const altCard = screen
      .getByText('Alt 1')
      .closest('[data-suggestion-index]');
    expect(altCard?.getAttribute('data-suggestion-index')).toBe('1');
  });
});
