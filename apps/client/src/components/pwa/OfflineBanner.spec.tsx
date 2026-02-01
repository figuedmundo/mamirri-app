import { render, screen, act } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// Mock the hook
vi.mock('../../hooks/useOnlineStatus');

describe('OfflineBanner', () => {
  const mockUseOnlineStatus = useOnlineStatus as unknown as ReturnType<
    typeof vi.fn
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when online and wasOffline is false', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: false,
    });

    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders offline banner when isOffline is true', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      wasOffline: false,
    });

    render(<OfflineBanner />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveTextContent('Sin conexión a internet');
    // Check for offline/warning styling classes
    expect(banner).toHaveClass('bg-amber-50');
  });

  it('renders restored banner when online after being offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: true,
    });

    render(<OfflineBanner />);

    const banner = screen.getByRole('alert');
    expect(banner).toHaveTextContent('Conexión restaurada');
    // Check for success styling classes
    expect(banner).toHaveClass('bg-green-50');
  });

  it('auto-dismisses success banner after 3 seconds', () => {
    vi.useFakeTimers();

    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: true,
    });

    const { container } = render(<OfflineBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fast forward 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should be empty now
    expect(container).toBeEmptyDOMElement();

    vi.useRealTimers();
  });
});
