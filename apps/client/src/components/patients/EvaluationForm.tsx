import React from 'react';
import type {
  EvaluationFormProps,
  Posturogram,
  OrthopedicTests,
  AVDEvaluation,
  PainScale,
  Evaluation,
  Footprint,
  PostureVideo,
  VideoMetadata,
} from '../../types/patient';
import {
  EvaluationType,
  EVALUATION_TYPE_OPTIONS,
  type EvaluationTypeValue,
} from '../../types/patient';
import { BodySilhouette } from './BodySilhouette';
import {
  type AnatomicalPoint,
  type PointStatus,
  createDefaultPointStatus,
} from './body-silhouette-types';
import { VoiceRecorder } from './VoiceRecorder';
import { VideoRecorder } from './VideoRecorder';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { useTranscriptionPolling } from '../../hooks/use-transcription-polling';
import { useDebounce } from '../../hooks/use-debounce';
import { useUnsavedChanges } from '../../hooks/use-unsaved-changes';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { mediaApi } from '../../api/media';

import {
  getInitialEvaluation,
  getFinalEvaluation,
  getActiveEvaluation,
} from '../../lib/evaluation-utils';

const ORTHOPEDIC_TESTS_CONFIG = [
  { key: 'thomas', label: 'Thomas', description: 'Flexor cadera' },
  { key: 'ely', label: 'Ely', description: 'Recto femoral' },
  { key: 'ober', label: 'Ober', description: 'Banda iliotibial' },
  { key: 'schober', label: 'Schober', description: 'Columna lumbar' },
  { key: 'ott', label: 'Ott', description: 'Columna torácica' },
  { key: 'patrick', label: 'Patrick (FABER)', description: 'Cadera/SI' },
  { key: 'lasegue', label: 'Lasègue (SLR)', description: 'Nervio ciático' },
  { key: 'dedoSuelo', label: 'Dedo-Suelo', description: 'Flexibilidad' },
] as const;

