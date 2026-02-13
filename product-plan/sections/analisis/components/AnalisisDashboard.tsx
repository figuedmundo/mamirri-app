import type {
  AnalisisProps,
  Evaluacion,
} from '../../../../product/sections/analisis/types';

interface EvaluacionCardProps {
  evaluacion: Evaluacion;
  onVerEvaluacion?: () => void;
  onAnalizarHuella?: () => void;
  onAnalizarVideo?: () => void;
}

interface StatCardProps {
  title: string;
  value: number;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const getEvaluacionBadgeClass = (tipo: string) => {
  const classes: Record<string, string> = {
    inicial: 'bg-teal-100 text-teal-600 dark:bg-teal-200 dark:text-teal-700',
    final:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-200 dark:text-emerald-700',
    seguimiento: 'bg-sky-100 text-sky-600 dark:bg-sky-200 dark:text-sky-700',
  };
  return classes[tipo] || 'bg-slate-100 text-slate-600';
};

const getTrendIcon = (trend?: string) => {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '−';
};

export function AnalisisDashboard({
  evaluaciones,
  onVerEvaluacion,
  onAnalizarHuella,
  onAnalizarVideo,
  onCrearEvaluacion,
}: AnalisisProps) {
  const evaluacionesActivas = evaluaciones.filter(
    (e: Evaluacion) => e.tipoEvaluacion !== 'final',
  );
  const evaluacionesCompletadas = evaluaciones.filter(
    (e: Evaluacion) => e.tipoEvaluacion === 'final',
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Dashboard de Análisis
          </h1>
          <button
            onClick={onCrearEvaluacion}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Nueva Evaluación
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Evaluaciones"
            value={evaluaciones.length}
            trend={evaluaciones.length > 0 ? 'up' : undefined}
          />
          <StatCard
            title="Activas"
            value={evaluacionesActivas.length}
            label="en tratamiento"
          />
          <StatCard
            title="Completadas"
            value={evaluacionesCompletadas.length}
            label="tratamiento finalizado"
          />
          <StatCard
            title="Seguimiento"
            value={
              evaluaciones.filter(
                (e: Evaluacion) => e.tipoEvaluacion === 'seguimiento',
              ).length
            }
            label="en proceso"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
            <span className="text-2xl">Evaluaciones</span>
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
              {evaluaciones.length} registro
              {evaluaciones.length !== 1 ? 's' : ''}
            </span>
          </h2>

          <div className="space-y-4">
            {evaluaciones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                  No hay evaluaciones registradas
                </p>
                <button
                  onClick={onCrearEvaluacion}
                  className="mt-4 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Crear Primera Evaluación
                </button>
              </div>
            ) : (
              evaluaciones.map((evaluacion: Evaluacion) => (
                <EvaluacionCard
                  key={evaluacion.id}
                  evaluacion={evaluacion}
                  onVerEvaluacion={() => onVerEvaluacion?.(evaluacion.id)}
                  onAnalizarHuella={() => onAnalizarHuella?.(evaluacion.id)}
                  onAnalizarVideo={() => onAnalizarVideo?.(evaluacion.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluacionCard({
  evaluacion,
  onVerEvaluacion,
  onAnalizarHuella,
  onAnalizarVideo,
}: EvaluacionCardProps) {
  const badgeClass = getEvaluacionBadgeClass(evaluacion.tipoEvaluacion);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}
            >
              {evaluacion.tipoEvaluacion.charAt(0).toUpperCase() +
                evaluacion.tipoEvaluacion.slice(1)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {evaluacion.pacienteNombre}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {evaluacion.fecha}
              </p>
            </div>
          </div>
          <button
            onClick={onVerEvaluacion}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg font-medium transition-all duration-200"
          >
            Ver Detalles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Escala de Dolor
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Actividad
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {evaluacion.escalaDolor.actividad}/10
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Reposo
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {evaluacion.escalaDolor.reposo}/10
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Palpación
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {evaluacion.escalaDolor.palpacion}/10
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Herramientas
            </h4>
            <div className="flex gap-2">
              <button
                onClick={onAnalizarHuella}
                disabled={(evaluacion.huellas?.length || 0) === 0}
                className="flex-1 px-3 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Huellas ({evaluacion.huellas?.length || 0})
              </button>
              <button
                onClick={onAnalizarVideo}
                disabled={(evaluacion.videosPostura?.length || 0) === 0}
                className="flex-1 px-3 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Videos ({evaluacion.videosPostura?.length || 0})
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Resumen Diagnóstico
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {evaluacion.diagnostico.aspectoClinico}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, label, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {value}
        </span>
        {trend && (
          <span
            className={`text-sm font-medium ${trend === 'up' ? 'text-teal-500' : 'text-rose-500'}`}
          >
            {getTrendIcon(trend)}
          </span>
        )}
      </div>
      {label && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {label}
        </p>
      )}
    </div>
  );
}
