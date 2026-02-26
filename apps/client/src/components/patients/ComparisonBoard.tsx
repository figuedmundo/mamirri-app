import React from 'react';
import { getActiveEvaluation } from '../../lib/evaluation-utils';
import type { ComparisonProps } from '../../types/patient';

type ViewMode = 'slider' | 'side-by-side';

import { Loader2 } from 'lucide-react';

export function ComparisonBoard({
  clinicalCase,
  onExport,
  onShare,
}: ComparisonProps) {
  const [activeTab, setActiveTab] = React.useState<
    'footprints' | 'posture' | 'tests'
  >('footprints');
  const [viewMode, setViewMode] = React.useState<ViewMode>('side-by-side');
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!onExport) return;
    try {
      setIsExporting(true);
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  const activeEvaluation = getActiveEvaluation(clinicalCase);

  const initialFootprint = activeEvaluation?.footprints.find(
    (h) => h.type === 'initial',
  );
  const finalFootprint = activeEvaluation?.footprints.find(
    (h) => h.type === 'final',
  );

  const toggleMode = () => {
    const newMode: ViewMode = viewMode === 'slider' ? 'side-by-side' : 'slider';
    setViewMode(newMode);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Comparativa de Evolución
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {clinicalCase.title}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
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
                d="M8 17a3 3 0 003 3h10a3 3 0 110-2.684a3 3 0 110-2.684l6.632 3.316m0 0a3 3 0 00-5.368a3 3 0 105.368 2.684a3 3 0 00-5.368a3 3 0 00-3.316m0 0a3 3 0 105.368 2.684z"
              />
            </svg>
            Compartir
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 110-2.684l6.632 3.316m0 0a3 3 0 003 3h10a3 3 0 105.368 2.684a3 3 0 00-5.368a3 3 0 00-3.316m0 0a3 3 0 003 3v-1m-4.4l4 4V4"
                />
              </svg>
            )}
            {isExporting ? 'Generando...' : 'Exportar Informe'}
          </button>
        </div>

        <button
          onClick={toggleMode}
          className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
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
              d="M8 17a3 3 0 003 3h10a3 3 0 110-2.684l6.632 3.316m0 0a3 3 0 00-5.368a3 3 0 00-3.316m0 0a3 3 0 00-3.316m0 0 105.368 2.684a3 3 0 00-3.316m0 0 0 003 3v-1m-4 4l4 4V4"
            />
          </svg>
          {viewMode === 'slider' ? (
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              Slider
            </span>
          ) : (
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              Side by Side
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'footprints', label: 'Huellas Plantares' },
          { id: 'posture', label: 'Análisis Postural' },
          { id: 'tests', label: 'Datos Clínicos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(tab.id as 'footprints' | 'posture' | 'tests')
            }
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'footprints' && viewMode === 'slider' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ANTES
                </span>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {initialFootprint?.date
                    ? new Date(initialFootprint.date).toLocaleDateString()
                    : 'Sin datos'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                {initialFootprint ? (
                  <img
                    src={initialFootprint.url}
                    alt="Huella antes"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400">No disponible</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  DESPUÉS
                </span>
                <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
                  {finalFootprint?.date
                    ? new Date(finalFootprint.date).toLocaleDateString()
                    : 'Pendiente'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-2 border-teal-500/20 dark:border-teal-500/30 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-teal-50/10 dark:bg-teal-900/10 relative">
                {finalFootprint?.url ? (
                  <img
                    src={finalFootprint.url}
                    alt="Huella después"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-teal-600/50 dark:text-teal-400/50 font-medium">
                    Pendiente
                  </span>
                )}

                {finalFootprint?.comparison && (
                  <div className="absolute bottom-4 right-4 bg-teal-50 dark:bg-teal-900/10 rounded-full text-xs font-medium text-teal-700 dark:text-teal-300 px-2 py-1 border border-teal-200 dark:border-teal-800 shadow-sm backdrop-blur-sm">
                    Mejora de arco: {finalFootprint.comparison.archDifference}mm
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
