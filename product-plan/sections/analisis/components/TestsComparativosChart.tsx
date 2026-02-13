import type { TestComparativo } from '../types';

interface TestsComparativosChartProps {
  testsComparativos: TestComparativo[];
}

export function TestsComparativosChart({
  testsComparativos,
}: TestsComparativosChartProps) {
  if (!testsComparativos || testsComparativos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <p className="text-sm">No hay tests funcionales registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testsComparativos.map((test, index) => (
        <div
          key={`${test.test}-${index}`}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                Test de {test.test}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {test.unidad}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {test.estado === 'mejorado' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  ↑ Mejorado
                </span>
              )}
              {test.estado === 'empeorado' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  ↓ Empeorado
                </span>
              )}
              {test.estado === 'estable' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  → Estable
                </span>
              )}
              <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                {test.mejora}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">
                    Inicial
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {test.valorInicial}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((test.valorInicial / Math.max(test.valorInicial, test.valorFinal)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">
                    Final
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {test.valorFinal}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 dark:bg-teal-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((test.valorFinal / Math.max(test.valorInicial, test.valorFinal)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Diferencia:
                </span>
                <span
                  className={`font-semibold ${test.valorFinal > test.valorInicial ? 'text-teal-600 dark:text-teal-400' : test.valorFinal < test.valorInicial ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  {test.valorFinal > test.valorInicial ? '+' : ''}
                  {test.valorFinal - test.valorInicial}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
