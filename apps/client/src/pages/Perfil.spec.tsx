import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Perfil from './Perfil';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/auth-context-base';

const mockUpdateUser = vi.fn();

vi.mock('../api/users', () => ({
  usersApi: {
    updateProfile: vi.fn().mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Updated Name',
      role: 'THERAPIST',
      createdAt: new Date().toISOString(),
    }),
    uploadPhoto: vi.fn(),
    deletePhoto: vi.fn(),
  },
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'THERAPIST',
  createdAt: new Date().toISOString(),
};

const renderWithContext = (ui: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          hasPinSet: false,
          login: vi.fn(),
          logout: vi.fn(),
          checkPinStatus: vi.fn().mockResolvedValue(false),
          updateUser: mockUpdateUser,
        }}
      >
        {ui}
      </AuthContext.Provider>
    </BrowserRouter>,
  );
};

describe('Perfil Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile sections', () => {
    renderWithContext(<Perfil />);
    expect(screen.getByText(/información personal/i)).toBeInTheDocument();
    expect(screen.getByText(/información profesional/i)).toBeInTheDocument();
    expect(screen.getByText(/seguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/información de la cuenta/i)).toBeInTheDocument();
  });

  it('displays user data in form fields', () => {
    renderWithContext(<Perfil />);
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(
      mockUser.name,
    );
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(
      mockUser.email,
    );
  });

  it('handles input changes', () => {
    renderWithContext(<Perfil />);
    const nameInput = screen.getByLabelText(/nombre completo/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(nameInput).toHaveValue('New Name');
  });

  it('calls updateProfile on submit', async () => {
    renderWithContext(<Perfil />);
    const nameInput = screen.getByLabelText(/nombre completo/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const submitButton = screen.getByRole('button', {
      name: /guardar cambios/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
    });
  });
});
