import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { AuthProvider } from '../context/AuthProvider';
import { useAuth } from '../hooks/use-auth';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { api } from '../lib/axios';

vi.mock('../lib/axios', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const Dashboard = () => {
  const { user } = useAuth();
  return <div>Welcome {user?.name}</div>;
};

const LogoutButton = () => {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
};

describe('Auth Integration Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('Register Flow: User registers, updates context, and redirects', async () => {
    const mockUser = {
      id: '123',
      email: 'new@example.com',
      name: 'New User',
      role: 'user',
    };
    const mockToken = 'new-user-token';
    (api.post as Mock).mockResolvedValueOnce({
      data: { user: mockUser, accessToken: mockToken },
    });
    (api.get as Mock).mockResolvedValue({ data: { hasPinSet: true } });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(localStorage.getItem('access_token')).toBe(mockToken);
    expect(localStorage.getItem('user_data')).toContain('New User');

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/clinic');
  });

  it('Login Flow: User logs in, updates context/storage, and redirects', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Integration User',
      role: 'user',
    };
    const mockToken = 'integration-token';
    (api.post as Mock).mockResolvedValueOnce({
      data: { user: mockUser, accessToken: mockToken },
    });
    (api.get as Mock).mockResolvedValue({ data: { hasPinSet: true } });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(localStorage.getItem('access_token')).toBe(mockToken);
    expect(localStorage.getItem('user_data')).toContain('Integration User');

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/clinic');
  });

  it('Persistence Flow: User accesses protected route with existing token', async () => {
    const storedUser = {
      id: '456',
      email: 'stored@example.com',
      name: 'Stored User',
      role: 'admin',
    };
    localStorage.setItem('access_token', 'stored-token');
    localStorage.setItem('user_data', JSON.stringify(storedUser));

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome Stored User')).toBeInTheDocument();
    });

    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('Logout Flow: User logs out, clears storage, and redirects', async () => {
    const storedUser = {
      id: '789',
      email: 'logout@example.com',
      name: 'Logout User',
      role: 'user',
    };
    localStorage.setItem('access_token', 'logout-token');
    localStorage.setItem('user_data', JSON.stringify(storedUser));

    (api.post as Mock).mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(api.post).toHaveBeenCalledWith('/auth/logout');

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user_data')).toBeNull();
  });
});
