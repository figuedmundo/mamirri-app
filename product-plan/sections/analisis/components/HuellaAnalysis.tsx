import type { Huella } from '../../../../product/sections/analisis/types'

interface HuellaAnalysisProps {
  pacienteNombre: string
  huellas: Huella[]
  tipoEvaluacion: 'inicial' | 'final' | 'seguimiento'
  onLoadHuella?: (lado: 'izquierdo' | 'derecho') => void
  onCompararConAnterior?: () => void
  onExportar?: () => void
  onVolver?: () => void
}

export function HuellaAnalysis({
  pacienteNombre,
  huellas,
  tipoEvaluacion,
  onLoadHuella,
  onCompararConAnterior,
  onExportar,
  onVolver,
}: HuellaAnalysisProps) {
  const huellaIzquierda = huellas.find(h => h.lado === 'izquierdo')
  const huellaDerecha = huellas.find(h => h.lado === 'derecho')

  const getTipoBadgeClass = () => {
    const classes: Record<string, string> = {
      inicial: 'bg-teal-100 text-teal-700 dark:bg-teal-200 dark:text-teal-800',
      final: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800',
      seguimiento: 'bg-sky-100 text-sky-700 dark:bg-sky-200 dark:text-sky-800',
    }
    return classes[tipoEvaluacion] || 'bg-slate-100 text-slate-700'
  }

  const getArcoBadge = (arco: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      normal: { class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800', label: 'Normal' },
      colapsado: { class: 'bg-rose-100 text-rose-700 dark:bg-rose-200 dark:text-rose-800', label: 'Colapsado' },
      cavo: { class: 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800', label: 'Cavo' },
    }
    return badges[arco] || { class: 'bg-slate-100 text-slate-700', label: arco }
  }

  const getPresionColor = (presion: string) => {
    const colors: Record<string, string> = {
      normal: 'text-emerald-600 dark:text-emerald-400',
      alta: 'text-rose-600 dark:text-rose-400',
      baja: 'text-amber-600 dark:text-amber-400',
    }
    return colors[presion] || 'text-slate-600'
  }

  const getDesviacionBadge = (desviacion: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      normal: { class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800', label: 'Normal' },
      valgo: { class: 'bg-rose-100 text-rose-700 dark:bg-rose-200 dark:text-rose-800', label: 'Valgo' },
      varo: { class: 'bg-sky-100 text-sky-700 dark:bg-sky-200 dark:text-sky-800', label: 'Varo' },
    }
    return badges[desviacion] || { class: 'bg-slate-100 text-slate-700', label: desviacion }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <button
              onClick={onVolver}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              ← Volver al Dashboard
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Análisis de Huellas
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {pacienteNombre}
                </p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTipoBadgeClass()}`}>
                  {tipoEvaluacion.charAt(0).toUpperCase() + tipoEvaluacion.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCompararConAnterior}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all duration-200 border border-slate-200 dark:border-slate-600"
            >
              Comparar con Anterior
            </button>
            <button
              onClick={onExportar}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Exportar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Pie Izquierdo
              </h2>
            </div>
            <div className="p-6">
              {huellaIzquierda ? (
                <HuellaView
                  huella={huellaIzquierda}
                  getArcoBadge={getArcoBadge}
                  getPresionColor={getPresionColor}
                  getDesviacionBadge={getDesviacionBadge}
                />
              ) : (
                <HuellaEmptyState
                  lado="izquierdo"
                  onLoadHuella={() => onLoadHuella?.('izquierdo')}
                />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Pie Derecho
              </h2>
            </div>
            <div className="p-6">
              {huellaDerecha ? (
                <HuellaView
                  huella={huellaDerecha}
                  getArcoBadge={getArcoBadge}
                  getPresionColor={getPresionColor}
                  getDesviacionBadge={getDesviacionBadge}
                />
              ) : (
                <HuellaEmptyState
                  lado="derecho"
                  onLoadHuella={() => onLoadHuella?.('derecho')}
                />
              )}
            </div>
          </div>
        </div>

        {huellaIzquierda && huellaDerecha && (
          <SimmetryAnalysis
            izquierda={huellaIzquierda}
            derecha={huellaDerecha}
          />
        )}
      </div>
    </div>
  )
}

interface HuellaViewProps {
  huella: Huella
  getArcoBadge: (arco: string) => { class: string; label: string }
  getPresionColor: (presion: string) => string
  getDesviacionBadge: (desviacion: string) => { class: string; label: string }
}

function HuellaView({ huella, getArcoBadge, getPresionColor, getDesviacionBadge }: HuellaViewProps) {
  const arcoBadge = getArcoBadge(huella.analisis.arco)
  const desviacionBadge = getDesviacionBadge(huella.analisis.desviacion)

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-teal-400/20 to-teal-600/20 border-4 border-teal-500/30 flex items-center justify-center">
                <span className="text-4xl">🦶</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Imagen de huella</p>
            </div>
          </div>

          <PressureHeatmapOverlay
            presionMapa={huella.analisis.presionMapa}
            zonasSensibles={huella.analisis.zonasSensibles}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          {huella.fecha}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${arcoBadge.class}`}>
          Arco: {arcoBadge.label}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${desviacionBadge.class}`}>
          Desviación: {desviacionBadge.label}
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Análisis de Presión</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Talón</p>
            <p className={`text-sm font-medium ${getPresionColor(huella.analisis.presionTalon)}`}>
              {huella.analisis.presionTalon.charAt(0).toUpperCase() + huella.analisis.presionTalon.slice(1)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Antepié</p>
            <p className={`text-sm font-medium ${getPresionColor(huella.analisis.presionAntepie)}`}>
              {huella.analisis.presionAntepie.charAt(0).toUpperCase() + huella.analisis.presionAntepie.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {huella.analisis.zonasSensibles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Zonas Sensibles</h3>
          <div className="flex flex-wrap gap-2">
            {huella.analisis.zonasSensibles.map((zona, idx) => (
              <ZonaSensibleBadge key={idx} zona={zona} />
            ))}
          </div>
        </div>
      )}

      {huella.comparacion && (
        <div className="bg-sky-50 dark:bg-slate-700 rounded-xl p-4 space-y-2 border border-sky-200 dark:border-sky-800">
          <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-300">Comparación con Evaluación Inicial</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{huella.comparacion.mejoraDolor}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{huella.comparacion.recuperacionROM}</p>
        </div>
      )}
    </div>
  )
}

interface HuellaEmptyStateProps {
  lado: 'izquierdo' | 'derecho'
  onLoadHuella: () => void
}

function HuellaEmptyState({ lado, onLoadHuella }: HuellaEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <span className="text-4xl opacity-50">🦶</span>
      </div>
      <div className="text-center space-y-2">
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          No hay huella del {lado === 'izquierdo' ? 'pie izquierdo' : 'pie derecho'}
        </p>
        <button
          onClick={onLoadHuella}
          className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Cargar Huella
        </button>
      </div>
    </div>
  )
}

interface SimmetryAnalysisProps {
  izquierda: Huella
  derecha: Huella
}

function SimmetryAnalysis({ izquierda, derecha }: SimmetryAnalysisProps) {
  const getSimmetryStatus = () => {
    if (izquierda.analisis.arco === derecha.analisis.arco) {
      return {
        status: 'simetrico',
        class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800',
        label: 'Simétrico',
      }
    }
    return {
      status: 'asimetrico',
      class: 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800',
      label: 'Asimétrico',
    }
  }

  const simmetry = getSimmetryStatus()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
        <span>⚖️</span>
        Análisis de Simetría
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`p-4 rounded-xl ${simmetry.class}`}>
          <p className="text-sm opacity-80 mb-1">Estado de Simetría</p>
          <p className="text-xl font-bold">{simmetry.label}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Comparación de Arcos</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Izquierdo:</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {izquierda.analisis.arco.charAt(0).toUpperCase() + izquierda.analisis.arco.slice(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Derecho:</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {derecha.analisis.arco.charAt(0).toUpperCase() + derecha.analisis.arco.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Comparación de Desviación</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Izquierdo:</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {izquierda.analisis.desviacion.charAt(0).toUpperCase() + izquierda.analisis.desviacion.slice(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Derecho:</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {derecha.analisis.desviacion.charAt(0).toUpperCase() + derecha.analisis.desviacion.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PressureHeatmapOverlayProps {
  presionMapa: {
    talon: number
    medio: number
    antepie: number
    borde: number
  }
  zonasSensibles: Array<{
    zona: string
    intensidad: 'baja' | 'media' | 'alta' | 'muy-alta'
    color: string
  }>
}

function PressureHeatmapOverlay({ presionMapa, zonasSensibles }: PressureHeatmapOverlayProps) {
  const getHeatmapOpacity = (value: number) => {
    return Math.min(value / 100 * 0.6, 0.6)
  }

  return (
    <div className="absolute inset-4 pointer-events-none">
      <div
        className="absolute bottom-[10%] left-[35%] w-[30%] h-[20%] rounded-full transition-opacity"
        title={`Talón: ${presionMapa.talon}%`}
        style={{
          backgroundColor: `rgba(239, 68, 68, ${getHeatmapOpacity(presionMapa.talon)})`,
        }}
      />
      <div
        className="absolute bottom-[30%] left-[40%] w-[20%] h-[15%] rounded-full transition-opacity"
        title={`Medio: ${presionMapa.medio}%`}
        style={{
          backgroundColor: `rgba(251, 191, 36, ${getHeatmapOpacity(presionMapa.medio)})`,
        }}
      />
      <div
        className="absolute top-[20%] left-[35%] w-[30%] h-[25%] rounded-full transition-opacity"
        title={`Antepié: ${presionMapa.antepie}%`}
        style={{
          backgroundColor: `rgba(34, 197, 94, ${getHeatmapOpacity(presionMapa.antepie)})`,
        }}
      />

      {zonasSensibles.map((zona, idx) => {
        const intensidadOpacity = {
          'baja': 0.2,
          'media': 0.4,
          'alta': 0.6,
          'muy-alta': 0.8,
        }[zona.intensidad]

        return (
          <div
            key={idx}
            className="absolute w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 transition-opacity"
            style={{
              backgroundColor: zona.color,
              opacity: intensidadOpacity,
            }}
            title={`${zona.zona}: ${zona.intensidad}`}
          />
        )
      })}
    </div>
  )
}

function ZonaSensibleBadge({ zona }: { zona: { zona: string; intensidad: string; color: string } }) {
  const intensidadClass = {
    'baja': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    'media': 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800',
    'alta': 'bg-orange-100 text-orange-700 dark:bg-orange-200 dark:text-orange-800',
    'muy-alta': 'bg-rose-100 text-rose-700 dark:bg-rose-200 dark:text-rose-800',
  }[zona.intensidad]

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${intensidadClass}`}>
      {zona.zona.charAt(0).toUpperCase() + zona.zona.slice(1)}
    </span>
  )
}
