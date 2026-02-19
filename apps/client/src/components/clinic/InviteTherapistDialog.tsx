import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface InviteTherapistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    email: string;
    role: 'THERAPIST' | 'CLINIC_OWNER';
  }) => Promise<void>;
}

export function InviteTherapistDialog({
  open,
  onOpenChange,
  onSubmit,
}: InviteTherapistDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'THERAPIST' | 'CLINIC_OWNER'>('THERAPIST');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ email, role });
      setEmail('');
      setRole('THERAPIST');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar terapeuta</DialogTitle>
          <DialogDescription>
            Envia una invitacion para unirse a esta clinica.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="terapeuta@clinic.com"
          />
          <Select
            value={role}
            onValueChange={(value) =>
              setRole(value as 'THERAPIST' | 'CLINIC_OWNER')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THERAPIST">THERAPIST</SelectItem>
              <SelectItem value="CLINIC_OWNER">CLINIC_OWNER</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar invitación'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
