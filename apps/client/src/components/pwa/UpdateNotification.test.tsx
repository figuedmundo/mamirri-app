import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateNotification } from './UpdateNotification';
import * as useServiceWorkerModule from '../../hooks/useServiceWorker';
import { Toaster } from '../../components/ui/toaster';

vi.mock('../../hooks/useServiceWorker', () => ({
  useServiceWorker: vi.fn(),
}));

describe('UpdateNotification', () => {
  const mockUpdateServiceWorker = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  const renderWithToaster = () => {
    return render(
      <>
        <Toaster />
        <UpdateNotification />
      </>,
    );
  };

  it('renders nothing when no update is waiting', () => {
    vi.mocked(useServiceWorkerModule.useServiceWorker).mockReturnValue({
      waitingWorker: null,
      showReload: false,
      updateServiceWorker: mockUpdateServiceWorker,
      isUpdateAvailable: false,
    });

    const { queryByText } = renderWithToaster();
    expect(queryByText(/Nueva versión disponible/i)).not.toBeInTheDocument();
  });

  it('renders notification when update is available', () => {
    vi.mocked(useServiceWorkerModule.useServiceWorker).mockReturnValue({
      waitingWorker: {} as ServiceWorker,
      showReload: true,
      updateServiceWorker: mockUpdateServiceWorker,
      isUpdateAvailable: true,
    });

    renderWithToaster();
    expect(screen.getByText(/Nueva versión disponible/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Actualizar ahora/i }),
    ).toBeInTheDocument();
  });

  it('triggers update when update button is clicked', () => {
    vi.mocked(useServiceWorkerModule.useServiceWorker).mockReturnValue({
      waitingWorker: {} as ServiceWorker,
      showReload: true,
      updateServiceWorker: mockUpdateServiceWorker,
      isUpdateAvailable: true,
    });

    renderWithToaster();
    const updateButton = screen.getByRole('button', {
      name: /Actualizar ahora/i,
    });
    fireEvent.click(updateButton);

    expect(mockUpdateServiceWorker).toHaveBeenCalledTimes(1);
  });

  it('hides notification when later button is clicked', () => {
    vi.mocked(useServiceWorkerModule.useServiceWorker).mockReturnValue({
      waitingWorker: {} as ServiceWorker,
      showReload: true,
      updateServiceWorker: mockUpdateServiceWorker,
      isUpdateAvailable: true,
    });

    renderWithToaster();
    const laterButton = screen.getByRole('button', { name: /Más tarde/i });

    act(() => {
      fireEvent.click(laterButton);
    });

    expect(
      screen.queryByText(/Nueva versión disponible/i),
    ).not.toBeInTheDocument();
  });
});
