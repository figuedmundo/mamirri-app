import { useState, useEffect } from 'react';
import { getActiveEvaluation } from '../../lib/evaluation-utils';
import { TreatmentTimeline } from './TreatmentTimeline';
import { ResponsiveCaseTimeline } from './ResponsiveCaseTimeline';
import { SessionDetailView } from './treatment-timeline/SessionDetailView';
import { EvaluationForm } from './EvaluationForm';
import { ComparisonBoard } from './ComparisonBoard';
import { ObjectivesView } from './ObjectivesView';
import { generateComparisonReport } from '../../lib/pdf';
import { useToast } from '../../hooks/use-toast';
import { patientsApi } from '../../api/patients';
import {
  Mic,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Split,
  Target,
} from 'lucide-react';
import type {
  Patient,
  ClinicalCase,
  Evaluation,
  TreatmentSession,
  Posturogram,
  PainScale,
  TreatmentObjectives,
} from '../../types/patient';

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
}

export function CaseDetailLayout({
  patient,
  clinicalCase,
  onBack,
}: CaseDetailLayoutProps) {
  const [localCase, setLocalCase] = useState<ClinicalCase>(clinicalCase);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(
    localCase.treatmentSessions[localCase.treatmentSessions.length - 1]?.id,
  );
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const { toast } = useToast();

  useEffect(() => {
    setLocalCase(clinicalCase);
  }, [clinicalCase]);

  const activeEvalType = getActiveEvaluation(localCase)?.type;

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

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    try {
      const updatedEvaluations = localCase.evaluations.map((e) =>
        e.id === evaluation.id ? evaluation : e,
      );
      if (!localCase.evaluations.find((e) => e.id === evaluation.id)) {
        updatedEvaluations.push(evaluation);
      }

      const updatedCase = { ...localCase, evaluations: updatedEvaluations };
      setLocalCase(updatedCase);

      await patientsApi.updateEvaluation(evaluation.id, evaluation);

      toast({
        title: 'Evaluacion actualizada',
        description: 'Los cambios se han guardado correctamente.',
      });
    } catch {
      setLocalCase(localCase);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la evaluacion.',
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

  const handleObjectivesChange = async (objectives: TreatmentObjectives) => {
    const previousCase = localCase;
    try {
      const updatedCase = {
        ...localCase,
        treatmentPlan: {
          ...localCase.treatmentPlan,
          objectives,
        },
      };
      setLocalCase(updatedCase);

      await patientsApi.updateTreatmentPlanObjectives(
        localCase.treatmentPlan.id,
        objectives,
      );
    } catch {
      setLocalCase(previousCase);
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
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center px-2 sm:px-4 py-2 sm:py-0 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-1/4 sm:w-1/3">
            <button
              onClick={
                viewMode === 'session-detail' ? handleBackFromDetail : onBack
              }
              aria-label={
                viewMode === 'session-detail'
                  ? 'Volver al cronograma'
                  : 'Volver al perfil del paciente'
              }
              className="p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft
                size={20}
                className="text-slate-600 dark:text-slate-400"
              />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {patient.name}
              </h2>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
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

          <div className="hidden sm:flex flex-1 justify-center items-center">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto scrollbar-hide max-w-full">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 min-h-[48px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isTimelineActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Seguimiento</span>
              </button>
              <button
                onClick={() => setViewMode('evaluation')}
                className={`px-3 py-2 min-h-[48px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  viewMode === 'evaluation'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <ClipboardList size={16} />
                <span className="hidden md:inline">Evaluacion</span>
                {activeEvalType && (
                  <span
                    className={`hidden md:inline ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeEvalType === 'INITIAL'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {activeEvalType === 'INITIAL' ? 'INI' : 'FIN'}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('objectives')}
                className={`px-3 py-2 min-h-[48px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  viewMode === 'objectives'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Target size={16} />
                <span className="hidden md:inline">Objetivos</span>
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-2 min-h-[48px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  viewMode === 'comparison'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Split size={16} />
                <span className="hidden md:inline">Comparar</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-1/4 sm:w-1/3 justify-end">
            <button className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-3 sm:px-4 sm:py-3 min-h-[44px] sm:min-h-[48px] rounded-full font-medium shadow-lg transition-transform hover:scale-105">
              <Mic size={18} />
              <span className="hidden md:inline whitespace-nowrap">
                Grabar Evolucion
              </span>
            </button>
          </div>
        </div>

        <div className="sm:hidden flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 mx-2 mb-2 rounded-lg overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              isTimelineActive
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={16} />
          </button>
          <button
            onClick={() => setViewMode('evaluation')}
            className={`px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'evaluation'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList size={16} />
            {activeEvalType && (
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                  activeEvalType === 'INITIAL'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}
              >
                {activeEvalType === 'INITIAL' ? 'INI' : 'FIN'}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('objectives')}
            className={`px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'objectives'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Target size={16} />
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              viewMode === 'comparison'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Split size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ResponsiveCaseTimeline
          clinicalCase={localCase}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
        />
        {viewMode === 'timeline' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <ObjectivesView
              clinicalCase={localCase}
              onObjectivesChange={handleObjectivesChange}
            />
          </div>
        ) : viewMode === 'comparison' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
            <ComparisonBoard
              clinicalCase={localCase}
              onExport={handleExportReport}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50">
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
