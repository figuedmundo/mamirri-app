import type { Patient, ClinicalCase } from '../../types/patient';
import { useState } from 'react';
import { CaseTimeline } from './CaseTimeline';
import { PosturogramViewer } from './PosturogramViewer';
import {
  Mic,
  Play,
  ArrowLeft,
  Plus,
  Edit3,
  Calendar,
  Camera,
} from 'lucide-react';

interface CaseDetailLayoutProps {
  patient: Patient;
  clinicalCase: ClinicalCase;
  onBack: () => void;
  onAddSession?: () => void;
  onEditSession?: (sessionId: string) => void;
}

export function CaseDetailLayout({
  patient,
  clinicalCase,
  onBack,
  onAddSession,
  onEditSession,
}: CaseDetailLayoutProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    clinicalCase.treatmentSessions[clinicalCase.treatmentSessions.length - 1]
      ?.id,
  );

  const activeSession = clinicalCase.treatmentSessions.find(
    (s) => s.id === activeSessionId,
  );

  const activeSessionIndex = clinicalCase.treatmentSessions.findIndex(
    (s) => s.id === activeSessionId,
  );

  const initialFootprint = clinicalCase.evaluation?.footprints?.find(
    (f) => f.type === 'initial',
  );
  const finalFootprint = clinicalCase.evaluation?.footprints?.find(
    (f) => f.type === 'final',
  );

  const hasPosturogramImages = initialFootprint?.url && finalFootprint?.url;
  const hasSessions = clinicalCase.treatmentSessions.length > 0;

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="Volver al perfil del paciente"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft
              size={20}
              className="text-slate-600 dark:text-slate-400"
            />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {patient.name}
            </h2>
            <p className="text-xs text-slate-500">
              {clinicalCase.title} •{' '}
              <span
                className={
                  clinicalCase.status === 'active'
                    ? 'text-emerald-600'
                    : clinicalCase.status === 'completed'
                      ? 'text-blue-600'
                      : 'text-slate-400'
                }
              >
                {clinicalCase.status === 'active'
                  ? 'Activo'
                  : clinicalCase.status === 'completed'
                    ? 'Completado'
                    : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onAddSession && (
            <button
              onClick={onAddSession}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full font-medium transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva Sesión</span>
            </button>
          )}
          <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full font-medium shadow-lg transition-transform hover:scale-105">
            <Mic size={18} />
            <span className="hidden sm:inline">Grabar Evolución</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <CaseTimeline
          clinicalCase={clinicalCase}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
        />

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-4xl mx-auto space-y-8">
            {!hasSessions ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar
                    size={32}
                    className="text-slate-400 dark:text-slate-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Sin sesiones registradas
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Este caso clínico aún no tiene sesiones de tratamiento. Agrega
                  la primera sesión para comenzar a registrar la evolución del
                  paciente.
                </p>
                {onAddSession && (
                  <button
                    onClick={onAddSession}
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    <Plus size={20} />
                    Agregar Primera Sesión
                  </button>
                )}
              </div>
            ) : activeSession ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      Sesión {activeSessionIndex + 1} de{' '}
                      {clinicalCase.treatmentSessions.length}
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      Reporte de Evolución
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(activeSession.date).toLocaleDateString(
                        undefined,
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {onEditSession && (
                      <button
                        onClick={() => onEditSession(activeSession.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Editar sesión"
                      >
                        <Edit3
                          size={18}
                          className="text-slate-500 dark:text-slate-400"
                        />
                      </button>
                    )}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                      <span className="text-xs font-medium text-slate-500">
                        Dolor END
                      </span>
                      <span
                        className={`text-lg font-bold ${activeSession.finalPainLevel > 5 ? 'text-rose-500' : 'text-emerald-500'}`}
                      >
                        {activeSession.finalPainLevel}/10
                      </span>
                    </div>
                  </div>
                </div>

                {activeSession.voiceNotes &&
                  activeSession.voiceNotes.length > 0 && (
                    <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-4">
                        <button
                          className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md hover:bg-teal-700 transition-colors"
                          aria-label="Reproducir nota de voz"
                        >
                          <Play size={18} className="ml-1" />
                        </button>
                        <div className="flex-1">
                          <div className="h-10 flex flex-col justify-center">
                            <div className="w-full h-8 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex items-end gap-0.5 px-1 pb-1 opacity-50">
                              {[...Array(20)].map((_, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-slate-400 dark:bg-slate-500"
                                  style={{
                                    height: `${20 + Math.sin(i * 0.5) * 40 + (i % 3) * 10}%`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 italic">
                            "{activeSession.voiceNotes[0].transcription}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Técnicas Aplicadas
                    </h4>
                    {activeSession.procedures.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activeSession.procedures.map((tec) => (
                          <span
                            key={tec}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm"
                          >
                            {tec}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        Sin técnicas registradas
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Respuesta del Paciente
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {activeSession.patientResponse || (
                        <span className="italic text-slate-400">
                          Sin respuesta registrada
                        </span>
                      )}
                    </p>
                  </div>

                  {activeSession.observations && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Observaciones
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {activeSession.observations}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                <p className="text-slate-400">
                  Selecciona una sesión de la línea de tiempo para ver los
                  detalles
                </p>
              </div>
            )}

            {hasPosturogramImages ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Evolución Postural (Sagital)
                </h3>
                <div className="max-w-md mx-auto">
                  <PosturogramViewer
                    imageBefore={initialFootprint.url}
                    imageAfter={finalFootprint.url}
                    labelBefore="Inicial"
                    labelAfter="Final"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Evolución Postural
                </h3>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera
                      size={32}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">
                    No hay imágenes de comparación disponibles
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Capture una huella inicial y final para ver la evolución
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
