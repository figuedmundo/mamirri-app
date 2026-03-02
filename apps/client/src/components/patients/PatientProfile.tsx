import React from 'react';
import type {
  PatientProfileProps,
  ClinicalCase,
  Evaluation,
} from '../../types/patient';
import { getActiveEvaluation } from '../../lib/evaluation-utils';
import {
  User,
  Calendar,
  Phone,
  Mail,
  Mic,
  Camera,
  Video,
  Edit2,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { PainScaleDisplay } from './PainScaleDisplay';
import { DiagnosisSection } from './DiagnosisSection';
import { TreatmentPhaseCard } from './TreatmentPhaseCard';
import { SessionsFooter } from './SessionsFooter';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CameraCapture } from './CameraCapture';
import { VideoRecorder } from './VideoRecorder';
import { mediaApi } from '../../api/media';
import { useToast } from '../../hooks/use-toast';
import { VoiceNotesSection } from './VoiceNotesSection';

import { MultimediaSection } from './media/MultimediaSection';

import type { PhotoMetadata } from '@/types/patient';

export function PatientProfile({
  patient,
  onEdit,
  onVoiceDictation,
  onCaptureFootprint,
  onCaptureVideo,
  onSchedule,
  onCreateCase,
  onViewCase,
  onRefresh,
}: PatientProfileProps) {
  const cases = patient.clinicalCases ?? [];
  const activeCases = cases.filter((c) => c.status === 'active');
  const completedCases = cases.filter((c) => c.status === 'completed');
  const inactiveCases = cases.filter((c) => c.status === 'inactive');
  const activeCase = activeCases[0];
  const activeEvaluation = activeCase
    ? getActiveEvaluation(activeCase)
    : undefined;

  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const [expandedCaseIds, setExpandedCaseIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const { toast } = useToast();

  const toggleCaseExpanded = (caseId: string) => {
    setExpandedCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(caseId)) {
        next.delete(caseId);
      } else {
        next.add(caseId);
      }
      return next;
    });
  };

  const handleHuellaCapture = async (blob: Blob, metadata: PhotoMetadata) => {
    if (!activeEvaluation) {
      toast({
        title: 'No hay evaluación activa',
        description: 'Se necesita una evaluación activa para guardar huellas.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let side: 'left' | 'right' | 'unknown' = 'unknown';
      if (metadata.overlayType === 'footprint-left') side = 'left';
      if (metadata.overlayType === 'footprint-right') side = 'right';

      await mediaApi.uploadFootprint(
        activeEvaluation.id,
        blob,
        'initial',
        side,
      );

      toast({
        title: 'Huella guardada',
        description: `La huella ${side === 'left' ? 'izquierda' : side === 'right' ? 'derecha' : ''} se ha subido correctamente.`,
      });

      setIsCameraOpen(false);
      onCaptureFootprint?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo guardar la huella. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleVideoCapture = async (
    blob: Blob,
    metadata: { durationSeconds: number },
  ) => {
    if (!activeEvaluation) {
      toast({
        title: 'No hay evaluación activa',
        description: 'Se necesita una evaluación activa para guardar videos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mediaApi.uploadPostureVideo(
        activeEvaluation.id,
        blob,
        'gait',
        metadata.durationSeconds,
      );

      toast({
        title: 'Video guardado',
        description: 'El video se ha subido correctamente.',
      });

      setIsVideoOpen(false);
      onCaptureVideo?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo guardar el video. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAge = (birthDateString: string) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      case 'completed':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300';
      case 'inactive':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Status Color Bar */}
          <div
            className={`h-2 ${patient.isActive ? 'bg-teal-500' : 'bg-stone-400'}`}
          />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {patient.name}
                  </h1>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      patient.isActive
                        ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                        : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {patient.isActive ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span>{getAge(patient.birthDate)} años</span>
                    <span className="text-slate-400 dark:text-slate-500">
                      •
                    </span>

                    <span>{patient.occupation}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">
                      {patient.email || 'Sin email'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Nacido: {formatDate(patient.birthDate)}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
                  Expediente creado el {formatDate(patient.createdAt)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row sm:flex-col gap-2">
                {onVoiceDictation && (
                  <button
                    onClick={onVoiceDictation}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Dictar nota</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Huella</span>
                  </button>

                  <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0 sm:max-h-[80vh] flex flex-col">
                      <DialogTitle className="sr-only">
                        Capturar Huella
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        Interfaz de cámara para capturar huella plantar
                      </DialogDescription>
                      <CameraCapture
                        onCapture={handleHuellaCapture}
                        onCancel={() => setIsCameraOpen(false)}
                        overlayType="footprint-left"
                      />
                    </DialogContent>
                  </Dialog>

                  {onCaptureVideo && (
                    <>
                      <button
                        onClick={() => setIsVideoOpen(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        <Video className="w-4 h-4" />
                        <span>Video</span>
                      </button>

                      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0 sm:max-h-[80vh] flex flex-col">
                          <DialogTitle className="sr-only">
                            Capturar Video de Marcha
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Interfaz de grabación de video para análisis de
                            marcha
                          </DialogDescription>
                          <VideoRecorder
                            onCapture={handleVideoCapture}
                            onCancel={() => setIsVideoOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>

                {onSchedule && (
                  <button
                    onClick={onSchedule}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-sky-500 text-sky-600 dark:text-sky-400 rounded-lg font-medium hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agendar</span>
                  </button>
                )}

                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Cases Section */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Casos Clínicos
            </h2>
            {onCreateCase && (
              <button
                onClick={onCreateCase}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-sky-500 bg-white px-4 py-2 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-50 dark:bg-slate-800 dark:text-sky-400 dark:hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Caso</span>
              </button>
            )}
          </div>

          {cases.length === 0 ? (
            <EmptyState onCreateCase={onCreateCase} />
          ) : (
            <div className="space-y-4">
              {activeCases.map((clinicalCase) => (
                <ClinicalCaseCard
                  key={clinicalCase.id}
                  clinicalCase={clinicalCase}
                  evaluation={getActiveEvaluation(clinicalCase)}
                  onViewCase={onViewCase}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}

              {completedCases.map((clinicalCase) => (
                <CollapsedCaseRow
                  key={clinicalCase.id}
                  clinicalCase={clinicalCase}
                  isExpanded={expandedCaseIds.has(clinicalCase.id)}
                  onToggle={() => toggleCaseExpanded(clinicalCase.id)}
                  onViewCase={onViewCase}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}

              {inactiveCases.map((clinicalCase) => (
                <CollapsedCaseRow
                  key={clinicalCase.id}
                  clinicalCase={clinicalCase}
                  isExpanded={expandedCaseIds.has(clinicalCase.id)}
                  onToggle={() => toggleCaseExpanded(clinicalCase.id)}
                  onViewCase={onViewCase}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Voice Notes Section */}
        {activeEvaluation?.voiceNotes &&
          activeEvaluation.voiceNotes.length > 0 && (
            <div className="mt-8">
              <VoiceNotesSection
                voiceNotes={activeEvaluation.voiceNotes}
                title="Notas de Voz de la Evaluación"
              />
            </div>
          )}

        {/* Multimedia Section */}
        {activeCase && (
          <div className="mt-8">
            <MultimediaSection
              clinicalCase={activeCase}
              onRefresh={onRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onCreateCase }: { onCreateCase?: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
      <svg
        className="mx-auto h-16 w-16 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
        Sin casos clínicos
      </h3>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Este paciente aún no tiene casos clínicos registrados.
      </p>
      {onCreateCase && (
        <button
          onClick={onCreateCase}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Caso</span>
        </button>
      )}
    </div>
  );
}

interface CollapsedCaseRowProps {
  clinicalCase: ClinicalCase;
  isExpanded: boolean;
  onToggle: () => void;
  onViewCase?: (caseId: string) => void;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}

function CollapsedCaseRow({
  clinicalCase,
  isExpanded,
  onToggle,
  onViewCase,
  getStatusColor,
  formatDate,
}: CollapsedCaseRowProps) {
  if (isExpanded) {
    return (
      <ClinicalCaseCard
        clinicalCase={clinicalCase}
        evaluation={getActiveEvaluation(clinicalCase)}
        onViewCase={onViewCase}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/70"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            {clinicalCase.title}
          </h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(clinicalCase.status)}`}
          >
            {clinicalCase.status === 'completed' ? 'Completado' : 'Inactivo'}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Inicio: {formatDate(clinicalCase.startDate)}
          {clinicalCase.endDate
            ? ` - Fin: ${formatDate(clinicalCase.endDate)}`
            : ''}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
    </button>
  );
}

interface ClinicalCaseCardProps {
  clinicalCase: ClinicalCase;
  evaluation?: Evaluation;
  onViewCase?: (caseId: string) => void;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
}

function ClinicalCaseCard({
  clinicalCase,
  evaluation,
  onViewCase,
  getStatusColor,
  formatDate,
}: ClinicalCaseCardProps) {
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewCase?.(clinicalCase.id)}
    >
      {/* Case Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {clinicalCase.title}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(clinicalCase.status)}`}
              >
                {clinicalCase.status === 'active'
                  ? 'Activo'
                  : clinicalCase.status === 'completed'
                    ? 'Completado'
                    : 'Inactivo'}
              </span>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-400 line-clamp-2">
              {clinicalCase.consultationReason}
            </p>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-500 sm:text-right">
            <p>Inicio: {formatDate(clinicalCase.startDate)}</p>
            {clinicalCase.endDate && (
              <p>Fin: {formatDate(clinicalCase.endDate)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Case Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Diagnosis Section */}
        {evaluation?.diagnosis && (
          <div className="md:col-span-2 lg:col-span-2">
            <DiagnosisSection diagnosis={evaluation.diagnosis} />
          </div>
        )}

        {/* Pain Scale Section */}
        {evaluation?.painScale && (
          <div>
            <PainScaleDisplay painScale={evaluation.painScale} />
          </div>
        )}

        {/* Objectives Section */}
        {clinicalCase.treatmentPlan?.objectives?.therapeutic && (
          <div>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Objetivos
            </h4>
            <div className="text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Terapéutico:
              </span>
              <p className="text-slate-900 dark:text-slate-100 mt-0.5">
                {clinicalCase.treatmentPlan.objectives.therapeutic}
              </p>
            </div>
          </div>
        )}

        {/* Treatment Phases Section */}
        {clinicalCase.treatmentPlan?.phases &&
          clinicalCase.treatmentPlan.phases.length > 0 && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Fases del Tratamiento
              </h4>
              <div className="space-y-2">
                {clinicalCase.treatmentPlan.phases.map((phase) => (
                  <TreatmentPhaseCard key={phase.number} phase={phase} />
                ))}
              </div>
            </div>
          )}

        {clinicalCase.treatmentPlan?.protocols &&
          clinicalCase.treatmentPlan.protocols.length > 0 && (
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Protocolos Adjuntos
              </h4>
              <div className="flex flex-wrap gap-2">
                {clinicalCase.treatmentPlan.protocols.map((item) => (
                  <span
                    key={`${item.treatmentPlanId}-${item.protocolId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-1 text-xs font-semibold"
                  >
                    {item.protocol.title}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Sessions Footer */}
      {clinicalCase.treatmentSessions &&
        clinicalCase.treatmentSessions.length > 0 && (
          <SessionsFooter
            sessions={clinicalCase.treatmentSessions}
            formatDate={formatDate}
          />
        )}
    </div>
  );
}
