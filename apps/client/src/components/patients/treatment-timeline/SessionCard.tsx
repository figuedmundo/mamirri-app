import type { TreatmentSession } from '../../../types/patient';
import { Camera, FileText, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  session: TreatmentSession;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function getPainColor(level: number) {
  if (level <= 3)
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (level <= 6)
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}

export function SessionCard({
  session,
  onView,
  onEdit,
  onDelete,
}: SessionCardProps) {
  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm',
        'border border-slate-200 dark:border-slate-700',
        'hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all',
        onView && 'cursor-pointer',
      )}
      onClick={() => onView?.(session.id)}
      role={onView ? 'button' : undefined}
      tabIndex={onView ? 0 : undefined}
      onKeyDown={(e) => {
        if (onView && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onView(session.id);
        }
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            data-testid="session-date-badge"
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
          >
            {new Date(session.date).toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <span className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
            Fase {session.phaseNumber}
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session.id);
              }}
              className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Editar sesión"
              aria-label="Editar sesión"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Eliminar sesión"
              aria-label="Eliminar sesión"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Técnicas Aplicadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {session.procedures.map((procedure, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 text-sm rounded-md border border-sky-100 dark:border-sky-800/50"
              >
                {procedure}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Respuesta y Dolor
          </h3>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
              "{session.patientResponse}"
            </p>
            <div
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-lg',
                getPainColor(session.finalPainLevel),
              )}
            >
              <span className="text-sm font-bold">
                {session.finalPainLevel}
              </span>
              <span className="text-[10px] uppercase font-bold opacity-70">
                END
              </span>
            </div>
          </div>
        </div>
      </div>

      {session.observations && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500 dark:text-slate-400 italic line-clamp-2">
            {session.observations}
          </p>
        </div>
      )}

      {session.voiceNotes && session.voiceNotes.length > 0 && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded w-fit">
          <FileText className="w-3 h-3" />
          {session.voiceNotes.length} nota
          {session.voiceNotes.length > 1 ? 's' : ''} de voz
        </div>
      )}

      {session.photos && session.photos.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded w-fit">
          <Camera className="w-3 h-3" />
          {session.photos.length} foto{session.photos.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
