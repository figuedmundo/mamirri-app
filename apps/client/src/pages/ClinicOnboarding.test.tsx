import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ClinicOnboarding from './ClinicOnboarding';

const mockNavigate = vi.fn();
const mockUpdateUser = vi.fn();
const mockCheckName = vi.fn();
const mockCreate = vi.fn();
const mockMigrate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Doc', clinicId: null, role: 'THERAPIST' },
    updateUser: mockUpdateUser,
  }),
}));

vi.mock('../api/clinics', () => ({
  clinicsApi: {
    uploadClinicLogo: vi.fn(),
    checkNameAvailability: (...args: unknown[]) => mockCheckName(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    migrateSoloPatients: (...args: unknown[]) => mockMigrate(...args),
  },
}));

describe('ClinicOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('allows skipping to solo mode', () => {
    render(
      <BrowserRouter>
        <ClinicOnboarding />
      </BrowserRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /configurar más tarde/i }),
    );

    expect(localStorage.getItem('clinic_onboarding_solo_mode')).toBe('true');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('creates clinic after finishing wizard', async () => {
    mockCheckName.mockResolvedValue({ available: true });
    mockCreate.mockResolvedValue({ clinic: { id: 'clinic-1', name: 'Mamirri Clinic' } });

    render(
      <BrowserRouter>
        <ClinicOnboarding />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nombre de clínica/i), {
      target: { value: 'Mamirri Clinic' },
    });
    fireEvent.change(screen.getByLabelText(/email de contacto/i), {
      target: { value: 'clinic@example.com' },
    });

    await waitFor(() => {
      expect(mockCheckName).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /crear clínica/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      clinicId: 'clinic-1',
      clinicName: 'Mamirri Clinic',
      role: 'CLINIC_OWNER',
    });
  });
});
