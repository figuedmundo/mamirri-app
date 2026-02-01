import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  TranscriptionDisplay,
  type TranscriptionDisplayProps,
} from './TranscriptionDisplay';

describe('TranscriptionDisplay', () => {
  const defaultProps: TranscriptionDisplayProps = {
    status: 'uploading',
    onRetry: vi.fn(),
    onRerecord: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders uploading state correctly', () => {
    render(<TranscriptionDisplay {...defaultProps} status="uploading" />);

    expect(screen.getByText('Uploading audio...')).toBeInTheDocument();
    expect(screen.getByText('This may take a few moments')).toBeInTheDocument();
  });

  it('renders pending state correctly', () => {
    render(<TranscriptionDisplay {...defaultProps} status="pending" />);

    expect(screen.getByText('Transcribing audio...')).toBeInTheDocument();
    expect(screen.getByText('This may take a few moments')).toBeInTheDocument();
  });

  it('renders failed state correctly', () => {
    const errorMsg = 'Network error';
    render(
      <TranscriptionDisplay
        {...defaultProps}
        status="failed"
        error={errorMsg}
      />,
    );

    expect(screen.getByText('Transcription Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /re-record/i }),
    ).toBeInTheDocument();
  });

  it('renders completed state correctly with transcription', () => {
    const transcriptionText = 'Patient reports mild pain.';
    render(
      <TranscriptionDisplay
        {...defaultProps}
        status="completed"
        transcription={transcriptionText}
      />,
    );

    expect(screen.getByText('Transcription Complete')).toBeInTheDocument();
    expect(screen.getByText(transcriptionText)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /new recording/i }),
    ).toBeInTheDocument();
  });

  it('renders audio player when audioUrl is provided in completed state', () => {
    const audioUrl = 'blob:test-audio';
    render(
      <TranscriptionDisplay
        {...defaultProps}
        status="completed"
        transcription="Test"
        audioUrl={audioUrl}
      />,
    );

    const audio = document.querySelector('audio');
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute('src', audioUrl);
  });

  it('calls onRetry when retry button is clicked in failed state', () => {
    render(<TranscriptionDisplay {...defaultProps} status="failed" />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onRerecord when re-record button is clicked in failed state', () => {
    render(<TranscriptionDisplay {...defaultProps} status="failed" />);

    const rerecordButton = screen.getByRole('button', { name: /re-record/i });
    fireEvent.click(rerecordButton);

    expect(defaultProps.onRerecord).toHaveBeenCalledTimes(1);
  });

  it('calls onRerecord when new recording button is clicked in completed state', () => {
    render(<TranscriptionDisplay {...defaultProps} status="completed" />);

    const newRecordingButton = screen.getByRole('button', {
      name: /new recording/i,
    });
    fireEvent.click(newRecordingButton);

    expect(defaultProps.onRerecord).toHaveBeenCalledTimes(1);
  });
});
