import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Ajustes from './Ajustes';
import { Toaster } from '../components/ui/toaster';

vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    toasts: [],
  }),
}));

describe('Ajustes Page - PWA Cache', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'caches', {
      writable: true,
      value: {
        keys: vi.fn().mockResolvedValue(['cache-v1', 'cache-v2']),
        delete: vi.fn().mockResolvedValue(true),
      },
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() },
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      writable: true,
      value: {
        getRegistrations: vi
          .fn()
          .mockResolvedValue([{ unregister: vi.fn().mockResolvedValue(true) }]),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the clear cache button', () => {
    render(<Ajustes />);
    expect(
      screen.getByRole('button', { name: /Borrar caché/i }),
    ).toBeInTheDocument();
  });

  it('opens confirmation dialog when clicked', () => {
    render(
      <>
        <Toaster />
        <Ajustes />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Borrar caché/i }));
    expect(screen.getByText(/¿Estás seguro?/i)).toBeInTheDocument();
  });

  it('clears cache and reloads when confirmed', async () => {
    render(
      <>
        <Toaster />
        <Ajustes />
      </>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Borrar caché/i }));

    const confirmButton = screen.getByRole('button', {
      name: /Sí, borrar caché/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(window.caches.delete).toHaveBeenCalledWith('cache-v1');
      expect(window.caches.delete).toHaveBeenCalledWith('cache-v2');
    });
  });
});
