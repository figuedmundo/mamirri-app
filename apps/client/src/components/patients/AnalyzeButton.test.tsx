import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyzeButton } from './AnalyzeButton';
import { useCaseAnalysis } from '@/hooks/use-case-analysis';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/hooks/use-case-analysis');

describe('AnalyzeButton', () => {
  const mockAnalyzeCase = vi.fn();

  beforeEach(() => {
    // @ts-expect-error - mockReturnValue is a vitest mock method
    useCaseAnalysis.mockReturnValue({
      analyzeCase: mockAnalyzeCase,
      isAnalyzing: false,
    });
    vi.clearAllMocks();
  });

  it('renders button when evaluation count >= 1', () => {
    render(
      <AnalyzeButton
        caseId="1"
        evaluationCount={1}
        onAnalysisComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole('button')).toBeEnabled();
    expect(screen.getByText('Analizar con IA')).toBeInTheDocument();
  });

  it('is disabled when evaluation count < 1', () => {
    render(
      <AnalyzeButton
        caseId="1"
        evaluationCount={0}
        onAnalysisComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state during analysis', () => {
    // @ts-expect-error - mockReturnValue is a vitest mock method
    useCaseAnalysis.mockReturnValue({
      analyzeCase: mockAnalyzeCase,
      isAnalyzing: true,
    });
    render(
      <AnalyzeButton
        caseId="1"
        evaluationCount={1}
        onAnalysisComplete={vi.fn()}
      />,
    );
    expect(screen.getByText('Analizando...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onAnalysisComplete on success', async () => {
    const onComplete = vi.fn();
    mockAnalyzeCase.mockResolvedValue({ some: 'result' });

    render(
      <AnalyzeButton
        caseId="1"
        evaluationCount={1}
        onAnalysisComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockAnalyzeCase).toHaveBeenCalledWith('1');
    });

    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalledWith({ some: 'result' });
      },
      { timeout: 1500 },
    );
  });
});
