import type { AnalisisProps } from '../types';
import { TestsComparativosChart } from './TestsComparativosChart';
import { DolorChart } from './DolorChart';
import { DiagnosticoComparativoCard } from './DiagnosticoComparativoCard';

export function EvolucionDashboard({
  evoluciones = [],
  onVerEvaluacion,
  onVerEvolucion,
}: AnalisisProps) {
  if (!evoluciones || evoluciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 dark:text-slate-500">
        <svg
          className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-lg font-medium mb-2">
          No hay evoluciones registradas
        </p>
        <p className="text-sm text-center max-w-md">
          Las evoluciones aparecen aquí cuando se completan evaluaciones
          iniciales y finales de un paciente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Dashboard de Evolución
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comparativa objetiva entre evaluaciones iniciales y finales
          </p>
        </div>
        {onVerEvolucion && (
          <button
            onClick={() => onVerEvolucion?.(evoluciones[0]?.id || '')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Nueva Evolución
          </button>
        )}
      </div>

      <div className="space-y-6">
        {evoluciones.map((evolucion) => (
          <div
            key={evolucion.id}
            className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {evolucion.pacienteNombre}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                    Evolución Completada
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {evolucion.fechaInicio} - {evolucion.fechaFin}
                    </span>
                  </div>
                  {onVerEvaluacion && (
                    <button
                      onClick={() =>
                        onVerEvaluacion?.(evolucion.evaluacionFinalId)
                      }
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                    >
                      Ver Evaluaciones →
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <TestsComparativosChart
                  testsComparativos={evolucion.testsComparativos}
                />
              </div>

              <div>
                <DolorChart dolorComparativo={evolucion.dolorComparativo} />
              </div>
            </div>

            <div className="mt-6">
              <DiagnosticoComparativoCard
                diagnosticoComparativo={evolucion.diagnosticoComparativo}
                conclusion={evolucion.conclusion}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
