import type {
  Patient,
  ClinicalCase,
  Evaluation,
  TreatmentSession,
  Posturogram,
  PainScale,
} from '../../types/patient';
import { useState, useEffect } from 'react';
import {
  getInitialEvaluation,
  getFinalEvaluation,
  getActiveEvaluation,
} from '../../lib/evaluation-utils';
import { TreatmentTimeline } from './TreatmentTimeline';
import { PosturogramViewer } from './PosturogramViewer';
import { EvaluationForm } from './EvaluationForm';
import { ComparisonBoard } from './ComparisonBoard';
import { generateComparisonReport } from '../../lib/pdf';
import { useToast } from '../../hooks/use-toast';
import { patientsApi } from '../../api/patients';
import {
  Mic,
  Play,
  ArrowLeft,
  Calendar,
  Camera,
  LayoutDashboard,
  ClipboardList,
  Split,
} from 'lucide-react';

interface CaseDetailLayoutProps {
  patient: Patient;
  clinicalCase: ClinicalCase;
  onBack: () => void;
}

export function CaseDetailLayout({
  patient,
  clinicalCase,
  onBack,
}: CaseDetailLayoutProps) {
  const [localCase, setLocalCase] = useState<ClinicalCase>(clinicalCase);
  const [viewMode, setViewMode] = useState<
    'timeline' | 'evaluation' | 'comparison'
  >('timeline');
  const { toast } = useToast();

  useEffect(() => {
    setLocalCase(clinicalCase);
  }, [clinicalCase]);

  const activeEvalType = getActiveEvaluation(localCase)?.type;

  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    localCase.treatmentSessions[localCase.treatmentSessions.length - 1]?.id,
  );

  const activeSession = localCase.treatmentSessions.find(
    (s) => s.id === activeSessionId,
  );

  const activeSessionIndex = localCase.treatmentSessions.findIndex(
    (s) => s.id === activeSessionId,
  );

  const initialEval = getInitialEvaluation(localCase);
  const finalEval = getFinalEvaluation(localCase);

  const initialFootprint = initialEval?.footprints?.find(
    (f) => f.type === 'initial',
  );
  const finalFootprint = finalEval?.footprints?.find((f) => f.type === 'final');

  const hasPosturogramImages = initialFootprint?.url && finalFootprint?.url;
  const hasSessions = localCase.treatmentSessions.length > 0;

  const handleSessionCreated = (session: TreatmentSession) => {
    setLocalCase((prev) => ({
      ...prev,
      treatmentSessions: [...prev.treatmentSessions, session],
    }));
    setActiveSessionId(session.id);
  };

  const handleSessionUpdated = (session: TreatmentSession) => {
    setLocalCase((prev) => ({
      ...prev,
      treatmentSessions: prev.treatmentSessions.map((s) =>
        s.id === session.id ? session : s,
      ),
    }));
  };

  const handleSessionDeleted = (sessionId: string) => {
    setLocalCase((prev) => ({
      ...prev,
      treatmentSessions: prev.treatmentSessions.filter(
        (s) => s.id !== sessionId,
      ),
    }));
    if (activeSessionId === sessionId) {
      // If active session was deleted, select the last available session or undefined
      const remainingSessions = localCase.treatmentSessions.filter(
        (s) => s.id !== sessionId,
      );
      setActiveSessionId(
        remainingSessions.length > 0
          ? remainingSessions[remainingSessions.length - 1].id
          : undefined,
      );
    }
  };

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    try {
      // Optimistic update
      const updatedEvaluations = localCase.evaluations.map((e) =>
        e.id === evaluation.id ? evaluation : e,
      );
      // If new, add it
      if (!localCase.evaluations.find((e) => e.id === evaluation.id)) {
        updatedEvaluations.push(evaluation);
      }

      const updatedCase = { ...localCase, evaluations: updatedEvaluations };
      setLocalCase(updatedCase);

      // Persist changes
      await patientsApi.updateEvaluation(evaluation.id, evaluation);

      toast({
        title: 'Evaluación actualizada',
        description: 'Los cambios se han guardado correctamente.',
      });
    } catch {
      // Revert on error (optional, but good practice)
      setLocalCase(localCase);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la evaluación.',
      });
    }
  };

  const handlePosturogramChange = async (posturogram: Posturogram) => {
    const activeEval = getActiveEvaluation(localCase);
    if (!activeEval) return;

    try {
      const updatedEval = { ...activeEval, posturogram };
      const updatedEvaluations = localCase.evaluations.map((e) =>
        e.id === updatedEval.id ? updatedEval : e,
      );

      const updatedCase = {
        ...localCase,
        evaluations: updatedEvaluations,
      };
      setLocalCase(updatedCase);

      await patientsApi.updateEvaluation(activeEval.id, {
        posturogram,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el posturograma.',
      });
    }
  };

  const handlePainScaleChange = async (painScale: PainScale) => {
    const activeEval = getActiveEvaluation(localCase);
    if (!activeEval) return;

    try {
      const updatedEval = { ...activeEval, painScale };
      const updatedEvaluations = localCase.evaluations.map((e) =>
        e.id === updatedEval.id ? updatedEval : e,
      );

      const updatedCase = {
        ...localCase,
        evaluations: updatedEvaluations,
      };
      setLocalCase(updatedCase);

      await patientsApi.updateEvaluation(activeEval.id, {
        painScale,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar la escala de dolor.',
      });
    }
  };

  const handleExportReport = async () => {
    try {
      await generateComparisonReport(localCase, patient);
      toast({
        title: 'Informe descargado',
        description: 'El informe se ha guardado correctamente.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo generar el informe.',
      });
    }
  };

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
              {localCase.title} •{' '}
              <span
                className={
                  localCase.status === 'active'
                    ? 'text-emerald-600'
                    : localCase.status === 'completed'
                      ? 'text-blue-600'
                      : 'text-slate-400'
                }
              >
                {localCase.status === 'active'
                  ? 'Activo'
                  : localCase.status === 'completed'
                    ? 'Completado'
                    : 'Inactivo'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mx-4">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Seguimiento</span>
          </button>
          <button
            onClick={() => setViewMode('evaluation')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'evaluation'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList size={16} />
            <span className="hidden sm:inline">Evaluación</span>
            {activeEvalType && (
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeEvalType === 'INITIAL'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}
              >
                {activeEvalType === 'INITIAL' ? 'INICIAL' : 'FINAL'}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'comparison'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Split size={16} />
            <span className="hidden sm:inline">Comparar</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full font-medium shadow-lg transition-transform hover:scale-105">
            <Mic size={18} />
            <span className="hidden sm:inline">Grabar Evolución</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'timeline' ? (
          <>
            <TreatmentTimeline
              clinicalCase={localCase}
              onSessionCreated={handleSessionCreated}
              onSessionUpdated={handleSessionUpdated}
              onSessionDeleted={handleSessionDeleted}
              onViewSession={setActiveSessionId}
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
                      Este caso clínico aún no tiene sesiones de tratamiento.
                      Agrega la primera sesión para comenzar a registrar la
                      evolución del paciente.
                    </p>
                  </div>
                ) : activeSession ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                          Sesión {activeSessionIndex + 1} de{' '}
                          {localCase.treatmentSessions.length}
                        </span>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                          Reporte de Evolución
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(activeSession.date).toLocaleDateString(
                            'es-ES',
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
                        clinicalCase={localCase}
                        initialPosturogramUrl={initialFootprint.url}
                        currentPosturogramUrl={finalFootprint.url}
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
          </>
        ) : viewMode === 'comparison' ? (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <ComparisonBoard
              clinicalCase={localCase}
              onExport={handleExportReport}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <EvaluationForm
              clinicalCase={localCase}
              onSave={handleSaveEvaluation}
              onPosturogramChange={handlePosturogramChange}
              onPainScaleChange={handlePainScaleChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
