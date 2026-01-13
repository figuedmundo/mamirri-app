import React from 'react'
import type { ComparacionProps, Huella, VideoDePostura } from '../types'

export function ComparacionBoard({
  casoClinico,
  onExport,
  onShare,
}: ComparacionProps) {
  const [activeTab, setActiveTab] = React.useState<'huellas' | 'postura' | 'tests'>('huellas')

  const initialHuella = casoClinico.evaluacion.huellas.find(h => h.tipo === 'inicial')
  const finalHuella = casoClinico.evaluacion.huellas.find(h => h.tipo === 'final')

  const initialVideo = casoClinico.evaluacion.videosPostura[0]
  const finalVideo = casoClinico.evaluacion.videosPostura[casoClinico.evaluacion.videosPostura.length - 1]

  const renderComparisonCard = (itemInitial: any, itemFinal: any, renderContent: (item: any) => React.ReactNode) => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ANTES</span>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {itemInitial?.fecha ? new Date(itemInitial.fecha).toLocaleDateString() : 'Sin datos'}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
          {itemInitial ? renderContent(itemInitial) : <span className="text-slate-400">No disponible</span>}
        </div>
        {itemInitial?.analisis && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p><span className="font-medium">Arco:</span> {itemInitial.analisis.arco}</p>
            <p><span className="font-medium">Desviación:</span> {itemInitial.analisis.desviacion}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">DESPUÉS</span>
          <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded">
            {itemFinal?.fecha ? new Date(itemFinal.fecha).toLocaleDateString() : 'Pendiente'}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-800 border-2 border-teal-500/20 dark:border-teal-500/30 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-teal-50/10 dark:bg-teal-900/10">
          {itemFinal ? renderContent(itemFinal) : (
            <div className="text-center p-6">
              <p className="text-slate-400 mb-2">Evaluación final pendiente</p>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                + Agregar registro final
              </button>
            </div>
          )}
        </div>
        {itemFinal?.analisis && (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p><span className="font-medium">Arco:</span> {itemFinal.analisis.arco}</p>
            <p><span className="font-medium">Desviación:</span> {itemFinal.analisis.desviacion}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Comparativa de Evolución
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {casoClinico.titulo}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartir
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Informe
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'huellas', label: 'Huellas Plantares' },
          { id: 'postura', label: 'Análisis Postural' },
          { id: 'tests', label: 'Datos Clínicos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'huellas' && (
          renderComparisonCard(
            initialHuella,
            finalHuella,
            (item: Huella) => (
              <img src={item.url} alt="Huella" className="w-full h-full object-cover" />
            )
          )
        )}

        {activeTab === 'postura' && (
          renderComparisonCard(
            initialVideo,
            finalVideo,
            (item: VideoDePostura) => (
              <div className="relative w-full h-full bg-slate-900 flex items-center justify-center group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                  {item.duracion}s
                </span>
              </div>
            )
          )
        )}

        {activeTab === 'tests' && (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Dolor Inicial</p>
                <div className="text-2xl font-bold text-red-500 mt-1">
                  {casoClinico.evaluacion.escalaDolor.actividad}/10
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Dolor Actual</p>
                <div className="text-2xl font-bold text-emerald-500 mt-1">
                  {casoClinico.sesionesTratamiento[casoClinico.sesionesTratamiento.length - 1]?.dolorFinal ?? '-'}/10
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Sesiones</p>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {casoClinico.sesionesTratamiento.length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Duración</p>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                  {Math.round((new Date().getTime() - new Date(casoClinico.fechaInicio).getTime()) / (1000 * 60 * 60 * 24 * 7))} sem
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Métrica</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inicial</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cambio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">Escala Barthel</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {casoClinico.evaluacion.evaluacionAVD.barthel.total}/12
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {Math.min(12, casoClinico.evaluacion.evaluacionAVD.barthel.total + 2)}/12
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">+2</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">Test Schober</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {casoClinico.evaluacion.testOrtopedicos.schober.resultado} cm
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {casoClinico.evaluacion.testOrtopedicos.schober.resultado + 2} cm
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-medium">+2 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {finalHuella?.comparacion && (
        <div className="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-6 border border-teal-100 dark:border-teal-800/50">
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2">
            Análisis de Progreso
          </h3>
          <p className="text-teal-800 dark:text-teal-200 mb-4">
            {finalHuella.comparacion.mejoraDolor}. {finalHuella.comparacion.recuperacionROM} de rango de movimiento.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white dark:bg-teal-900/50 rounded-full text-xs font-medium text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
              Mejora de arco: {finalHuella.comparacion.diferenciaArco}mm
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
