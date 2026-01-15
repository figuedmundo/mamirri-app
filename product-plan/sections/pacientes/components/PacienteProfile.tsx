import type { PacienteProfileProps } from '../types'

/**
 * PacienteProfile - Detailed patient profile view
 *
 * Displays patient personal information, clinical cases history,
 * and provides quick actions for clinical documentation.
 */
export function PacienteProfile({
  paciente,
  onEdit,
  onVoiceDictation,
  onCaptureHuella,
  onCaptureVideo,
  onSchedule
}: PacienteProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
      case 'completado':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
      case 'inactivo':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
    }
  }

  const getAge = (fechaNacimiento: string, edad?: number) => {
    if (edad) return edad
    const birthDate = new Date(fechaNacimiento)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className={`h-2 ${paciente.activo ? 'bg-teal-500' : 'bg-stone-400'}`} />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {paciente.nombre}
                  </h1>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    paciente.activo
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                      : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                  }`}>
                    {paciente.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{getAge(paciente.fechaNacimiento, paciente.edad)} años</span>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span>{paciente.ocupacion}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{paciente.telefono}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{paciente.email || 'Sin email'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Nacido: {formatDate(paciente.fechaNacimiento)}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                  Expediente creado el {formatDate(paciente.fechaCreacion)}
                </p>
              </div>

              <div className="flex flex-row sm:flex-col gap-2">
                {onVoiceDictation && (
                  <button
                    onClick={onVoiceDictation}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Dictar nota</span>
                  </button>
                )}

                <div className="flex gap-2">
                  {onCaptureHuella && (
                    <button
                      onClick={onCaptureHuella}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden sm:inline">Huella</span>
                      <span className="sm:hidden">Huella</span>
                    </button>
                  )}

                  {onCaptureVideo && (
                    <button
                      onClick={onCaptureVideo}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Video</span>
                      <span className="sm:hidden">Video</span>
                    </button>
                  )}
                </div>

                {onSchedule && (
                  <button
                    onClick={onSchedule}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-sky-500 text-sky-600 dark:text-sky-400 rounded-lg font-medium hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Agendar</span>
                  </button>
                )}

                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Casos Clínicos
          </h2>

          {paciente.casosClinicos.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
                Sin casos clínicos
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Este paciente aún no tiene casos clínicos registrados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paciente.casosClinicos.map((caso) => (
                <div
                  key={caso.id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {caso.titulo}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(caso.estado)}`}>
                            {caso.estado}
                          </span>
                        </div>
                        <p className="mt-2 text-slate-600 dark:text-slate-400 line-clamp-2">
                          {caso.motivoConsulta}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-500 sm:text-right">
                        <p>Inicio: {formatDate(caso.fechaInicio)}</p>
                        {caso.fechaFin && <p>Fin: {formatDate(caso.fechaFin)}</p>}
                      </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 lg:col-span-2">
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                        Diagnóstico
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Indicador funcional:</span>
                          <p className="text-slate-900 dark:text-slate-100 mt-0.5">{caso.evaluacion.diagnostico.indicadorFuncional}</p>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Aspecto clínico:</span>
                          <p className="text-slate-900 dark:text-slate-100 mt-0.5">{caso.evaluacion.diagnostico.aspectoClinico}</p>
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Anatomopatología:</span>
                          <p className="text-slate-900 dark:text-slate-100 mt-0.5">{caso.evaluacion.diagnostico.anatomopatologia}</p>
                        </div>
                    </div>
                  </div>

                  <div>
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                        Escala de Dolor
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Actividad</span>
                            <span className="font-semibold text-teal-600 dark:text-teal-400">{caso.evaluacion.escalaDolor.actividad}/10</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${(caso.evaluacion.escalaDolor.actividad / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Reposo</span>
                            <span className="font-semibold text-teal-600 dark:text-teal-400">{caso.evaluacion.escalaDolor.reposo}/10</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${(caso.evaluacion.escalaDolor.reposo / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Palpación</span>
                            <span className="font-semibold text-teal-600 dark:text-teal-400">{caso.evaluacion.escalaDolor.palpacion}/10</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${(caso.evaluacion.escalaDolor.palpacion / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          Tipo: <span className="capitalize">{caso.evaluacion.escalaDolor.tipo}</span>
                        </div>
                    </div>
                  </div>

                  <div>
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                        Objetivos
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-slate-400">Terapéutico:</span>
                          <p className="text-slate-900 dark:text-slate-100 mt-0.5">{caso.planDeTratamiento.objetivos.terapeutico}</p>
                        </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                        Fases del Tratamiento
                      </h4>
                      <div className="space-y-2">
                        {caso.planDeTratamiento.fases.map((fase) => (
                          <div
                            key={fase.numero}
                            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                              {fase.numero}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {fase.nombre}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {fase.duracionSemanas} sem
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {fase.objetivos}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {fase.tecnicas.slice(0, 3).map((tecnica) => (
                                  <span
                                    key={tecnica}
                                    className="px-2 py-0.5 bg-white dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 rounded"
                                  >
                                    {tecnica}
                                  </span>
                                ))}
                                {fase.tecnicas.length > 3 && (
                                  <span className="px-2 py-0.5 bg-white dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400 rounded">
                                    +{fase.tecnicas.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {caso.sesionesTratamiento.length > 0 && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Sesiones registradas
                          </span>
                          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                            {caso.sesionesTratamiento.length}
                          </p>
                        </div>
                        <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                          <p>Última sesión:</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {formatDate(caso.sesionesTratamiento[caso.sesionesTratamiento.length - 1].fecha)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
