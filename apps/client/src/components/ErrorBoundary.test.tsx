import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Test component</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: '/',
      reload: vi.fn(),
    } as unknown as Location);
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch rendering errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Try Again/)).toBeInTheDocument();
    expect(screen.getByText(/Go to Dashboard/)).toBeInTheDocument();
  });

  it('should show error details when toggle button is clicked', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();

    const toggleButtons = screen.getAllByRole('button');
    const showButton = toggleButtons.find((btn) =>
      btn.textContent?.includes('Show Technical Details'),
    );
    expect(showButton).toBeDefined();

    showButton?.click();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText(/Message:/)).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    expect(screen.getByText(/Component Stack:/)).toBeInTheDocument();
  });

  it('should reload page when Try Again button is clicked', () => {
    const reloadMock = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      href: '/',
      reload: reloadMock,
    } as unknown as Location);

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const tryAgainButton = screen.getByText('Try Again');
    tryAgainButton.click();

    expect(reloadMock).toHaveBeenCalled();
  });

  it('should navigate to dashboard when Go to Dashboard button is clicked', () => {
    const mockLocation = {
      href: '/test',
    } as Location;
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockLocation);

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const goHomeButton = screen.getByText('Go to Dashboard');
    goHomeButton.click();

    expect(mockLocation.href).toBe('/');
  });

  it('should hide error details when Hide Details is clicked', async () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const showDetailsButtons = screen.getAllByRole('button');
    const showButton = showDetailsButtons.find((btn) =>
      btn.textContent?.includes('Show Technical Details'),
    );
    showButton?.click();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(screen.getByText('Error Details')).toBeInTheDocument();

    const hideDetailsButtons = screen.getAllByRole('button');
    const hideButton = hideDetailsButtons.find((btn) =>
      btn.textContent?.includes('Hide Details'),
    );
    hideButton?.click();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
  });
});
