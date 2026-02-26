import * as React from 'react';
import type {
  EvaluationFormProps,
  Evaluation,
  OrthopedicTests,
  PainScale,
  Diagnosis,
} from '../../types/patient';
import { getActiveEvaluation } from '../../lib/evaluation-utils';
import { VoiceRecorder } from './VoiceRecorder';
import { useToast } from '../../hooks/use-toast';

type SoapSection = 'subjective' | 'objective' | 'assessment' | 'plan';

const ORTHOPEDIC_TESTS = [
  { key: 'thomas', label: 'Thomas' },
  { key: 'ely', label: 'Ely' },
  { key: 'ober', label: 'Ober' },
  { key: 'schober', label: 'Schober' },
  { key: 'ott', label: 'Ott' },
  { key: 'patrick', label: 'Patrick (FABER)' },
  { key: 'lasegue', label: 'Lasègue (SLR)' },
  { key: 'dedoSuelo', label: 'Dedo-Suelo' },
] as const;

export function EvaluationForm({ clinicalCase, onSave }: EvaluationFormProps) {
  const { toast } = useToast();
  const activeEvaluation = getActiveEvaluation(clinicalCase);
  const [activeSection, setActiveSection] =
    React.useState<SoapSection>('subjective');
  const [isSaving, setIsSaving] = React.useState(false);

  const [subjectiveText, setSubjectiveText] = React.useState('');
  const [testSearch, setTestSearch] = React.useState('');
  const [selectedTests, setSelectedTests] = React.useState<string[]>([]);

  const [orthopedicTests, setOrthopedicTests] = React.useState<OrthopedicTests>(
    () => (activeEvaluation?.orthopedicTests || {}) as OrthopedicTests,
  );
  const [painScale, setPainScale] = React.useState<PainScale>(
    () =>
      activeEvaluation?.painScale || {
        activity: 0,
        rest: 0,
        palpation: 0,
        type: 'chronic',
      },
  );
  const [diagnosis, setDiagnosis] = React.useState<Diagnosis>(
    () =>
      activeEvaluation?.diagnosis || {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
  );
  const hasHydratedRef = React.useRef(false);
  const isSavingRef = React.useRef(false);
  const snapshotRef = React.useRef<string>('');
  const hasPendingChangesRef = React.useRef(false);
  const onSaveRef = React.useRef(onSave);
  const buildPayloadRef = React.useRef<() => Evaluation | null>(() => null);

  React.useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  React.useEffect(() => {
    if (!activeEvaluation) return;
    const diagnosisWithSubjective = (activeEvaluation.diagnosis ||
      {}) as Diagnosis & { subjective?: string };

    setOrthopedicTests(
      (activeEvaluation.orthopedicTests || {}) as OrthopedicTests,
    );
    setPainScale(
      activeEvaluation.painScale || {
        activity: 0,
        rest: 0,
        palpation: 0,
        type: 'chronic',
      },
    );
    setDiagnosis(
      diagnosisWithSubjective || {
        functionalIndicator: '',
        clinicalAspect: '',
        anatomopathology: '',
        avdConsequences: '',
      },
    );
    setSubjectiveText(diagnosisWithSubjective.subjective || '');

    const hydratedSnapshot = JSON.stringify({
      orthopedicTests: (activeEvaluation.orthopedicTests ||
        {}) as OrthopedicTests,
      painScale: activeEvaluation.painScale || {
        activity: 0,
        rest: 0,
        palpation: 0,
        type: 'chronic',
      },
      diagnosis: diagnosisWithSubjective,
      subjectiveText: diagnosisWithSubjective.subjective || '',
    });
    snapshotRef.current = hydratedSnapshot;
    hasPendingChangesRef.current = false;
    hasHydratedRef.current = true;
  }, [activeEvaluation]);

  const buildPayload = React.useCallback((): Evaluation | null => {
    if (!activeEvaluation) return null;

    return {
      ...activeEvaluation,
      orthopedicTests,
      painScale,
      diagnosis: {
        ...diagnosis,
        subjective: subjectiveText,
      },
    };
  }, [activeEvaluation, orthopedicTests, painScale, diagnosis, subjectiveText]);

  const getCurrentSnapshot = React.useCallback(() => {
    return JSON.stringify({
      orthopedicTests,
      painScale,
      diagnosis,
      subjectiveText,
    });
  }, [orthopedicTests, painScale, diagnosis, subjectiveText]);

  React.useEffect(() => {
    buildPayloadRef.current = buildPayload;
  }, [buildPayload]);

  React.useEffect(() => {
    return () => {
      const currentOnSave = onSaveRef.current;
      if (!currentOnSave || !hasHydratedRef.current || isSavingRef.current)
        return;
      if (!hasPendingChangesRef.current) return;

      const payload = buildPayloadRef.current();
      if (!payload) return;
      void currentOnSave(payload, { silent: true });
    };
  }, []);

  if (!activeEvaluation) {
    return (
      <div className="p-8 text-center text-slate-500">
        No hay evaluación activa.
      </div>
    );
  }

  const addTest = (key: string) => {
    if (selectedTests.includes(key)) return;
    setSelectedTests((prev) => [...prev, key]);
  };

  const removeTest = (key: string) => {
    setSelectedTests((prev) => prev.filter((k) => k !== key));
  };

  const handleTestChange = (
    test: string,
    result: number,
    interpretation: string,
  ) => {
    hasPendingChangesRef.current = true;
    setOrthopedicTests((prev) => ({
      ...prev,
      [test]: { result, interpretation },
    }));
  };

  const handlePainChange = (
    field: 'activity' | 'rest' | 'palpation',
    value: number,
  ) => {
    hasPendingChangesRef.current = true;
    const updated = { ...painScale, [field]: value };
    setPainScale(updated);
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    isSavingRef.current = true;
    try {
      const payload = buildPayload();
      if (!payload) return;

      await onSave(payload);
      snapshotRef.current = getCurrentSnapshot();
      hasPendingChangesRef.current = false;
      toast({
        title: 'Guardado',
        description: 'La evaluación SOAP se guardó correctamente.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la evaluación.',
        variant: 'destructive',
      });
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const hasDiagnosis =
    diagnosis.functionalIndicator.trim() ||
    diagnosis.clinicalAspect.trim() ||
    diagnosis.anatomopathology.trim() ||
    diagnosis.avdConsequences.trim();

  const availableTests = ORTHOPEDIC_TESTS.filter(
    (test) =>
      !selectedTests.includes(test.key) &&
      test.label.toLowerCase().includes(testSearch.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { id: 'subjective', label: 'S - Subjective' },
          { id: 'objective', label: 'O - Objective' },
          { id: 'assessment', label: 'A - Assessment' },
          { id: 'plan', label: 'P - Plan' },
        ].map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id as SoapSection)}
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

      {activeSection === 'subjective' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Subjective
          </h2>
          <VoiceRecorder onRecordingComplete={() => {}} className="w-full" />
          <textarea
            value={subjectiveText}
            onChange={(e) => {
              hasPendingChangesRef.current = true;
              setSubjectiveText(e.target.value);
            }}
            placeholder="Motivo de consulta, historia y síntomas"
            className="w-full min-h-36 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
        </div>
      )}

      {activeSection === 'objective' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Objective
          </h2>

          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200">
              Escala de dolor
            </h3>
            {(['activity', 'rest', 'palpation'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm mb-1 capitalize">{field}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScale[field]}
                  onChange={(e) =>
                    handlePainChange(field, Number(e.target.value))
                  }
                  className="w-full h-11"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200">
              Agregar pruebas (opcional)
            </h3>
            <input
              value={testSearch}
              onChange={(e) => setTestSearch(e.target.value)}
              placeholder="Buscar prueba"
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
            />
            <div className="flex flex-wrap gap-2">
              {availableTests.map((test) => (
                <button
                  key={test.key}
                  type="button"
                  onClick={() => addTest(test.key)}
                  className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-700 text-sm"
                >
                  + {test.label}
                </button>
              ))}
            </div>
          </div>

          {selectedTests.map((testKey) => {
            const testMeta = ORTHOPEDIC_TESTS.find(
              (test) => test.key === testKey,
            );
            const current = (
              orthopedicTests as unknown as Record<
                string,
                { result: number; interpretation: string } | undefined
              >
            )[testKey] || { result: 1, interpretation: '' };
            return (
              <div
                key={testKey}
                className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{testMeta?.label ?? testKey}</h4>
                  <button
                    type="button"
                    onClick={() => removeTest(testKey)}
                    className="text-sm text-rose-600"
                  >
                    Quitar
                  </button>
                </div>
                <select
                  value={current.result}
                  onChange={(e) =>
                    handleTestChange(
                      testKey,
                      Number(e.target.value),
                      current.interpretation,
                    )
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  <option value={1}>Normal</option>
                  <option value={2}>Leve</option>
                  <option value={3}>Moderado</option>
                  <option value={4}>Severo</option>
                </select>
                <textarea
                  rows={2}
                  value={current.interpretation}
                  onChange={(e) =>
                    handleTestChange(testKey, current.result, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
                  placeholder="Interpretación"
                />
              </div>
            );
          })}
        </div>
      )}

      {activeSection === 'assessment' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Assessment
          </h2>
          <input
            value={diagnosis.functionalIndicator}
            onChange={(e) => {
              hasPendingChangesRef.current = true;
              setDiagnosis((prev) => ({
                ...prev,
                functionalIndicator: e.target.value,
              }));
            }}
            placeholder="Indicador funcional"
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
          <input
            value={diagnosis.clinicalAspect}
            onChange={(e) => {
              hasPendingChangesRef.current = true;
              setDiagnosis((prev) => ({
                ...prev,
                clinicalAspect: e.target.value,
              }));
            }}
            placeholder="Aspecto clínico"
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
          <input
            value={diagnosis.anatomopathology}
            onChange={(e) => {
              hasPendingChangesRef.current = true;
              setDiagnosis((prev) => ({
                ...prev,
                anatomopathology: e.target.value,
              }));
            }}
            placeholder="Anatomopatología"
            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
          <textarea
            value={diagnosis.avdConsequences}
            onChange={(e) => {
              hasPendingChangesRef.current = true;
              setDiagnosis((prev) => ({
                ...prev,
                avdConsequences: e.target.value,
              }));
            }}
            placeholder="Consecuencias AVD"
            className="w-full min-h-24 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg"
          />
        </div>
      )}

      {activeSection === 'plan' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Plan
          </h2>
          {!hasDiagnosis ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Completa el diagnóstico en Assessment antes de definir fases del
              tratamiento.
            </p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              El plan y las fases se definen manualmente en la vista de
              seguimiento del caso.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </div>
    </div>
  );
}
