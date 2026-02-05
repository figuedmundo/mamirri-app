import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from './Register';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockPost = vi.fn();

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../lib/axios', () => ({
  api: {
    post: (url: string, data: unknown) => mockPost(url, data),
  },
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls login context and navigates on successful registration', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test',
      role: 'user',
    };
    const mockToken = 'fake-token';
    mockPost.mockResolvedValueOnce({
      data: { user: mockUser, accessToken: mockToken },
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'mismatch' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/las contraseñas no coinciden/i),
      ).toBeInTheDocument();
    });

    expect(mockPost).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
