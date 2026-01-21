import { useState } from 'react';
import type { ClinicalCase, TreatmentObjectives } from '../../types/patient';
import { ObjectiveCard } from './objectives/ObjectiveCard';
import { useDebounce } from '../../hooks/use-debounce';
import { useToast } from '../../hooks/use-toast';
import { Target, Loader2, Check, AlertCircle } from 'lucide-react';
import { mediaApi } from '../../api/media';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { VoiceRecorder } from './VoiceRecorder';

interface ObjectivesViewProps {
  clinicalCase: ClinicalCase;
  onObjectivesChange: (objectives: TreatmentObjectives) => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function ObjectivesView({
  clinicalCase,
  onObjectivesChange,
}: ObjectivesViewProps) {
  const { toast } = useToast();
  const objectives = clinicalCase.treatmentPlan?.objectives || {
    therapeutic: '',
    prophylactic: '',
    educational: '',
  };

  const [localObjectives, setLocalObjectives] =
    useState<TreatmentObjectives>(objectives);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [dictatingType, setDictatingType] = useState<
    keyof TreatmentObjectives | null
  >(null);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);

  const [prevPropObjectives, setPrevPropObjectives] = useState<
    TreatmentObjectives | undefined
  >(clinicalCase.treatmentPlan?.objectives);

  if (clinicalCase.treatmentPlan?.objectives !== prevPropObjectives) {
    setLocalObjectives(
      clinicalCase.treatmentPlan?.objectives || {
        therapeutic: '',
        prophylactic: '',
        educational: '',
      },
    );
    setPrevPropObjectives(clinicalCase.treatmentPlan?.objectives);
  }

  const debouncedSave = useDebounce(
    async (newObjectives: TreatmentObjectives) => {
      try {
        setSaveStatus('saving');
        await onObjectivesChange(newObjectives);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        toast({
          title: 'Error al guardar',
          description:
            'No se pudieron guardar los objetivos. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    },
    300,
  );

  const handleObjectiveChange = (
    type: keyof TreatmentObjectives,
    value: string,
  ) => {
    const newObjectives = { ...localObjectives, [type]: value };
    setLocalObjectives(newObjectives);
    debouncedSave(newObjectives);
  };

  const handleDictate = (type: keyof TreatmentObjectives) => {
    setDictatingType(type);
    setIsVoiceDialogOpen(true);
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!dictatingType) return;

    const activeCase = clinicalCase;
    const activeEval = activeCase.evaluations?.find(
      (e) => e.type === 'INITIAL' || e.type === 'FINAL',
    );

    if (!activeEval) {
      toast({
        title: 'Atención',
        description: 'Se necesita una evaluación para procesar el audio.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsVoiceDialogOpen(false);
      setSaveStatus('saving');
      toast({
        title: 'Transcribiendo audio...',
        description: 'Esto puede tomar unos segundos.',
      });

      const note = await mediaApi.uploadEvaluationVoiceNote(
        activeEval.id,
        blob,
        duration,
      );

      if (note.transcription) {
        const currentText = localObjectives[dictatingType];
        const newText = currentText
          ? `${currentText}\n${note.transcription}`
          : note.transcription;

        handleObjectiveChange(dictatingType, newText);
        toast({
          title: 'Dictado completado',
          description: 'El texto ha sido añadido al objetivo.',
        });
      } else {
        toast({
          title: 'Atención',
          description:
            'La transcripción está siendo procesada. Por favor, revisa en unos segundos.',
        });
      }
    } catch (error) {
      console.error('Dictation error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el dictado.',
        variant: 'destructive',
      });
    } finally {
      setDictatingType(null);
    }
  };

  const isEmpty =
    !localObjectives.therapeutic &&
    !localObjectives.prophylactic &&
    !localObjectives.educational;

  if (isEmpty && saveStatus === 'idle') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Define los objetivos del tratamiento
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Establece las metas terapéuticas, profilácticas y educativas para
            este caso clínico.
          </p>
          <button
            onClick={() =>
              handleObjectiveChange('therapeutic', localObjectives.therapeutic)
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            <Target className="w-4 h-4" />
            Comenzar a definir objetivos
          </button>
        </div>

        <div className="mt-8 grid gap-4">
          <ObjectiveCard
            type="therapeutic"
            value={localObjectives.therapeutic}
            onChange={(v) => handleObjectiveChange('therapeutic', v)}
            onDictate={() => handleDictate('therapeutic')}
            isDictating={dictatingType === 'therapeutic'}
          />
          <ObjectiveCard
            type="prophylactic"
            value={localObjectives.prophylactic}
            onChange={(v) => handleObjectiveChange('prophylactic', v)}
            onDictate={() => handleDictate('prophylactic')}
            isDictating={dictatingType === 'prophylactic'}
          />
          <ObjectiveCard
            type="educational"
            value={localObjectives.educational}
            onChange={(v) => handleObjectiveChange('educational', v)}
            onDictate={() => handleDictate('educational')}
            isDictating={dictatingType === 'educational'}
          />
        </div>

        <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-center">Dictar Objetivo</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Objetivos del Tratamiento
            </h2>
            <p className="text-sm text-slate-500">
              Define las metas para este caso clínico
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Guardado</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Error</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <ObjectiveCard
          type="therapeutic"
          value={localObjectives.therapeutic}
          onChange={(v) => handleObjectiveChange('therapeutic', v)}
          onDictate={() => handleDictate('therapeutic')}
          isDictating={dictatingType === 'therapeutic'}
        />
        <ObjectiveCard
          type="prophylactic"
          value={localObjectives.prophylactic}
          onChange={(v) => handleObjectiveChange('prophylactic', v)}
          onDictate={() => handleDictate('prophylactic')}
          isDictating={dictatingType === 'prophylactic'}
        />
        <ObjectiveCard
          type="educational"
          value={localObjectives.educational}
          onChange={(v) => handleObjectiveChange('educational', v)}
          onDictate={() => handleDictate('educational')}
          isDictating={dictatingType === 'educational'}
        />
      </div>

      <Dialog open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">Dictar Objetivo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
