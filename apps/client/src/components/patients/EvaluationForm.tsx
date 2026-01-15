import React from 'react';
import type {
  EvaluationFormProps,
  Posturogram,
  OrthopedicTests,
  AVDEvaluation,
  PainScale,
} from '../../types/patient';

export function EvaluationForm({
  clinicalCase,
  onSave,
  onVoiceDictation,
  onPosturogramChange,
  onPainScaleChange,
}: EvaluationFormProps) {
  const [posturogram, setPosturogram] = React.useState<Posturogram>(
    clinicalCase.evaluation.posturogram,
  );
  const [orthopedicTests, setOrthopedicTests] = React.useState<OrthopedicTests>(
    clinicalCase.evaluation.orthopedicTests,
  );
  const [avdEvaluation, setAvdEvaluation] = React.useState<AVDEvaluation>(
    clinicalCase.evaluation.avdEvaluation,
  );
  const [painScale, setPainScale] = React.useState<PainScale>(
    clinicalCase.evaluation.painScale,
  );
  const [activeSection, setActiveSection] = React.useState<
    'posturogram' | 'tests' | 'avd' | 'pain'
  >('posturogram');

  const handlePosturogramChange = (
    part: keyof Posturogram,
    field: string,
    value: string,
  ) => {
    // Note: This needs careful typing if we want full type safety on nested objects
    // Assuming part is a key like 'head', 'shoulders', etc. which are objects or strings.
    // For now, mirroring the logic but with English keys.
    const currentPart = posturogram[part];
    let updatedPart;

    if (typeof currentPart === 'object' && currentPart !== null) {
      updatedPart = { ...currentPart, [field]: value };
    } else {
      // If it was a string or undefined, we might be changing structure or legacy field
      updatedPart = value;
    }

    const updated = {
      ...posturogram,
      [part]: updatedPart,
    };
    setPosturogram(updated);
    onPosturogramChange?.(updated);
  };

  const handleTestChange = (
    test: keyof OrthopedicTests,
    result: number,
    interpretation: string,
  ) => {
    // Only update if the test exists in the state or is optional
    const currentTest = orthopedicTests[test];
    if (!currentTest) return; // Or handle optional tests initialization

    const updated = {
      ...orthopedicTests,
      [test]: { result, interpretation },
    };
    setOrthopedicTests(updated);
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
  };

  const calculateAVDTotal = (
    currentScaleData: Record<string, unknown>,
    field: string,
    newValue: number,
  ) => {
    let total = 0;
    // Check fields based on scale type properties
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
    onPainScaleChange?.(updated);
  };

  const handlePainTypeChange = (value: 'chronic' | 'acute') => {
    const updated = { ...painScale, type: value };
    setPainScale(updated);
    onPainScaleChange?.(updated);
  };

  const handleSave = () => {
    onSave?.({
      id: clinicalCase.evaluation.id,
      clinicalCaseId: clinicalCase.id,
      date: clinicalCase.evaluation.date,
      posturogram,
      orthopedicTests,
      avdEvaluation,
      painScale,
      diagnosis: clinicalCase.evaluation.diagnosis,
      footprints: clinicalCase.evaluation.footprints,
      postureVideos: clinicalCase.evaluation.postureVideos,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Evaluación Cinético-Funcional
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {clinicalCase.title}
          </p>
        </div>
        <button
          onClick={onVoiceDictation}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
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
              d="M19 11a7 7 0 01-7 7v7a7 7 0 01-7 7h14a7 7 0 01-7 7v-7a7 7 0 01-7 7h-14z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9-9-9 9"
            />
          </svg>
          <span>Dictado por voz</span>
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'posturogram', label: 'Posturograma' },
          { id: 'tests', label: 'Tests Ortopédicos' },
          { id: 'avd', label: 'Evaluación AVD' },
          { id: 'pain', label: 'Escala de Dolor' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() =>
              setActiveSection(
                section.id as 'posturogram' | 'tests' | 'avd' | 'pain',
              )
            }
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
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

          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Visual representation kept simple for brevity, logic adapted to English props */}
              <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-400"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Normal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Anormal
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(posturogram) as (keyof Posturogram)[]).map((part) => {
              const partValue = posturogram[part];
              // Only render if it's an object with deviation properties to match UI form
              if (typeof partValue !== 'object' || partValue === null)
                return null;

              return (
                <div
                  key={part}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 capitalize mb-3">
                    {part}
                  </h3>
                  <div className="space-y-3">
                    {Object.keys(partValue).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">
                          {field}
                        </label>
                        <select
                          value={(partValue as Record<string, string>)[field]}
                          onChange={(e) =>
                            handlePosturogramChange(part, field, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="normal">Normal</option>
                          <option value="anteversion">Anteversion</option>
                          <option value="retroversion">Retroversion</option>
                          <option value="kyphosis">Kyphosis</option>
                          <option value="lordosis">Lordosis</option>
                          <option value="scoliosis">Scoliosis</option>
                          <option value="valgus">Valgus</option>
                          <option value="varus">Varus</option>
                          <option value="external-rotation-left">
                            Ext. Rotation (Left)
                          </option>
                          <option value="external-rotation-right">
                            Ext. Rotation (Right)
                          </option>
                          <option value="lateralization-left">
                            Lateralization Left
                          </option>
                          <option value="lateralization-right">
                            Lateralization Right
                          </option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSection === 'tests' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Tests Ortopédicos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(orthopedicTests) as (keyof OrthopedicTests)[]).map(
              (test) => {
                const testData = orthopedicTests[test];
                if (!testData) return null; // Handle optional tests

                return (
                  <div
                    key={test}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 capitalize mb-3">
                      {test}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Resultado
                        </label>
                        <input
                          type="number"
                          value={testData.result}
                          onChange={(e) =>
                            handleTestChange(
                              test,
                              Number(e.target.value),
                              testData.interpretation,
                            )
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Interpretación
                        </label>
                        <textarea
                          value={testData.interpretation}
                          onChange={(e) =>
                            handleTestChange(
                              test,
                              Number(testData.result),
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          testData.result === 1
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : testData.result === 2
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {testData.result === 1
                          ? '✓ Normal'
                          : testData.result === 2
                            ? '⚠ Leve'
                            : '⚠ Moderado'}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-800 dark:text-slate-200">
                  Durante actividad
                </label>
                <span
                  className={`text-2xl font-bold ${
                    painScale.activity <= 3
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : painScale.activity <= 6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {painScale.activity}
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScale.activity}
                  onChange={(e) =>
                    handlePainChange('activity', Number(e.target.value))
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Sin dolor</span>
                <span>Dolor intenso</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-800 dark:text-slate-200">
                  En reposo
                </label>
                <span
                  className={`text-2xl font-bold ${
                    painScale.rest <= 3
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : painScale.rest <= 6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {painScale.rest}
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScale.rest}
                  onChange={(e) =>
                    handlePainChange('rest', Number(e.target.value))
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Sin dolor</span>
                <span>Dolor intenso</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-800 dark:text-slate-200">
                  Al palpación
                </label>
                <span
                  className={`text-2xl font-bold ${
                    painScale.palpation <= 3
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : painScale.palpation <= 6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {painScale.palpation}
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScale.palpation}
                  onChange={(e) =>
                    handlePainChange('palpation', Number(e.target.value))
                  }
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Sin dolor</span>
                <span>Dolor intenso</span>
              </div>
            </div>

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

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {}}
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
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
              d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4h-3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2H9"
            />
          </svg>
          Guardar Evaluación
        </button>
      </div>
    </div>
  );
}
