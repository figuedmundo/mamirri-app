import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../hooks/use-auth';
import { onboardingApi } from '../api/onboarding';
import type { User } from '../context/types';
import { useDebounce } from '../hooks/use-debounce';

type Step = 1 | 2;

interface FormData {
  clinicName: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicAddress: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  adminLicenseNumber: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    clinicName: '',
    clinicEmail: '',
    clinicPhone: '',
    clinicAddress: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    adminLicenseNumber: '',
  });

  const [nameCheck, setNameCheck] = useState<{
    isChecking: boolean;
    available: boolean | null;
    error: string | null;
  }>({
    isChecking: false,
    available: null,
    error: null,
  });

  const checkNameAvailability = useCallback(async (name: string) => {
    if (name.length < 2) {
      setNameCheck({ isChecking: false, available: null, error: null });
      return;
    }

    setNameCheck((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const response = await onboardingApi.checkNameAvailability(name);
      setNameCheck({
        isChecking: false,
        available: response.available,
        error: response.available ? null : 'This name is already taken',
      });
    } catch {
      setNameCheck({
        isChecking: false,
        available: null,
        error: 'Could not check availability',
      });
    }
  }, []);

  const debouncedNameCheck = useDebounce(checkNameAvailability, 500);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);

    if (field === 'clinicName') {
      debouncedNameCheck(value);
    }
  };

  const canProceedToStep2 =
    formData.clinicName.length >= 2 &&
    formData.clinicEmail.includes('@') &&
    nameCheck.available === true;

  const canSubmit =
    formData.adminName.length > 0 &&
    formData.adminEmail.includes('@') &&
    formData.adminPassword.length >= 6 &&
    formData.adminPassword === formData.adminConfirmPassword;

  const handleContinue = () => {
    if (canProceedToStep2) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await onboardingApi.createClinicWithAdmin({
        clinicName: formData.clinicName,
        clinicEmail: formData.clinicEmail,
        clinicPhone: formData.clinicPhone || undefined,
        clinicAddress: formData.clinicAddress || undefined,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminLicenseNumber: formData.adminLicenseNumber || undefined,
      });

      const user: User = {
        ...response.user,
        licenseNumber: response.user.licenseNumber || undefined,
        clinicId: response.user.clinicId,
        createdAt: response.clinic.createdAt,
      };

      login(user, response.accessToken);
      localStorage.setItem('refresh_token', response.refreshToken);

      navigate('/onboarding/success', {
        state: { clinicName: response.clinic.name },
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create clinic';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="clinicName" className="text-sm font-medium">
          Nombre de la Clínica <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            id="clinicName"
            type="text"
            placeholder="ej., Fisioterapia García"
            value={formData.clinicName}
            onChange={(e) => updateField('clinicName', e.target.value)}
            className="h-12 text-lg pr-10"
            required
          />
          {formData.clinicName.length >= 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {nameCheck.isChecking ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : nameCheck.available === true ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : nameCheck.available === false ? (
                <X className="h-5 w-5 text-destructive" />
              ) : null}
            </div>
          )}
        </div>
        {nameCheck.error && (
          <p className="text-sm text-destructive">{nameCheck.error}</p>
        )}
        {nameCheck.available === true && (
          <p className="text-sm text-green-600">Nombre disponible</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="clinicEmail" className="text-sm font-medium">
          Email de la Clínica <span className="text-destructive">*</span>
        </label>
        <Input
          id="clinicEmail"
          type="email"
          placeholder="clinica@ejemplo.com"
          value={formData.clinicEmail}
          onChange={(e) => updateField('clinicEmail', e.target.value)}
          className="h-12 text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="clinicPhone" className="text-sm font-medium">
          Teléfono
        </label>
        <Input
          id="clinicPhone"
          type="tel"
          placeholder="+34 912 345 678"
          value={formData.clinicPhone}
          onChange={(e) => updateField('clinicPhone', e.target.value)}
          className="h-12 text-lg"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="clinicAddress" className="text-sm font-medium">
          Dirección
        </label>
        <textarea
          id="clinicAddress"
          placeholder="Calle Mayor 123, Madrid"
          value={formData.clinicAddress}
          onChange={(e) => updateField('clinicAddress', e.target.value)}
          className="w-full min-h-[80px] px-3 py-2 text-lg rounded-md border border-input bg-background resize-y"
        />
      </div>

      <div className="pt-4">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canProceedToStep2}
          className="w-full h-12 text-lg"
        >
          Continuar →
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          ¿Eres fisioterapeuta?{' '}
          <span className="text-primary">
            Para unirte a una clínica, solicita una invitación a tu
            administrador
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una clínica?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-muted p-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Creando clínica: <strong>{formData.clinicName}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="adminName" className="text-sm font-medium">
          Nombre Completo <span className="text-destructive">*</span>
        </label>
        <Input
          id="adminName"
          type="text"
          placeholder="Dra. María García"
          value={formData.adminName}
          onChange={(e) => updateField('adminName', e.target.value)}
          className="h-12 text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="adminEmail" className="text-sm font-medium">
          Correo Electrónico <span className="text-destructive">*</span>
        </label>
        <Input
          id="adminEmail"
          type="email"
          placeholder="maria@ejemplo.com"
          value={formData.adminEmail}
          onChange={(e) => updateField('adminEmail', e.target.value)}
          className="h-12 text-lg"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="adminPassword" className="text-sm font-medium">
          Contraseña <span className="text-destructive">*</span>
        </label>
        <Input
          id="adminPassword"
          type="password"
          placeholder="••••••••••••"
          value={formData.adminPassword}
          onChange={(e) => updateField('adminPassword', e.target.value)}
          className="h-12 text-lg"
          required
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">
          Debe tener al menos 6 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="adminConfirmPassword" className="text-sm font-medium">
          Confirmar Contraseña <span className="text-destructive">*</span>
        </label>
        <Input
          id="adminConfirmPassword"
          type="password"
          placeholder="••••••••••••"
          value={formData.adminConfirmPassword}
          onChange={(e) => updateField('adminConfirmPassword', e.target.value)}
          className="h-12 text-lg"
          required
        />
        {formData.adminConfirmPassword &&
          formData.adminPassword !== formData.adminConfirmPassword && (
            <p className="text-sm text-destructive">
              Las contraseñas no coinciden
            </p>
          )}
      </div>

      <div className="space-y-2">
        <label htmlFor="adminLicenseNumber" className="text-sm font-medium">
          Número de Licencia Profesional
        </label>
        <Input
          id="adminLicenseNumber"
          type="text"
          placeholder="F-12345"
          value={formData.adminLicenseNumber}
          onChange={(e) => updateField('adminLicenseNumber', e.target.value)}
          className="h-12 text-lg"
        />
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="flex-1 h-12 text-lg"
        >
          ← Atrás
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="flex-1 h-12 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Clínica →'
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[520px]">
        <CardHeader className="text-center space-y-2">
          <Building2 className="h-12 w-12 mx-auto text-primary" />
          <CardTitle className="text-2xl">Crea tu Clínica</CardTitle>
          <CardDescription>
            Paso {step} de 2
            {step === 1
              ? ': Información de la Clínica'
              : ': Cuenta de Administrador'}
          </CardDescription>

          <div className="flex items-center justify-center gap-2 pt-2">
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 1 ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <div className="w-8 h-0.5 bg-muted">
              <div
                className={`h-full bg-primary transition-all ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 2 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>
        </CardHeader>

        <CardContent>{step === 1 ? renderStep1() : renderStep2()}</CardContent>
      </Card>
    </div>
  );
}
