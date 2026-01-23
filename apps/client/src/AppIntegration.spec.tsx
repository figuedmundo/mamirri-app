import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Mock the hook
vi.mock('./hooks/useOnlineStatus');
// Mock other complex components/contexts to simplify shell testing
vi.mock('./components/pwa/UpdateNotification', () => ({
  UpdateNotification: () => <div data-testid="update-notification" />,
}));
vi.mock('./components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));
// Mock Router-dependent components since App contains the router
// Actually App contains BrowserRouter, so we don't need to mock it,
// but we need to mock AuthProvider or its dependencies if they make network calls.
// Since we are just testing the shell rendering of OfflineBanner, we can mock child routes/layouts.

describe('App Integration', () => {
  it('renders OfflineBanner in the app shell', () => {
    // Mock offline status to force banner to render
    (useOnlineStatus as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isOnline: false,
      isOffline: true,
      wasOffline: false,
    });

    render(<App />);

    // Check if offline banner is present
    expect(screen.getByText('Sin conexión a internet')).toBeInTheDocument();
  });
});
