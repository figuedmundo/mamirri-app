import type { TimelineProps } from '../../types/patient';

export function Timeline({
  sessions,
  onViewSession,
  onAddSession,
  onEditSession,
}: TimelineProps) {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const getPainColor = (level: number) => {
    if (level <= 3)
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (level <= 6)
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Cronograma de Tratamiento
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Historial de intervenciones y progreso
          </p>
        </div>
        <button
          onClick={onAddSession}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg transition-colors shadow-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Nueva Sesión</span>
        </button>
      </div>

      <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-8">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              No hay sesiones registradas.
            </p>
            <button
              onClick={onAddSession}
              className="mt-4 text-teal-600 dark:text-teal-400 hover:underline"
            >
              Registrar la primera sesión
            </button>
          </div>
        ) : (
          sortedSessions.map((session) => (
            <div key={session.id} className="relative">
              <div className="absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-teal-500 shadow-sm"></div>

              <div
                className="group relative bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all cursor-pointer"
                onClick={() => onViewSession?.(session.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSession?.(session.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Editar sesión"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
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
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{session.patientResponse}"
                      </p>
                      <div
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-lg ${getPainColor(session.finalPainLevel)}`}
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
                    <svg
                      className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      {session.observations}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
