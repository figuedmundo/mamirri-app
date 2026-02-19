import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Step2Branding } from './Step2Branding';
import { Step3Team } from './Step3Team';
import {
  ClinicOnboardingProvider,
  useClinicOnboarding,
} from '../ClinicOnboardingContext';
import { LogoUpload } from '../components/LogoUpload';
import { ClinicOnboardingWizard } from '../ClinicOnboardingWizard';

const mockUploadClinicLogo = vi.fn();
const mockCheckNameAvailability = vi.fn();
const mockCreateClinic = vi.fn();

vi.mock('../../../api/clinics', () => ({
  clinicsApi: {
    uploadClinicLogo: (...args: unknown[]) => mockUploadClinicLogo(...args),
    checkNameAvailability: (...args: unknown[]) =>
      mockCheckNameAvailability(...args),
    create: (...args: unknown[]) => mockCreateClinic(...args),
    migrateSoloPatients: vi.fn(),
  },
}));

vi.mock('../../../hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Doc', role: 'THERAPIST', clinicId: null },
    updateUser: vi.fn(),
  }),
}));

function BrandingHarness() {
  const { setCurrentStep } = useClinicOnboarding();

  return (
    <div>
      <button type="button" onClick={() => setCurrentStep(2)}>
        set-step-2
      </button>
      <Step2Branding />
    </div>
  );
}

function TeamHarness() {
  const { setCurrentStep } = useClinicOnboarding();

  return (
    <div>
      <button type="button" onClick={() => setCurrentStep(3)}>
        set-step-3
      </button>
      <Step3Team onSubmit={vi.fn().mockResolvedValue(undefined)} />
    </div>
  );
}

describe('Clinic onboarding step components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUploadClinicLogo.mockResolvedValue('clinics/logos/logo.png');
    mockCheckNameAvailability.mockResolvedValue({ available: true });
    mockCreateClinic.mockResolvedValue({
      id: 'clinic-1',
      name: 'Mamirri Clinic',
    });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
  });

  it('renders all fields for Step2Branding', () => {
    render(
      <ClinicOnboardingProvider>
        <BrandingHarness />
      </ClinicOnboardingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-step-2' }));

    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subir logo/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Horario apertura lunes/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Horario cierre lunes/i)).toBeInTheDocument();
  });

  it('accepts valid image logo upload and stores uploaded value', async () => {
    const onChange = vi.fn();

    render(<LogoUpload value="" onChange={onChange} />);

    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/Subir logo/i), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockUploadClinicLogo).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('clinics/logos/logo.png');
    });
  });

  it('handles Step3Team invitations with add another flow', () => {
    render(
      <ClinicOnboardingProvider>
        <TeamHarness />
      </ClinicOnboardingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'set-step-3' }));
    fireEvent.change(screen.getByLabelText(/Email del terapeuta/i), {
      target: { value: 'new@clinic.com' },
    });
    fireEvent.change(screen.getByLabelText(/Rol/i), {
      target: { value: 'CLINIC_OWNER' },
    });

    fireEvent.click(screen.getByRole('button', { name: /\+ Add another/i }));

    expect(screen.getByText('new@clinic.com')).toBeInTheDocument();
    expect(screen.getAllByText('CLINIC_OWNER').length).toBeGreaterThan(0);
  });

  it('preserves data when navigating between wizard steps', async () => {
    render(
      <BrowserRouter>
        <ClinicOnboardingWizard />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Nombre de clínica/i), {
      target: { value: 'Mamirri Clinic' },
    });
    fireEvent.change(screen.getByLabelText(/Email de contacto/i), {
      target: { value: 'clinic@example.com' },
    });

    await waitFor(() => {
      expect(mockCheckNameAvailability).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(screen.getByLabelText(/Dirección/i), {
      target: { value: 'Calle Mayor 123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));

    expect(screen.getByLabelText(/Dirección/i)).toHaveValue('Calle Mayor 123');
  });
});
