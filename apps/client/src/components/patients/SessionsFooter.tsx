import type { TreatmentSession } from '../../types/patient';

interface SessionsFooterProps {
  sessions: TreatmentSession[];
  formatDate: (date: string) => string;
}

export function SessionsFooter({ sessions, formatDate }: SessionsFooterProps) {
  if (sessions.length === 0) return null;

  const lastSession = sessions[sessions.length - 1];

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Sesiones registradas
          </span>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
            {sessions.length}
          </p>
        </div>
        <div className="text-right text-sm text-slate-600 dark:text-slate-400">
          <p>Última sesión:</p>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {formatDate(lastSession.date)}
          </p>
        </div>
      </div>
    </div>
  );
}
