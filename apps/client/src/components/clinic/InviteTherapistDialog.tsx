import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '../../hooks/use-toast';

interface InviteTherapistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    email: string;
    role: 'THERAPIST' | 'CLINIC_OWNER';
  }) => Promise<{ inviteUrl: string }>;
}

export function InviteTherapistDialog({
  open,
  onOpenChange,
  onSubmit,
}: InviteTherapistDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'THERAPIST' | 'CLINIC_OWNER'>('THERAPIST');
  const [loading, setLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!email) {
      return;
    }
    setLoading(true);
    try {
      const result = await onSubmit({ email, role });
      setInviteResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteResult?.inviteUrl) return;

    const invitePath = `/invite/accept?token=${inviteResult.token}`;
    const fullUrl = `${window.location.origin}${invitePath}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        description: 'Enlace copiado',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: 'destructive',
        description: 'No se pudo copiar el enlace',
      });
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('THERAPIST');
    setInviteResult(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {inviteResult ? 'Invitación enviada' : 'Invitar terapeuta'}
          </DialogTitle>
          <DialogDescription>
            {inviteResult
              ? 'Comparte el enlace de invitación con el terapeuta.'
              : 'Envía una invitación para unirse a esta clínica.'}
          </DialogDescription>
        </DialogHeader>

        {inviteResult ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/invite/accept?token=${inviteResult.token}`}
                readOnly
                className="h-12 text-sm"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className="h-12 px-4 shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {copied ? 'Copiado' : 'Copiar enlace'}
                </span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              El enlace expira en 24 horas. También se ha enviado un email a{' '}
              <strong>{email}</strong>.
            </p>
            <Button type="button" className="w-full h-12" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email del terapeuta</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="terapeuta@clinic.com"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rol</Label>
              <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as 'THERAPIST' | 'CLINIC_OWNER')
              }
            >
                <SelectTrigger id="invite-role" className="h-12">
                <SelectValue placeholder="Selecciona rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THERAPIST">Fisioterapeuta</SelectItem>
                <SelectItem value="CLINIC_OWNER">
                  Propietario de Clínica
                </SelectItem>
              </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              className="w-full h-12"
              onClick={handleSubmit}
              disabled={loading || !email}
            >
              {loading ? 'Enviando...' : 'Enviar invitación'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
