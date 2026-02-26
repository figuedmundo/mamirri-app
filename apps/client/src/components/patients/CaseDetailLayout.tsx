import type {
  Patient,
  ClinicalCase,
  Evaluation,
  TreatmentSession,
  Posturogram,
  PainScale,
  TreatmentObjectives,
} from '../../types/patient';
import { useState, useEffect } from 'react';
import {
  getActiveEvaluation,
  getCaseEvaluations,
} from '../../lib/evaluation-utils';
import { TreatmentTimeline } from './TreatmentTimeline';
import { SessionDetailView } from './treatment-timeline/SessionDetailView';
import { EvaluationForm } from './EvaluationForm';
import { ComparisonBoard } from './ComparisonBoard';
import { ObjectivesView } from './ObjectivesView';
import { RecordingFloatingBar } from './RecordingFloatingBar';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { generateComparisonReport } from '../../lib/pdf/generateComparisonReport';
import { useToast } from '../../hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import {
  useUpdateEvaluation,
  useUpdateTreatmentPlanObjectives,
} from '../../hooks/use-patients';
import type { UpdateEvaluationDto } from '../../api/patients';
import { useUploadEvaluationVoiceNote } from '../../hooks/use-media';
import { AnalyzeButton } from './AnalyzeButton';
import { AnalysisResultsPanel } from './analysis/AnalysisResultsPanel';
import type { AnalysisResult } from '@/types/analysis';
import {
  Mic,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Split,
  Target,
  BookOpen,
} from 'lucide-react';

type ViewMode =
  | 'timeline'
  | 'session-detail'
  | 'evaluation'
  | 'objectives'
  | 'comparison';

interface CaseDetailLayoutProps {
  patient: Patient;
  clinicalCase: ClinicalCase;
  onBack: () => void;
  onOpenLibrary?: (planId: string) => void;
}

