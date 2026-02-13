import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionCard } from './SuggestionCard';
import type { Suggestion } from '@/types/analysis';

describe('SuggestionCard Feedback UI', () => {
  const mockSuggestion: Suggestion = {
    title: 'Test Suggestion',
    description: 'Test Description',
    confidence: 'HIGH',
  };

  it('4.1 should render ThumbsUp and ThumbsDown buttons when analysisId is present', () => {
    render(
      <SuggestionCard
        suggestion={mockSuggestion}
        analysisId="analysis-1"
        suggestionIndex={0}
      />,
    );

    expect(screen.getByRole('button', { name: /thumbs-up/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /thumbs-down/i })).toBeDefined();
  });

  it('4.2 should call onFeedbackChange with true when ThumbsUp is clicked', () => {
    const onFeedbackChange = vi.fn();
    render(
      <SuggestionCard
        suggestion={mockSuggestion}
        analysisId="analysis-1"
        suggestionIndex={0}
        onFeedbackChange={onFeedbackChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /thumbs-up/i }));
    expect(onFeedbackChange).toHaveBeenCalledWith(true);
  });

  it('4.3 should show textarea when feedback is negative', () => {
    render(
      <SuggestionCard
        suggestion={mockSuggestion}
        analysisId="analysis-1"
        suggestionIndex={0}
        feedback={{ isPositive: false }}
      />,
    );

    expect(screen.getByPlaceholderText(/por qué no fue útil/i)).toBeDefined();
  });

  it('4.4 should call onFeedbackChange with null when active button is clicked again', () => {
    const onFeedbackChange = vi.fn();
    render(
      <SuggestionCard
        suggestion={mockSuggestion}
        analysisId="analysis-1"
        suggestionIndex={0}
        feedback={{ isPositive: true }}
        onFeedbackChange={onFeedbackChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /thumbs-up/i }));
    expect(onFeedbackChange).toHaveBeenCalledWith(null);
  });

  it('4.5 should call onFeedbackChange with comment on blur', () => {
    const onFeedbackChange = vi.fn();
    render(
      <SuggestionCard
        suggestion={mockSuggestion}
        analysisId="analysis-1"
        suggestionIndex={0}
        feedback={{ isPositive: false }}
        onFeedbackChange={onFeedbackChange}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      /por qué no fue útil/i,
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Not helpful enough' } });
    fireEvent.blur(textarea);

    expect(onFeedbackChange).toHaveBeenCalledWith(false, 'Not helpful enough');
  });
});
