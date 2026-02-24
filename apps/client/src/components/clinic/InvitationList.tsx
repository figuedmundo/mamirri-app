import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import type { InvitationSummary } from '../../api/clinics';

interface InvitationListProps {
  invitations: InvitationSummary[];
  isLoading: boolean;
  onResend: (
    email: string,
    role: 'THERAPIST' | 'CLINIC_OWNER',
  ) => Promise<void>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadge(status: InvitationSummary['status']) {
  const variants: Record<
    InvitationSummary['status'],
    { className: string; label: string }
  > = {
    ACCEPTED: {
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
      label: 'Aceptada',
    },
    PENDING: {
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      label: 'Pendiente',
    },
    EXPIRED: {
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
      label: 'Expirada',
    },
  };
  return variants[status];
}

export function InvitationList({
  invitations,
  isLoading,
  onResend,
}: InvitationListProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (invitation: InvitationSummary) => {
    const inviteUrl = `${window.location.origin}/invite/${invitation.token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedId(invitation.id);
      toast({
        description: 'Enlace copiado',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        variant: 'destructive',
        description: 'No se pudo copiar el enlace',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No hay invitaciones enviadas
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Rol
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Estado
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Enviado
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invitations.map((invitation) => {
            const statusBadge = getStatusBadge(invitation.status);
            const canResend =
              invitation.status === 'PENDING' ||
              invitation.status === 'EXPIRED';
            const isCopied = copiedId === invitation.id;

            return (
              <tr key={invitation.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{invitation.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {invitation.role === 'THERAPIST'
                      ? 'Fisioterapeuta'
                      : 'Propietario'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusBadge.className}>
                    {statusBadge.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(invitation.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(invitation)}
                      title="Copiar enlace de invitación"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {canResend ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onResend(
                            invitation.email,
                            invitation.role as 'THERAPIST' | 'CLINIC_OWNER',
                          )
                        }
                      >
                        Reenviar
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
