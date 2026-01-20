import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecordingFloatingBar } from './RecordingFloatingBar';

describe('RecordingFloatingBar', () => {
  const defaultProps = {
    isRecording: true,
    duration: 125,
    onStop: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders correctly when active', () => {
    render(<RecordingFloatingBar {...defaultProps} />);

    expect(screen.getByText('Grabando...')).toBeInTheDocument();
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('does not render when not recording', () => {
    render(<RecordingFloatingBar {...defaultProps} isRecording={false} />);

    expect(screen.queryByText('Grabando...')).not.toBeInTheDocument();
  });

  it('triggers onStop when Stop button is clicked', () => {
    render(<RecordingFloatingBar {...defaultProps} />);

    const stopButton = screen.getByLabelText('Detener grabación');
    fireEvent.click(stopButton);

    expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
  });

  it('triggers onCancel when Cancel button is clicked', () => {
    render(<RecordingFloatingBar {...defaultProps} />);

    const cancelButton = screen.getByLabelText('Cancelar grabación');
    fireEvent.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows pulsing indicator', () => {
    render(<RecordingFloatingBar {...defaultProps} />);

    const pulsingDot = screen.getByTestId('pulsing-indicator');
    expect(pulsingDot).toBeInTheDocument();
    expect(pulsingDot).toHaveClass('animate-pulse');
  });
});
