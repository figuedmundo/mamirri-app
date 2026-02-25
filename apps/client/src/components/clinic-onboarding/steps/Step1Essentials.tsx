import { useEffect, useState } from 'react';
import { clinicsApi } from '../../../api/clinics';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { isStep1Valid, useClinicOnboarding } from '../ClinicOnboardingContext';

type Step1EssentialsProps = {
  onSetUpLater: () => void;
};

export function Step1Essentials({ onSetUpLater }: Step1EssentialsProps) {
  const { state, setCurrentStep, updateClinicData } = useClinicOnboarding();
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const trimmedName = state.clinicData.name.trim();

    if (trimmedName.length < 2) {
      setIsNameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingName(true);
      try {
        const result = await clinicsApi.checkNameAvailability(trimmedName);
        setIsNameAvailable(result.available);
      } catch {
        setIsNameAvailable(null);
      } finally {
        setIsCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state.clinicData.name]);

  const canContinue =
    isStep1Valid(state.clinicData) &&
    !isCheckingName &&
    isNameAvailable !== false;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clinic-name">Nombre de clínica</Label>
        <Input
          id="clinic-name"
          value={state.clinicData.name}
          onChange={(event) =>
            updateClinicData({
              name: event.target.value,
            })
          }
          placeholder="Nombre de clínica"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-email">Email de contacto</Label>
        <Input
          id="clinic-email"
          type="email"
          value={state.clinicData.email}
          onChange={(event) =>
            updateClinicData({
              email: event.target.value,
            })
          }
          placeholder="clinic@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-phone">Teléfono (opcional)</Label>
        <Input
          id="clinic-phone"
          value={state.clinicData.phone}
          onChange={(event) =>
            updateClinicData({
              phone: event.target.value,
            })
          }
          placeholder="+34 600 000 000"
        />
      </div>

      {isCheckingName ? (
        <p className="text-sm text-muted-foreground">Verificando nombre...</p>
      ) : null}

      {isNameAvailable === false ? (
        <p className="text-sm text-destructive">
          Ese nombre ya está en uso. Prueba uno distinto.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          className="h-12 text-base"
          disabled={!canContinue}
          onClick={() => setCurrentStep(2)}
        >
          Siguiente
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 text-base"
          onClick={onSetUpLater}
        >
          Configurar más tarde
        </Button>
      </div>
    </div>
  );
}
