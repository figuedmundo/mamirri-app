import type { Posturograma, DesviacionDetectada, PuntoAnatomico } from '../../../../product/sections/analisis/types'

interface PosturogramaViewProps {
  pacienteNombre: string
  tipoEvaluacion: 'inicial' | 'final' | 'seguimiento'
  posturograma: Posturograma
  desviacionesDetectadas: DesviacionDetectada[]
  onEditarMarcadores?: () => void
  onCompararConAnterior?: () => void
  onExportar?: () => void
  onVolver?: () => void
}

export function PosturogramaView({
  pacienteNombre,
  tipoEvaluacion,
  posturograma,
  desviacionesDetectadas,
  onEditarMarcadores,
  onCompararConAnterior,
  onExportar,
  onVolver,
}: PosturogramaViewProps) {
  const getTipoBadgeClass = () => {
    const classes: Record<string, string> = {
      inicial: 'bg-teal-100 text-teal-700 dark:bg-teal-200 dark:text-teal-800',
      final: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-200 dark:text-emerald-800',
      seguimiento: 'bg-sky-100 text-sky-700 dark:bg-sky-200 dark:text-sky-800',
    }
    return classes[tipoEvaluacion] || 'bg-slate-100 text-slate-700'
  }

  const getDesviacionSeverityColor = (severidad: string) => {
    const colors: Record<string, string> = {
      leve: 'bg-amber-100 text-amber-700 dark:bg-amber-200 dark:text-amber-800',
      moderada: 'bg-orange-100 text-orange-700 dark:bg-orange-200 dark:text-orange-800',
      severa: 'bg-rose-100 text-rose-700 dark:bg-rose-200 dark:text-rose-800',
    }
    return colors[severidad] || 'bg-slate-100 text-slate-700'
  }

  const getDesviacionEstadoIcon = (estado?: string) => {
    if (estado === 'mejorada') return '✓'
    if (estado === 'empeorada') return '✗'
    if (estado === 'estable') return '→'
    return null
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
                Posturograma Digital
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
              onClick={onEditarMarcadores}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all duration-200 border border-slate-200 dark:border-slate-600"
            >
              Editar Marcadores
            </button>
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
          <VistaPosturograma
            title="Vista Anterior"
            puntos={{
              cabeza: posturograma.vistaAnterior.cabeza,
              hombros: posturograma.vistaAnterior.hombros,
              columna: posturograma.vistaAnterior.columna,
              pelvis: posturograma.vistaAnterior.pelvis,
              rodillas: posturograma.vistaAnterior.rodillas,
              pies: posturograma.vistaAnterior.pies,
            }}
          />

          <VistaPosturograma
            title="Vista Posterior"
            puntos={{
              columna: posturograma.vistaPosterior.columna,
              pelvis: posturograma.vistaPosterior.pelvis,
              pies: posturograma.vistaPosterior.pies,
            }}
          />

          <VistaPosturograma
            title="Vista Lateral Derecha"
            puntos={{
              cabeza: posturograma.vistaLateralDerecha.cabeza,
              hombros: posturograma.vistaLateralDerecha.hombros,
              columna: posturograma.vistaLateralDerecha.columna,
              pelvis: posturograma.vistaLateralDerecha.pelvis,
              rodillas: posturograma.vistaLateralDerecha.rodillas,
              pies: posturograma.vistaLateralDerecha.pies,
            }}
          />

          <VistaPosturograma
            title="Vista Lateral Izquierda"
            puntos={{
              cabeza: posturograma.vistaLateralIzquierda.cabeza,
              hombros: posturograma.vistaLateralIzquierda.hombros,
              columna: posturograma.vistaLateralIzquierda.columna,
              pelvis: posturograma.vistaLateralIzquierda.pelvis,
              rodillas: posturograma.vistaLateralIzquierda.rodillas,
              pies: posturograma.vistaLateralIzquierda.pies,
            }}
          />
        </div>

        {desviacionesDetectadas.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              Desviaciones Detectadas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {desviacionesDetectadas.map((desviacion, idx) => (
                <DesviacionCard
                  key={idx}
                  desviacion={desviacion}
                  severityColor={getDesviacionSeverityColor(desviacion.severidad)}
                  estadoIcon={getDesviacionEstadoIcon(desviacion.estado)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface VistaPosturogramaProps {
  title: string
  puntos: Partial<{
    cabeza: PuntoAnatomico
    hombros: PuntoAnatomico
    columna: PuntoAnatomico
    pelvis: PuntoAnatomico
    rodillas: PuntoAnatomico | { izquierda: PuntoAnatomico; derecha: PuntoAnatomico }
    pies: PuntoAnatomico | { izquierdo: PuntoAnatomico; derecho: PuntoAnatomico }
  }>
}

function VistaPosturograma({ title, puntos }: VistaPosturogramaProps) {
  const getMarcadorColor = (desviacion: string) => {
    if (desviacion === 'normal') return 'bg-teal-500 border-teal-600'
    return 'bg-rose-500 border-rose-600'
  }

  const renderMarcador = (punto?: PuntoAnatomico, label?: string) => {
    if (!punto) return null

    const color = getMarcadorColor(punto.desviacion)

    return (
      <div
        className="absolute w-5 h-5 rounded-full border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform shadow-lg"
        style={{
          left: `${(punto.x / 800) * 100}%`,
          top: `${(punto.y / 800) * 100}%`,
        }}
        title={`${label || ''}: ${punto.desviacion}`}
      >
        <div className={`w-full h-full rounded-full ${color}`} />
      </div>
    )
  }

  const renderMarcadorPair = (
    par?: { izquierda: PuntoAnatomico; derecha: PuntoAnatomico },
    label?: string
  ) => {
    if (!par) return null
    return (
      <>
        {renderMarcador(par.izquierda, `${label} (izquierdo)`)}
        {renderMarcador(par.derecha, `${label} (derecho)`)}
      </>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>
      </div>

      <div className="p-6">
        <div className="relative bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden aspect-[4/5]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-32 h-48 mx-auto bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-lg flex items-center justify-center opacity-30">
                <span className="text-6xl">🚶</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Silueta de postura</p>
            </div>
          </div>

          {renderMarcador(puntos.cabeza, 'Cabeza')}
          {renderMarcador(puntos.hombros, 'Hombros')}
          {renderMarcador(puntos.columna, 'Columna')}
          {renderMarcador(puntos.pelvis, 'Pelvis')}
          {renderMarcadorPair(puntos.rodillas as any, 'Rodillas')}
          {renderMarcadorPair(puntos.pies as any, 'Pies')}
        </div>
      </div>
    </div>
  )
}

interface DesviacionCardProps {
  desviacion: DesviacionDetectada
  severityColor: string
  estadoIcon?: string | null
}

function DesviacionCard({ desviacion, severityColor, estadoIcon }: DesviacionCardProps) {
  const getVistaLabel = (vista: string) => {
    const labels: Record<string, string> = {
      vistaAnterior: 'Anterior',
      vistaPosterior: 'Posterior',
      vistaLateralDerecha: 'Lateral Der.',
      vistaLateralIzquierda: 'Lateral Izq.',
    }
    return labels[vista] || vista
  }

  return (
    <div className={`p-4 rounded-xl border-2 ${severityColor} border-current`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium opacity-75">
          {getVistaLabel(desviacion.vista)}
        </span>
        {estadoIcon && (
          <span className="text-sm font-bold">{estadoIcon}</span>
        )}
      </div>

      <h3 className="text-lg font-bold mb-2 capitalize">
        {desviacion.estructura}
      </h3>

      <p className="text-sm font-medium mb-3 capitalize">
        {desviacion.tipo.replace(/-/g, ' ')}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase">
          Severidad: {desviacion.severidad}
        </span>
      </div>
    </div>
  )
}