export function CaseDetailLayout({
  patient,
  clinicalCase,
  onBack,
  onOpenLibrary,
}: CaseDetailLayoutProps) {
  const [localCase, setLocalCase] = useState<ClinicalCase>(clinicalCase);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const { toast } = useToast();

  const updateEvaluation = useUpdateEvaluation();
  const updateObjectives = useUpdateTreatmentPlanObjectives();
  const uploadVoiceNote = useUploadEvaluationVoiceNote();

  const activeEval = getActiveEvaluation(localCase);
  const treatmentPlanId = localCase.treatmentPlan?.id;

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!activeEval) {
      toast({
        title: 'Error',
        description: 'No hay una evaluación activa para asociar la nota.',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({
        title: 'Subiendo nota de voz...',
        description: 'Asociando a la evolución actual.',
      });

      await uploadVoiceNote.mutateAsync({
        evaluationId: activeEval.id,
        file: blob,
        durationSeconds: duration,
      });

      toast({
        title: 'Éxito',
        description: 'Nota de voz guardada correctamente.',
        action: (
          <ToastAction
            altText="Deshacer guardado"
            onClick={() => {
              toast({
                title: 'Acción cancelada',
                description: 'La nota no se ha guardado.',
              });
            }}
          >
            Deshacer
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error('Recording upload error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la nota de voz.',
        variant: 'destructive',
      });
    }
  };

  const {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  } = useVoiceRecorder({
    autoSave: true,
    onRecordingComplete: handleRecordingComplete,
  });

  useEffect(() => {
    if (error) {
      if (
        error.name === 'NotAllowedError' ||
        error.message.includes('Permission denied')
      ) {
        toast({
          title: 'Permiso denegado',
          description:
            'Por favor, permite el acceso al micrófono para grabar notas de voz.',
          variant: 'destructive',
        });
      } else if (error.message === 'BROWSER_NOT_SUPPORTED') {
        toast({
          title: 'No soportado',
          description:
            'Tu navegador no soporta grabación de audio. Intenta con Chrome o Safari.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo iniciar la grabación. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    }
  }, [error, toast]);

  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    localCase.treatmentSessions[localCase.treatmentSessions.length - 1]?.id,
  );

  useEffect(() => {
    setLocalCase(clinicalCase);
  }, [clinicalCase]);

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

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setViewMode('session-detail');
  };

  const handleSaveEvaluation = async (
    evaluation: Evaluation,
    options?: { silent?: boolean },
  ) => {
    const isSilent = options?.silent === true;

    try {
      setLocalCase({ ...localCase, evaluation, evaluations: [evaluation] });

      const data: UpdateEvaluationDto = {
        posturogram: evaluation.posturogram,
        orthopedicTests: evaluation.orthopedicTests,
        avdEvaluation: evaluation.avdEvaluation,
        painScale: evaluation.painScale,
        diagnosis: evaluation.diagnosis,
      };

      if (evaluation.voiceNotes) {
        data.voiceNotes = evaluation.voiceNotes;
      }

      await updateEvaluation.mutateAsync({
        id: evaluation.id,
        data,
      });

      if (!isSilent) {
        toast({
          title: 'Evaluacion actualizada',
          description: 'Los cambios se han guardado correctamente.',
        });
      }
    } catch {
      if (!isSilent) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo guardar la evaluacion.',
        });
      }
    }
  };

  const handlePosturogramChange = async (posturogram: Posturogram) => {
    const activeEval = getActiveEvaluation(localCase);
    if (!activeEval) return;

    try {
      const updatedEval = { ...activeEval, posturogram };
      setLocalCase({
        ...localCase,
        evaluation: updatedEval,
        evaluations: [updatedEval],
      });

      await updateEvaluation.mutateAsync({
        id: activeEval.id,
        data: { posturogram },
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
      setLocalCase({
        ...localCase,
        evaluation: updatedEval,
        evaluations: [updatedEval],
      });

      await updateEvaluation.mutateAsync({
        id: activeEval.id,
        data: { painScale },
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

  const handleObjectivesChange = async (objectives: TreatmentObjectives) => {
    if (!localCase.treatmentPlan?.id) {
      toast({
        title: 'Plan no disponible',
        description:
          'Define el diagnóstico en la evaluación antes de crear objetivos del plan.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLocalCase({
        ...localCase,
        treatmentPlan: { ...localCase.treatmentPlan, objectives },
      });
      await updateObjectives.mutateAsync({
        planId: localCase.treatmentPlan.id,
        data: objectives,
      });
    } catch {
      throw new Error('Failed to save objectives');
    }
  };

  const handleBackFromDetail = () => {
    setViewMode('timeline');
  };

  const isTimelineActive =
    viewMode === 'timeline' || viewMode === 'session-detail';

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <button
            onClick={
              viewMode === 'session-detail' ? handleBackFromDetail : onBack
            }
            aria-label={
              viewMode === 'session-detail'
                ? 'Volver al cronograma'
                : 'Volver al perfil del paciente'
            }
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
            data-testid="nav-timeline-btn"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              isTimelineActive
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Seguimiento</span>
          </button>
          <button
            onClick={() => setViewMode('evaluation')}
            data-testid="nav-evaluation-btn"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'evaluation'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList size={16} />
            <span className="hidden sm:inline">Evaluacion</span>
          </button>
          <button
            onClick={() => setViewMode('objectives')}
            data-testid="nav-objectives-btn"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'objectives'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Target size={16} />
            <span className="hidden sm:inline">Objetivos</span>
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            data-testid="nav-comparison-btn"
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
          <button
            type="button"
            onClick={() => {
              if (!treatmentPlanId) {
                toast({
                  title: 'Sin plan de tratamiento',
                  description:
                    'Este caso no tiene un plan asociado para añadir protocolos.',
                  variant: 'destructive',
                });
                return;
              }

              if (onOpenLibrary) {
                onOpenLibrary(treatmentPlanId);
                return;
              }

              window.location.assign(`/biblioteca?planId=${treatmentPlanId}`);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg transition-all bg-teal-600 hover:bg-teal-700 text-white hover:scale-105"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Abrir Biblioteca</span>
          </button>
          <AnalyzeButton
            caseId={localCase.id}
            evaluationCount={getCaseEvaluations(localCase).length}
            hasResults={!!analysisResult}
            onAnalysisComplete={(result) => {
              setAnalysisResult(result);
              setIsAnalysisOpen(true);
              toast({
                title: 'Análisis completado',
                description: 'Resultados listos para revisar.',
              });
            }}
            onViewResults={() => setIsAnalysisOpen(true)}
          />
          <button
            onClick={() => void startRecording()}
            disabled={isRecording}
            data-testid="floating-grabar-evolucion-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-lg transition-all ${
              isRecording
                ? 'bg-rose-100 text-rose-400 cursor-not-allowed scale-95'
                : 'bg-rose-600 hover:bg-rose-700 text-white hover:scale-105'
            }`}
          >
            <Mic size={18} className={isRecording ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">
              {isRecording ? 'Grabando...' : 'Grabar Evolucion'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'timeline' ? (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <TreatmentTimeline
              clinicalCase={localCase}
              onSessionCreated={handleSessionCreated}
              onSessionUpdated={handleSessionUpdated}
              onSessionDeleted={handleSessionDeleted}
              onSelectSession={handleSelectSession}
            />
          </div>
        ) : viewMode === 'session-detail' ? (
          <SessionDetailView
            clinicalCase={localCase}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
          />
        ) : viewMode === 'objectives' ? (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <ObjectivesView
              clinicalCase={localCase}
              onObjectivesChange={handleObjectivesChange}
            />
          </div>
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

      <RecordingFloatingBar
        isRecording={isRecording}
        duration={duration}
        onStop={stopRecording}
        onCancel={cancelRecording}
      />

      <AnalysisResultsPanel
        analysisResult={analysisResult}
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
      />
    </div>
  );
}
