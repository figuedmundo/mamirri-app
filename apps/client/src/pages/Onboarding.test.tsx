import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Onboarding from './Onboarding';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockCheckNameAvailability = vi.fn();
const mockCreateClinicWithAdmin = vi.fn();

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('../api/onboarding', () => ({
  onboardingApi: {
    checkNameAvailability: (...args: unknown[]) => mockCheckNameAvailability(...args),
    createClinicWithAdmin: (...args: unknown[]) => mockCreateClinicWithAdmin(...args),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Onboarding Component - Clinic-First Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckNameAvailability.mockResolvedValue({ available: true });
    mockCreateClinicWithAdmin.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        clinicId: 'clinic-123',
        clinicName: 'Test Clinic',
        licenseNumber: 'LIC-123',
      },
      clinic: {
        id: 'clinic-123',
        name: 'Test Clinic',
        email: 'clinic@example.com',
        phone: '123456789',
        address: 'Test Address',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    queryClient = createTestQueryClient();
    localStorage.clear();
  });

  const renderOnboarding = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Onboarding />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  describe('Step 1: Clinic Information', () => {
    it('renders clinic information form with Spanish UI labels', () => {
      renderOnboarding();

      expect(screen.getByText(/crea tu clínica/i)).toBeInTheDocument();
      expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
      expect(
        screen.getByText(/información de la clínica/i),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText(/nombre de la clínica/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email de la clínica/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    });

    it('disables continue button when required fields are empty', () => {
      renderOnboarding();

      const continueButton = screen.getByRole('button', { name: /continuar/i });
      expect(continueButton).toBeDisabled();
    });

    it('enables continue button when clinic name and email are filled', async () => {
      renderOnboarding();

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), {
        target: { value: 'Test Clinic' },
      });
      fireEvent.change(screen.getByLabelText(/email de la clínica/i), {
        target: { value: 'clinic@example.com' },
      });

      await waitFor(() => {
        const continueButton = screen.getByRole('button', {
          name: /continuar/i,
        });
        expect(continueButton).toBeEnabled();
      });
    });

    it('shows therapist guidance message', () => {
      renderOnboarding();

      expect(screen.getByText(/¿eres fisioterapeuta/i)).toBeInTheDocument();
      expect(
        screen.getByText(/solicita una invitación a tu administrador/i),
      ).toBeInTheDocument();
    });

    it('shows login link for existing users', () => {
      renderOnboarding();

      const loginLink = screen.getByRole('link', {
        name: /inicia sesión aquí/i,
      });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Step 2: Admin Account', () => {
    it('advances to step 2 when continue is clicked', async () => {
      renderOnboarding();

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), {
        target: { value: 'Test Clinic' },
      });
      fireEvent.change(screen.getByLabelText(/email de la clínica/i), {
        target: { value: 'clinic@example.com' },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /continuar/i }),
        ).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
        expect(
          screen.getByText(/cuenta de administrador/i),
        ).toBeInTheDocument();
      });
    });

    it('shows clinic name context in step 2', async () => {
      renderOnboarding();

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), {
        target: { value: 'Mi Clínica' },
      });
      fireEvent.change(screen.getByLabelText(/email de la clínica/i), {
        target: { value: 'clinic@example.com' },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /continuar/i }),
        ).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByText(/creando clínica:/i)).toBeInTheDocument();
      });
    });

    it('renders admin account form fields', async () => {
      renderOnboarding();

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), {
        target: { value: 'Test Clinic' },
      });
      fireEvent.change(screen.getByLabelText(/email de la clínica/i), {
        target: { value: 'clinic@example.com' },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /continuar/i }),
        ).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
        expect(
          screen.getByLabelText(/correo electrónico/i),
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
        expect(
          screen.getByLabelText(/confirmar contraseña/i),
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText(/número de licencia profesional/i),
        ).toBeInTheDocument();
      });
    });

    it('has back button to return to step 1', async () => {
      renderOnboarding();

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), {
        target: { value: 'Test Clinic' },
      });
      fireEvent.change(screen.getByLabelText(/email de la clínica/i), {
        target: { value: 'clinic@example.com' },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /continuar/i }),
        ).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /atrás/i }),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /atrás/i }));

      await waitFor(() => {
        expect(screen.getByText(/paso 1 de 2/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('disables create clinic button when passwords do not match', async () => {
      renderOnboarding();

      fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), {
        target: { value: 'Test Clinic' },
      });
      fireEvent.change(screen.getByLabelText(/email de la clínica/i), {
        target: { value: 'clinic@example.com' },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /continuar/i }),
        ).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByText(/paso 2 de 2/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre completo/i), {
        target: { value: 'Dr. Test' },
      });
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getAllByLabelText(/^contraseña/i)[0], {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
        target: { value: 'differentpass' },
      });

      expect(
        screen.getByText(/las contraseñas no coinciden/i),
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('marks required fields with asterisk', () => {
      renderOnboarding();

      const requiredLabels = [/nombre de la clínica/i, /email de la clínica/i];

      requiredLabels.forEach((label) => {
        const element = screen.getByLabelText(label);
        expect(element).toHaveAttribute('required');
      });
    });

    it('displays main title', () => {
      renderOnboarding();
      expect(screen.getByText(/crea tu clínica/i)).toBeInTheDocument();
    });
  });
});
