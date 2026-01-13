import type { DolorComparativo } from '../types'

interface DolorChartProps {
  dolorComparativo: DolorComparativo
}

export function DolorChart({ dolorComparativo }: DolorChartProps) {
  const getPainColor = (level: number) => {
    if (level <= 2) return 'teal'
    if (level <= 4) return 'sky'
    if (level <= 6) return 'yellow'
    if (level <= 8) return 'orange'
    return 'red'
  }

  const PainBar = ({
    label,
    initial,
    final,
    improvement
  }: {
    label: string
    initial: number
    final: number
    improvement: string
  }) => {
    const initialColor = getPainColor(initial)
    const finalColor = getPainColor(final)

    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </h4>
          <span className={`text-sm font-bold ${final < initial ? 'text-teal-600 dark:text-teal-400' : final > initial ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {improvement}
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Inicial</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {initial}/10
              </span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${initialColor}-500 dark:bg-${initialColor}-600 rounded-full transition-all duration-500`}
                style={{ width: `${initial * 10}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Final</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {final}/10
              </span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${finalColor}-500 dark:bg-${finalColor}-600 rounded-full transition-all duration-500`}
                style={{ width: `${final * 10}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Reducción:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.max(0, initial - final)}/10
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
        Evolución de Dolor (Escala END)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PainBar
          label="En Actividad"
          initial={dolorComparativo.actividad.valorInicial}
          final={dolorComparativo.actividad.valorFinal}
          improvement={dolorComparativo.actividad.mejora}
        />
        <PainBar
          label="En Reposo"
          initial={dolorComparativo.reposo.valorInicial}
          final={dolorComparativo.reposo.valorFinal}
          improvement={dolorComparativo.reposo.mejora}
        />
        <PainBar
          label="Al Palpación"
          initial={dolorComparativo.palpacion.valorInicial}
          final={dolorComparativo.palpacion.valorFinal}
          improvement={dolorComparativo.palpacion.mejora}
        />
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span>0-2 (Sin dolor)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span>3-4 (Leve)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>5-6 (Moderado)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>7-8 (Severo)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>9-10 (Muy severo)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
