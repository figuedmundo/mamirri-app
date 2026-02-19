import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ClinicSettingsProps {
  initialValues: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  onSave: (values: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => Promise<void>;
}

export function ClinicSettings({ initialValues, onSave }: ClinicSettingsProps) {
  const [form, setForm] = useState({
    name: initialValues.name,
    address: initialValues.address ?? '',
    phone: initialValues.phone ?? '',
    email: initialValues.email ?? '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Nombre clínica"
      />
      <Input
        value={form.address}
        onChange={(e) => updateField('address', e.target.value)}
        placeholder="Dirección"
      />
      <Input
        value={form.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        placeholder="Teléfono"
      />
      <Input
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="Email"
      />
      <Button type="button" onClick={handleSave} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  );
}
