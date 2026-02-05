import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from '../hooks/use-auth';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { api } from '../lib/axios';

vi.mock('../lib/axios', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn().mockResolvedValue({ data: { hasPinSet: false } }),
  },
}));

const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="is-authenticated">
        {isAuthenticated ? 'true' : 'false'}
      </div>
      <div data-testid="user-email">{user?.email}</div>
      <button
        onClick={() =>
          login(
            {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'user',
            },
            'fake-token',
          )
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with loading state and checks localStorage', async () => {
    const mockUser = {
      id: '1',
      email: 'stored@example.com',
      name: 'Stored User',
      role: 'user',
    };
    localStorage.setItem('access_token', 'stored-token');
    localStorage.setItem('user_data', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'stored@example.com',
      );
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('stores token and user data in localStorage on login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(localStorage.getItem('access_token')).toBe('fake-token');
    expect(localStorage.getItem('user_data')).toContain('test@example.com');

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'test@example.com',
    );
  });

  it('clears localStorage on logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('user_data', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    (api.post as Mock).mockResolvedValue({});

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user_data')).toBeNull();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-email')).toBeEmptyDOMElement();
  });
});
