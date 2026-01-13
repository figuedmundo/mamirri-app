import type { DiagnosticoPeriodo } from '../types'

interface DiagnosticoComparativoCardProps {
  diagnosticoComparativo: DiagnosticoPeriodo
  conclusion?: string
}

export function DiagnosticoComparativoCard({
  diagnosticoComparativo,
  conclusion
}: DiagnosticoComparativoCardProps) {
  const DiagnosisSection = ({
    title,
    initial,
    final
  }: {
    title: string
    initial: string
    final: string
  }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-20 text-xs font-medium text-slate-500 dark:text-slate-500 uppercase">
            Inicial
          </span>
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {initial}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-20 text-xs font-medium text-teal-600 dark:text-teal-400 uppercase">
            Final
          </span>
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {final}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-teal-500 rounded-full" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Diagnóstico Comparativo
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DiagnosisSection
            title="Indicador Funcional"
            initial={diagnosticoComparativo.inicial.indicadorFuncional}
            final={diagnosticoComparativo.final.indicadorFuncional}
          />
          <DiagnosisSection
            title="Aspecto Clínico"
            initial={diagnosticoComparativo.inicial.aspectoClinico}
            final={diagnosticoComparativo.final.aspectoClinico}
          />
        </div>

        <div className="space-y-6">
          <DiagnosisSection
            title="Anatomopatología"
            initial={diagnosticoComparativo.inicial.anatomopatologia}
            final={diagnosticoComparativo.final.anatomopatologia}
          />
          <DiagnosisSection
            title="Consecuencias AVD"
            initial={diagnosticoComparativo.inicial.consecuenciasAVD}
            final={diagnosticoComparativo.final.consecuenciasAVD}
          />
        </div>
      </div>

      {conclusion && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-1">
                  Conclusión
                </h4>
                <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">
                  {conclusion}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
