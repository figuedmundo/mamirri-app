import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useClinicOnboarding } from '../ClinicOnboardingContext';

type Step3TeamProps = {
  onSubmit: () => Promise<void>;
};

export function Step3Team({ onSubmit }: Step3TeamProps) {
  const { state, addInvitation, removeInvitation, setCurrentStep } =
    useClinicOnboarding();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'THERAPIST' | 'CLINIC_OWNER'>('THERAPIST');

  const addCurrentInvitation = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      return;
    }

    addInvitation({
      id: crypto.randomUUID(),
      email: trimmed,
      role,
    });
    setEmail('');
    setRole('THERAPIST');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invite-email">Email del terapeuta</Label>
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="terapeuta@clinic.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role">Rol</Label>
        <select
          id="invite-role"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as 'THERAPIST' | 'CLINIC_OWNER')
          }
        >
          <option value="THERAPIST">THERAPIST</option>
          <option value="CLINIC_OWNER">CLINIC_OWNER</option>
        </select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11"
        onClick={addCurrentInvitation}
      >
        + Add another
      </Button>

      {state.invitations.length > 0 ? (
        <ul className="space-y-2 rounded-md border p-3">
          {state.invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {invitation.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invitation.role}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeInvitation(invitation.id)}
              >
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-12 text-base"
          onClick={() => setCurrentStep(2)}
        >
          Atrás
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-12 text-base"
          onClick={onSubmit}
          disabled={state.isLoading}
        >
          Omitir por ahora
        </Button>
        <Button
          type="button"
          className="h-12 text-base"
          onClick={onSubmit}
          disabled={state.isLoading}
        >
          {state.isLoading ? 'Creando...' : 'Crear clínica'}
        </Button>
      </div>
    </div>
  );
}
