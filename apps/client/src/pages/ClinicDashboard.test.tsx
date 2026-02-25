import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClinicDashboard from './ClinicDashboard';

vi.mock('../hooks/use-clinic', () => ({
  useClinic: () => ({
    clinicId: 'clinic-1',
    clinicName: 'Mamirri Clinic',
    role: 'CLINIC_OWNER',
    isAdmin: false,
    isClinicOwner: true,
  }),
}));

vi.mock('../api/clinics', () => ({
  clinicsApi: {
    getById: vi.fn().mockResolvedValue({
      id: 'clinic-1',
      name: 'Mamirri Clinic',
    }),
    listTherapists: vi.fn().mockResolvedValue([
      {
        id: 'u-1',
        name: 'Therapist One',
        email: 'therapist@clinic.com',
        role: 'THERAPIST',
        createdAt: new Date().toISOString(),
      },
    ]),
    listInvitations: vi.fn().mockResolvedValue([]),
    updateTherapist: vi.fn(),
    removeTherapist: vi.fn(),
    inviteTherapist: vi.fn().mockResolvedValue({
      id: 'inv-1',
      clinicId: 'clinic-1',
      email: 'test@test.com',
      role: 'THERAPIST',
      expiresAt: new Date().toISOString(),
      inviteUrl: '/invite/token123',
    }),
    updateById: vi.fn(),
  },
}));

describe('ClinicDashboard', () => {
  it('renders clinic panel for clinic owner', async () => {
    render(<ClinicDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Gestión de Clínica')).toBeInTheDocument();
    });

    expect(screen.getByText('Mamirri Clinic')).toBeInTheDocument();
    expect(screen.getByText('Therapist One')).toBeInTheDocument();
  });
});
