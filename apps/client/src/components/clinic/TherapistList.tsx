import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export interface TherapistRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TherapistListProps {
  therapists: TherapistRow[];
  onPromote: (therapistId: string) => void;
  onDemote: (therapistId: string) => void;
  onRemove: (therapistId: string) => void;
  isLoading?: boolean;
}

export function TherapistList({
  therapists,
  onPromote,
  onDemote,
  onRemove,
  isLoading,
}: TherapistListProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando terapeutas...</p>;
  }

  if (therapists.length === 0) {
    return <p className="text-sm text-slate-500">No hay terapeutas aún.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-600">
              Nombre
            </th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">
              Email
            </th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">
              Rol
            </th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {therapists.map((therapist) => {
            const isOwner = therapist.role === 'CLINIC_OWNER';
            return (
              <tr key={therapist.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{therapist.name}</td>
                <td className="px-3 py-2">{therapist.email}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{therapist.role}</Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    {isOwner ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onDemote(therapist.id)}
                      >
                        Bajar a terapeuta
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onPromote(therapist.id)}
                      >
                        Hacer owner
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove(therapist.id)}
                    >
                      Quitar
                    </Button>
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
