import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LogoUpload } from '../clinic-onboarding/components/LogoUpload';

type BusinessHoursValue = {
  monday?: {
    open?: string;
    close?: string;
    closed?: boolean;
  };
};

interface ClinicSettingsProps {
  initialValues: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    subdomain?: string | null;
    businessHours?: Record<string, unknown> | null;
  };
  onSave: (values: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    subdomain?: string | null;
    businessHours?: Record<string, unknown> | null;
  }) => Promise<void>;
}

function readMondayHours(businessHours?: Record<string, unknown> | null): {
  mondayOpen: string;
  mondayClose: string;
} {
  const monday = (businessHours as BusinessHoursValue | null)?.monday;
  return {
    mondayOpen: monday?.open ?? '',
    mondayClose: monday?.close ?? '',
  };
}

export function ClinicSettings({ initialValues, onSave }: ClinicSettingsProps) {
  const mondayHours = readMondayHours(initialValues.businessHours);
  const [form, setForm] = useState({
    name: initialValues.name,
    address: initialValues.address ?? '',
    phone: initialValues.phone ?? '',
    email: initialValues.email ?? '',
    logoUrl: initialValues.logoUrl ?? '',
    subdomain: initialValues.subdomain ?? '',
    mondayOpen: mondayHours.mondayOpen,
    mondayClose: mondayHours.mondayClose,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const mondayOpen = form.mondayOpen.trim();
    const mondayClose = form.mondayClose.trim();
    const hasPartialMondayHours =
      (mondayOpen && !mondayClose) || (!mondayOpen && mondayClose);

    if (hasPartialMondayHours) {
      setError('Completa ambos horarios de lunes o deja ambos vacios.');
      return;
    }

    const baseBusinessHours =
      (initialValues.businessHours as Record<string, unknown> | null) ?? {};
    const businessHours =
      mondayOpen && mondayClose
        ? {
            ...baseBusinessHours,
            monday: {
              open: mondayOpen,
              close: mondayClose,
              closed: false,
            },
          }
        : null;

    setLoading(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        logoUrl: form.logoUrl.trim() || null,
        subdomain: form.subdomain.trim() || null,
        businessHours,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clinic-name">Nombre clínica</Label>
        <Input
          id="clinic-name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Nombre clínica"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-address">Dirección</Label>
        <Input
          id="clinic-address"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Dirección"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-phone">Teléfono</Label>
        <Input
          id="clinic-phone"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="Teléfono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-email">Email</Label>
        <Input
          id="clinic-email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="Email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinic-subdomain">Subdominio</Label>
        <Input
          id="clinic-subdomain"
          value={form.subdomain}
          onChange={(e) => updateField('subdomain', e.target.value)}
          placeholder="mi-clinica"
        />
      </div>

      <LogoUpload
        value={form.logoUrl}
        onChange={(value) => updateField('logoUrl', value)}
      />

      <div className="space-y-2">
        <Label>Horario de atención (Lunes)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="time"
            aria-label="Horario apertura lunes"
            value={form.mondayOpen}
            onChange={(event) => updateField('mondayOpen', event.target.value)}
          />
          <Input
            type="time"
            aria-label="Horario cierre lunes"
            value={form.mondayClose}
            onChange={(event) => updateField('mondayClose', event.target.value)}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  );
}
