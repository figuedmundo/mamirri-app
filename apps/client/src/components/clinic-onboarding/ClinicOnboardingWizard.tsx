import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { clinicsApi } from '../../api/clinics';
import { useAuth } from '../../hooks/use-auth';
import {
  ClinicOnboardingProvider,
  useClinicOnboarding,
} from './ClinicOnboardingContext';
import { ProgressIndicator } from './components/ProgressIndicator';
import { Step1Essentials } from './steps/Step1Essentials';
import { Step2Branding } from './steps/Step2Branding';
import { Step3Team } from './steps/Step3Team';

function ClinicOnboardingWizardContent() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { state, setCurrentStep, setError, setLoading, reset } =
    useClinicOnboarding();

  useEffect(() => {
    if (user?.clinicId) {
      navigate('/', { replace: true });
    }
  }, [navigate, user?.clinicId]);

  const handleSetUpLater = () => {
    localStorage.setItem('clinic_onboarding_skipped', 'true');
    localStorage.setItem('clinic_onboarding_solo_mode', 'true');
    reset();
    navigate('/');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const payload = {
        name: state.clinicData.name.trim(),
        email: state.clinicData.email.trim(),
        phone: state.clinicData.phone.trim() || undefined,
        address: state.clinicData.address.trim() || undefined,
        logoUrl: state.clinicData.logoUrl.trim() || undefined,
        businessHours: {
          monday: {
            open: state.clinicData.mondayOpen,
            close: state.clinicData.mondayClose,
            closed: false,
          },
        },
        initialInvitations:
          state.invitations.length > 0
            ? state.invitations.map((invitation) => ({
                email: invitation.email,
                role: invitation.role,
              }))
            : undefined,
      };

      const clinic = await clinicsApi.create(payload);

      if (localStorage.getItem('clinic_onboarding_solo_mode') === 'true') {
        await clinicsApi.migrateSoloPatients(clinic.id);
      }

      updateUser({
        clinicId: clinic.id,
        clinicName: clinic.name,
        role: 'CLINIC_OWNER',
      });

      localStorage.removeItem('clinic_onboarding_solo_mode');
      localStorage.removeItem('clinic_onboarding_skipped');
      reset();

      navigate(
        `/onboarding/quick-start?clinicId=${clinic.id}&clinicName=${encodeURIComponent(
          clinic.name,
        )}`,
      );
    } catch {
      setError('No se pudo crear la clínica. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-[520px] shadow-lg">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Configurar clínica</CardTitle>
            <CardDescription>
              Paso {state.currentStep} de 3 - configura tu espacio de trabajo.
            </CardDescription>
          </div>
          <ProgressIndicator
            currentStep={state.currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </CardHeader>
        <CardContent>
          {state.currentStep === 1 ? (
            <Step1Essentials onSetUpLater={handleSetUpLater} />
          ) : null}
          {state.currentStep === 2 ? <Step2Branding /> : null}
          {state.currentStep === 3 ? (
            <Step3Team onSubmit={handleSubmit} />
          ) : null}

          {state.error ? (
            <p className="mt-4 text-sm text-destructive">{state.error}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function ClinicOnboardingWizard() {
  return (
    <ClinicOnboardingProvider>
      <ClinicOnboardingWizardContent />
    </ClinicOnboardingProvider>
  );
}
