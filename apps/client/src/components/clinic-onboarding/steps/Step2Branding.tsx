import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useClinicOnboarding } from '../ClinicOnboardingContext';
import { LogoUpload } from '../components/LogoUpload';

export function Step2Branding() {
  const { state, setCurrentStep, updateClinicData } = useClinicOnboarding();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clinic-address">Dirección</Label>
        <Textarea
          id="clinic-address"
          value={state.clinicData.address}
          onChange={(event) =>
            updateClinicData({
              address: event.target.value,
            })
          }
          placeholder="Calle Mayor 123, Madrid"
        />
      </div>

      <LogoUpload
        value={state.clinicData.logoUrl}
        onChange={(value) => updateClinicData({ logoUrl: value })}
      />

      <div className="space-y-2">
        <Label>Horario de atención (Lunes)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="time"
            aria-label="Horario apertura lunes"
            value={state.clinicData.mondayOpen}
            onChange={(event) =>
              updateClinicData({
                mondayOpen: event.target.value,
              })
            }
          />
          <Input
            type="time"
            aria-label="Horario cierre lunes"
            value={state.clinicData.mondayClose}
            onChange={(event) =>
              updateClinicData({
                mondayClose: event.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 text-base"
          onClick={() => setCurrentStep(1)}
        >
          Atrás
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 text-base"
          onClick={() => setCurrentStep(3)}
        >
          Omitir por ahora
        </Button>
        <Button
          type="button"
          className="h-12 text-base"
          onClick={() => setCurrentStep(3)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