export function EvaluationForm({
  clinicalCase,
  onSave,
  onPosturogramChange,
  onPainScaleChange,
}: EvaluationFormProps) {
  const activeEvaluation = getActiveEvaluation(clinicalCase);

  const hasInitialEvaluation = !!getInitialEvaluation(clinicalCase);
  const hasFinalEvaluation = !!getFinalEvaluation(clinicalCase);

  const [evaluationType, setEvaluationType] =
    React.useState<EvaluationTypeValue>(
      activeEvaluation?.type || EvaluationType.INITIAL,
    );
  const [hasStartedDataEntry, setHasStartedDataEntry] = React.useState(false);

  const [posturogram, setPosturogram] = React.useState<Posturogram>(
    () => activeEvaluation?.posturogram || ({} as Posturogram),
  );
  const [orthopedicTests, setOrthopedicTests] = React.useState<OrthopedicTests>(
    () =>
      activeEvaluation?.orthopedicTests || ({} as unknown as OrthopedicTests),
  );
  const [avdEvaluation, setAvdEvaluation] = React.useState<AVDEvaluation>(
    () => activeEvaluation?.avdEvaluation || ({} as unknown as AVDEvaluation),
  );
  const [painScale, setPainScale] = React.useState<PainScale>(
    () =>
      activeEvaluation?.painScale ||
      ({
        activity: 0,
        rest: 0,
        palpation: 0,
        type: 'chronic',
      } as PainScale),
  );
  const [activeSection, setActiveSection] = React.useState<
    'posturogram' | 'tests' | 'avd' | 'pain' | 'media'
  >('posturogram');

  const [footprints, setFootprints] = React.useState<Footprint[]>(
    () => activeEvaluation?.footprints || [],
  );
  const [postureVideos, setPostureVideos] = React.useState<PostureVideo[]>(
    () => activeEvaluation?.postureVideos || [],
  );

  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [footprintSide, setFootprintSide] = React.useState<'left' | 'right'>(
    'left',
  );
  const [isFootprintCameraOpen, setIsFootprintCameraOpen] =
    React.useState(false);

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [voiceNoteId, setVoiceNoteId] = React.useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');

  const {
    transcription,
    status: transcriptionStatus,
    error: transcriptionError,
    retry: retryTranscription,
  } = useTranscriptionPolling({
    voiceNoteId,
    entityType: 'evaluations',
    entityId: activeEvaluation?.id || '',
    enabled: !!voiceNoteId,
  });

  const { isDirty, markDirty, markClean } = useUnsavedChanges();
  const { toast } = useToast();

  const [bodySilhouetteValues, setBodySilhouetteValues] = React.useState(
    createDefaultPointStatus,
  );

  const debouncedSavePosturogram = useDebounce(async (data: Posturogram) => {
    if (!onPosturogramChange) return;

    try {
      setSaveStatus('saving');
      // Await in case the parent returns a Promise
      await onPosturogramChange(data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar el posturograma. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  }, 300);

  const debouncedSavePainScale = useDebounce(async (data: PainScale) => {
    if (!onPainScaleChange) return;

    try {
      setSaveStatus('saving');
      // Await in case the parent returns a Promise
      await onPainScaleChange(data);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la escala de dolor. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  }, 300);

  const handleTypeChange = (newType: EvaluationTypeValue) => {
    if (hasStartedDataEntry) {
      toast({
        variant: 'destructive',
        title: 'No se puede cambiar el tipo',
        description:
          'Ya has comenzado a llenar el formulario. Crea una nueva evaluación.',
      });
      return;
    }
    setEvaluationType(newType);
  };

  if (!activeEvaluation) {
    return (
      <div className="p-8 text-center text-slate-500">
        No hay evaluación activa.
      </div>
    );
  }

  const handleBodySilhouetteChange = (
    point: AnatomicalPoint,
    status: PointStatus,
  ) => {
    setBodySilhouetteValues((prev) => ({
      ...prev,
      [point]: status,
    }));

    const updated = {
      ...posturogram,
      [point]: status.deviation,
    };
    setPosturogram(updated);
    markDirty();
    setHasStartedDataEntry(true);
    debouncedSavePosturogram(updated);
  };

  const handlePosturogramChange = (
    part: keyof Posturogram,
    field: string,
    value: string,
  ) => {
    const currentPart = posturogram[part];
    let updatedPart;

    if (typeof currentPart === 'object' && currentPart !== null) {
      updatedPart = { ...currentPart, [field]: value };
    } else {
      updatedPart = value;
    }

    const updated = {
      ...posturogram,
      [part]: updatedPart,
    };
    setPosturogram(updated);
    markDirty();
    debouncedSavePosturogram(updated);
  };

  const handleTestChange = (
    test: keyof OrthopedicTests,
    result: number,
    interpretation: string,
  ) => {
    const updated = {
      ...orthopedicTests,
      [test]: { result, interpretation },
    };
    setOrthopedicTests(updated);
    markDirty();
  };

  const handleAVDChange = (
    scaleType: 'barthel' | 'lawton',
    field: string,
    value: number,
  ) => {
    const currentScaleData = avdEvaluation[scaleType];
    const updated = {
      ...avdEvaluation,
      [scaleType]: {
        ...currentScaleData,
        [field]: value,
        total: calculateAVDTotal(
          currentScaleData as unknown as Record<string, unknown>,
          field,
          value,
        ),
      },
    };
    setAvdEvaluation(updated);
    markDirty();
  };

  const calculateAVDTotal = (
    currentScaleData: Record<string, unknown>,
    field: string,
    newValue: number,
  ) => {
    let total = 0;
    const fields = Object.prototype.hasOwnProperty.call(
      currentScaleData,
      'feeding',
    )
      ? [
          'feeding',
          'bathing',
          'grooming',
          'dressing',
          'bowels',
          'bladder',
          'toiletUse',
          'transfers',
          'mobility',
          'stairs',
        ]
      : [
          'phoneUse',
          'shopping',
          'foodPreparation',
          'housekeeping',
          'laundry',
          'transportation',
          'medication',
          'finances',
        ];

    fields.forEach((f) => {
      const val = f === field ? newValue : (currentScaleData[f] as number) || 0;
      total += val;
    });
    return total;
  };

  const handlePainChange = (
    field: keyof PainScale,
    value: number | 'chronic' | 'acute',
  ) => {
    const updated = { ...painScale, [field]: value };
    setPainScale(updated);
    markDirty();
    debouncedSavePainScale(updated);
  };

  const handlePainTypeChange = (value: 'chronic' | 'acute') => {
    const updated = { ...painScale, type: value };
    setPainScale(updated);
    markDirty();
    debouncedSavePainScale(updated);
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!activeEvaluation) return;

    setAudioBlob(blob);
    setUploadStatus('uploading');

    try {
      const voiceNote = await mediaApi.uploadEvaluationVoiceNote(
        activeEvaluation.id,
        blob,
        duration,
      );
      setVoiceNoteId(voiceNote.id);
      setUploadStatus('success');
      markDirty();
    } catch (error) {
      console.error('Voice upload error:', error);
      setUploadStatus('error');
      toast({
        title: 'Error al subir nota de voz',
        description: 'No se pudo guardar el audio. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      if (!activeEvaluation) return;

      const evaluation: Evaluation = {
        id: activeEvaluation.id,
        clinicalCaseId: clinicalCase.id,
        date: activeEvaluation.date,
        type: activeEvaluation.type,
        posturogram,
        orthopedicTests,
        avdEvaluation,
        painScale,
        diagnosis: activeEvaluation.diagnosis,
        footprints,
        postureVideos,
      };

      // Await in case the parent returns a Promise
      await onSave(evaluation);

      markClean();
      toast({
        title: 'Guardado',
        description: 'La evaluación se guardó correctamente.',
      });
    } catch {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar la evaluación. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!activeEvaluation) return;
    setPosturogram(activeEvaluation.posturogram);
    setOrthopedicTests(activeEvaluation.orthopedicTests);
    setAvdEvaluation(activeEvaluation.avdEvaluation);
    setPainScale(activeEvaluation.painScale);
    setAudioBlob(null);
    markClean();
  };

  const handleCameraCapture = async (blob: Blob) => {
    if (!activeEvaluation) return;

    try {
      // Upload as footprint/clinical photo
      // Defaulting to 'initial' or 'final' based on evaluation type
      const photoType = activeEvaluation.type === 'FINAL' ? 'final' : 'initial';

      const footprint = await mediaApi.uploadFootprint(
        activeEvaluation.id,
        blob,
        photoType,
      );

      setFootprints((prev) => [...prev, footprint]);

      toast({
        title: 'Foto guardada',
        description: 'La imagen se ha subido correctamente.',
      });

      setIsCameraOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo guardar la foto. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleVideoCapture = async (blob: Blob, metadata: VideoMetadata) => {
    if (!activeEvaluation) return;

    try {
      const video = await mediaApi.uploadPostureVideo(
        activeEvaluation.id,
        blob,
        'gait',
        metadata.durationSeconds,
      );

      setPostureVideos((prev) => [...prev, video]);

      toast({
        title: 'Video guardado',
        description: 'El video se ha subido correctamente.',
      });
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo guardar el video. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleFootprintCaptureConfirm = async (blob: Blob) => {
    if (!activeEvaluation) return;

    try {
      const photoType = activeEvaluation.type === 'FINAL' ? 'final' : 'initial';
      const footprint = await mediaApi.uploadFootprint(
        activeEvaluation.id,
        blob,
        photoType,
      );

      setFootprints((prev) => [...prev, footprint]);

      toast({
        title: 'Huella guardada',
        description: 'La imagen de huella se ha subido correctamente.',
      });
      setIsFootprintCameraOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error al subir',
        description: 'No se pudo guardar la huella. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Tipo de Evaluación
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {EVALUATION_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTypeChange(option.value)}
                disabled={hasStartedDataEntry}
                className={`p-4 rounded-lg border-2 transition-all ${
                  evaluationType === option.value
                    ? `${
                        option.value === EvaluationType.INITIAL
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-100'
                          : 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-100'
                      }`
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
                {evaluationType === option.value && (
                  <div className="absolute top-2 right-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          {hasFinalEvaluation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Sugerido: INICIAL (ya existe Evaluación Final)
            </p>
          )}
          {hasInitialEvaluation && !hasFinalEvaluation && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Sugerido: FINAL (ya existe Evaluación Inicial)
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Evaluación Cinético-Funcional
            <span
              className={`ml-3 px-3 py-1 text-sm rounded-lg ${
                activeEvaluation.type === 'INITIAL'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
            >
              {activeEvaluation.type === 'INITIAL' ? 'INICIAL' : 'FINAL'}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {clinicalCase.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
              Guardando...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Guardado ✓
            </span>
          )}
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            className="w-full max-w-sm"
          />
        </div>
      </div>

      {audioBlob && (
        <TranscriptionDisplay
          status={
            uploadStatus === 'uploading'
              ? 'uploading'
              : uploadStatus === 'error'
                ? 'failed'
                : transcriptionStatus === 'idle' ||
                    transcriptionStatus === 'processing'
                  ? 'pending'
                  : transcriptionStatus
          }
          transcription={transcription ?? undefined}
          audioUrl={audioBlob ? URL.createObjectURL(audioBlob) : undefined}
          error={
            (transcriptionError ?? undefined) ||
            (uploadStatus === 'error' ? 'Error al subir audio' : undefined)
          }
          onRetry={retryTranscription}
          onRerecord={() => {
            setAudioBlob(null);
            setVoiceNoteId(null);
            setUploadStatus('idle');
          }}
        />
      )}

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { id: 'posturogram', label: 'Posturograma' },
          { id: 'tests', label: 'Tests Ortopédicos' },
          { id: 'avd', label: 'Evaluación AVD' },
          { id: 'pain', label: 'Escala de Dolor' },
          { id: 'media', label: 'Multimedia' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() =>
              setActiveSection(
                section.id as
                  | 'posturogram'
                  | 'tests'
                  | 'avd'
                  | 'pain'
                  | 'media',
              )
            }
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeSection === section.id
                ? 'border-teal-500 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'posturogram' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Posturograma Interactivo
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Haz clic en cada parte del cuerpo para marcar desviaciones
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center gap-6">
              <BodySilhouette
                values={bodySilhouetteValues}
                onChange={handleBodySilhouetteChange}
                className="max-w-[250px]"
              />

              <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Capturar Postura
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0 sm:max-h-[80vh] flex flex-col">
                  <CameraCapture
                    onCapture={handleCameraCapture}
                    onCancel={() => setIsCameraOpen(false)}
                    overlayType="posture-anterior"
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(posturogram) as (keyof Posturogram)[]).map(
                (part) => {
                  // Skip nested view objects to prevent crash in legacy renderer
                  if (
                    [
                      'anteriorView',
                      'posteriorView',
                      'lateralView',
                      'gait',
                    ].includes(part)
                  ) {
                    return null;
                  }

                  const partValue = posturogram[part];
                  if (typeof partValue !== 'object' || partValue === null)
                    return null;

                  return (
                    <div
                      key={part}
                      className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3"
                    >
                      <h3 className="font-medium text-slate-800 dark:text-slate-200 capitalize text-sm mb-2">
                        {part}
                      </h3>
                      <div className="space-y-2">
                        {Object.keys(partValue).map((field) => (
                          <div key={field}>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 capitalize">
                              {field}
                            </label>
                            <select
                              value={
                                (partValue as Record<string, string>)[field]
                              }
                              onChange={(e) =>
                                handlePosturogramChange(
                                  part,
                                  field,
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="normal">Normal</option>
                              <option value="anteversion">Anteversión</option>
                              <option value="retroversion">Retroversión</option>
                              <option value="kyphosis">Cifosis</option>
                              <option value="lordosis">Lordosis</option>
                              <option value="scoliosis">Escoliosis</option>
                              <option value="valgus">Valgo</option>
                              <option value="varus">Varo</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'tests' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Tests Ortopédicos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ORTHOPEDIC_TESTS_CONFIG.map((testConfig) => {
              const testKey = testConfig.key as keyof OrthopedicTests;
              const testData = orthopedicTests[testKey] || {
                result: 0,
                interpretation: '',
              };

              return (
                <div
                  key={testConfig.key}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      {testConfig.label}
                    </h3>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        Number(testData.result) === 1
                          ? 'bg-emerald-500'
                          : Number(testData.result) === 2
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {testConfig.description}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Resultado
                      </label>
                      <select
                        value={testData.result}
                        onChange={(e) =>
                          handleTestChange(
                            testKey,
                            Number(e.target.value),
                            testData.interpretation,
                          )
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value={1}>Normal</option>
                        <option value={2}>Leve</option>
                        <option value={3}>Moderado</option>
                        <option value={4}>Severo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Interpretación
                      </label>
                      <textarea
                        value={testData.interpretation}
                        onChange={(e) =>
                          handleTestChange(
                            testKey,
                            Number(testData.result),
                            e.target.value,
                          )
                        }
                        rows={2}
                        placeholder="Observaciones..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSection === 'avd' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Evaluación de Actividades de la Vida Diaria (AVD)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Escala Barthel
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    avdEvaluation.barthel.total >= 12
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : avdEvaluation.barthel.total >= 9
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  Total: {avdEvaluation.barthel.total}/12
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {avdEvaluation.barthel.interpretation}
              </p>
              <div className="space-y-3">
                {[
                  { field: 'feeding', label: 'Comer' },
                  { field: 'transfers', label: 'Trasladarse' },
                  { field: 'grooming', label: 'Aseo personal' },
                  { field: 'mobility', label: 'Desplazarse' },
                  { field: 'stairs', label: 'Escaleras' },
                  { field: 'dressing', label: 'Vestirse' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {item.label}
                    </label>
                    <select
                      value={
                        avdEvaluation.barthel[
                          item.field as keyof typeof avdEvaluation.barthel
                        ]
                      }
                      onChange={(e) =>
                        handleAVDChange(
                          'barthel',
                          item.field,
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value={0}>Dependiente</option>
                      <option value={1}>Necesita ayuda</option>
                      <option value={2}>Independiente</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Escala Lawton
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    avdEvaluation.lawton.total >= 8
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : avdEvaluation.lawton.total >= 6
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  Total: {avdEvaluation.lawton.total}/10
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {avdEvaluation.lawton.interpretation}
              </p>
              <div className="space-y-3">
                {[
                  { field: 'foodPreparation', label: 'Preparación de comida' },
                  { field: 'housekeeping', label: 'Cuidado de la casa' },
                  { field: 'laundry', label: 'Lavado de ropa' },
                  { field: 'transportation', label: 'Transporte' },
                  { field: 'medication', label: 'Medicación' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {item.label}
                    </label>
                    <select
                      value={
                        avdEvaluation.lawton[
                          item.field as keyof typeof avdEvaluation.lawton
                        ]
                      }
                      onChange={(e) =>
                        handleAVDChange(
                          'lawton',
                          item.field,
                          Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value={0}>Dependiente</option>
                      <option value={1}>Necesita ayuda</option>
                      <option value={2}>Independiente</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'pain' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Escala Visual de Dolor (END)
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Marca el nivel de dolor en cada situación (0 = sin dolor, 10 =
            máximo dolor)
          </p>

          <div className="space-y-8">
            {[
              { key: 'activity', label: 'Durante actividad' },
              { key: 'rest', label: 'En reposo' },
              { key: 'palpation', label: 'A la palpación' },
            ].map((item) => (
              <div key={item.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`pain-${item.key}`}
                    className="font-medium text-slate-800 dark:text-slate-200"
                  >
                    {item.label}
                  </label>
                  <span
                    className={`text-2xl font-bold ${
                      (painScale[
                        item.key as 'activity' | 'rest' | 'palpation'
                      ] as number) <= 3
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : (painScale[
                              item.key as 'activity' | 'rest' | 'palpation'
                            ] as number) <= 6
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {painScale[item.key as 'activity' | 'rest' | 'palpation']}
                  </span>
                </div>
                <div className="relative h-11">
                  <div className="absolute inset-x-0 top-4 h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full" />
                  <input
                    id={`pain-${item.key}`}
                    type="range"
                    min="0"
                    max="10"
                    value={painScale[item.key as keyof PainScale]}
                    onChange={(e) =>
                      handlePainChange(
                        item.key as keyof PainScale,
                        Number(e.target.value),
                      )
                    }
                    aria-label={`${item.label}: ${painScale[item.key as keyof PainScale]} de 10`}
                    aria-valuenow={
                      painScale[item.key as keyof PainScale] as number
                    }
                    aria-valuemin={0}
                    aria-valuemax={10}
                    className="absolute inset-0 w-full h-11 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Sin dolor</span>
                  <span>Dolor intenso</span>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo de dolor
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePainTypeChange('chronic')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    painScale.type === 'chronic'
                      ? 'bg-teal-600 text-white dark:bg-teal-500'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Crónico
                </button>
                <button
                  type="button"
                  onClick={() => handlePainTypeChange('acute')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    painScale.type === 'acute'
                      ? 'bg-teal-600 text-white dark:bg-teal-500'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Agudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'media' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Huella Plantar
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Captura fotos de la huella plantar usando la cámara. Se recomienda
              capturar ambos pies.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {footprints.map((footprint) => (
                <div
                  key={footprint.id}
                  className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={footprint.url}
                    alt="Huella"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                    {new Date(footprint.date).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {footprints.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-center py-8 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  No hay huellas capturadas
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setFootprintSide('left');
                  setIsFootprintCameraOpen(true);
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar Izquierdo
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setFootprintSide('right');
                  setIsFootprintCameraOpen(true);
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar Derecho
              </Button>
            </div>

            <Dialog
              open={isFootprintCameraOpen}
              onOpenChange={setIsFootprintCameraOpen}
            >
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0 sm:max-h-[80vh] flex flex-col">
                <CameraCapture
                  onCapture={handleFootprintCaptureConfirm}
                  onCancel={() => setIsFootprintCameraOpen(false)}
                  overlayType={
                    footprintSide === 'left'
                      ? 'footprint-left'
                      : 'footprint-right'
                  }
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Video de Marcha
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Graba un video de la marcha o movimientos específicos (máx 30s).
            </p>

            {postureVideos.length > 0 && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {postureVideos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-700"
                  >
                    <video
                      src={video.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                <VideoRecorder onCapture={handleVideoCapture} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={handleCancel}
          disabled={!isDirty}
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Guardar Evaluación</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
