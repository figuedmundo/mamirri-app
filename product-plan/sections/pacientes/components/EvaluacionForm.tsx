import React from 'react';
import type {
  EvaluacionFormProps,
  Posturograma,
  TestOrtopedicos,
  EvaluacionAVD,
  EscalaDolor,
} from '../types';

export function EvaluacionForm({
  casoClinico,
  onSave,
  onVoiceDictation,
  onPosturogramaChange,
  onPainScaleChange,
}: EvaluacionFormProps) {
  const [posturograma, setPosturograma] = React.useState<Posturograma>(
    casoClinico.evaluacion.posturograma,
  );
  const [testOrtopedicos, setTestOrtopedicos] = React.useState<TestOrtopedicos>(
    casoClinico.evaluacion.testOrtopedicos,
  );
  const [evaluacionAVD, setEvaluacionAVD] = React.useState<EvaluacionAVD>(
    casoClinico.evaluacion.evaluacionAVD,
  );
  const [escalaDolor, setEscalaDolor] = React.useState<EscalaDolor>(
    casoClinico.evaluacion.escalaDolor,
  );
  const [activeSection, setActiveSection] = React.useState<
    'posturograma' | 'tests' | 'avd' | 'dolor'
  >('posturograma');

  const isNormal = (value: string) => value.toLowerCase() === 'normal';

  const handlePosturogramaChange = (
    part: keyof Posturograma,
    field: keyof Posturograma[keyof Posturograma],
    value: string,
  ) => {
    const updated = {
      ...posturograma,
      [part]: {
        ...posturograma[part],
        [field]: value,
      },
    };
    setPosturograma(updated);
    onPosturogramaChange?.(updated);
  };

  const handleTestChange = (
    test: keyof TestOrtopedicos,
    resultado: number,
    interpretacion: string,
  ) => {
    const updated = {
      ...testOrtopedicos,
      [test]: { resultado, interpretacion },
    };
    setTestOrtopedicos(updated);
  };

  const handleAVDChange = (
    scaleType: 'barthel' | 'lawton',
    field: string,
    value: number,
  ) => {
    const currentScaleData = evaluacionAVD[scaleType];
    const updated = {
      ...evaluacionAVD,
      [scaleType]: {
        ...currentScaleData,
        [field]: value,
        total: calculateAVDTotal(currentScaleData, field, value),
      },
    };
    setEvaluacionAVD(updated);
  };

  const calculateAVDTotal = (
    currentScaleData: any,
    field: string,
    newValue: number,
  ) => {
    let total = 0;
    const fields = currentScaleData.hasOwnProperty('comer')
      ? [
          'comer',
          'trasladarse',
          'aseoPersonal',
          'desplazarse',
          'escaleras',
          'vestirse',
        ]
      : [
          'preparacionComida',
          'cuidadoCasa',
          'lavadoRopa',
          'transporte',
          'medicacion',
        ];

    fields.forEach((f) => {
      total += f === field ? newValue : currentScaleData[f] || 0;
    });
    return total;
  };

  const handlePainChange = (
    field: keyof EscalaDolor,
    value: number | 'cronico' | 'agudo',
  ) => {
    const updated = { ...escalaDolor, [field]: value };
    setEscalaDolor(updated);
    onPainScaleChange?.(updated);
  };

  const handlePainTypeChange = (value: 'cronico' | 'agudo') => {
    const updated = { ...escalaDolor, tipo: value };
    setEscalaDolor(updated);
    onPainScaleChange?.(updated);
  };

  const handleSave = () => {
    onSave?.({
      id: casoClinico.evaluacion.id,
      casoClinicoId: casoClinico.id,
      fecha: casoClinico.evaluacion.fecha,
      posturograma,
      testOrtopedicos,
      evaluacionAVD,
      escalaDolor,
      diagnostico: casoClinico.evaluacion.diagnostico,
      huellas: casoClinico.evaluacion.huellas,
      videosPostura: casoClinico.evaluacion.videosPostura,
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
            {casoClinico.titulo}
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
          { id: 'posturograma', label: 'Posturograma' },
          { id: 'tests', label: 'Tests Ortopédicos' },
          { id: 'avd', label: 'Evaluación AVD' },
          { id: 'dolor', label: 'Escala de Dolor' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
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

      {activeSection === 'posturograma' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Posturograma Interactivo
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Haz clic en cada parte del cuerpo para marcar desviaciones
          </p>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="grid grid-cols-3 gap-8 p-8">
                <div className="cursor-pointer text-center group">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center transition-all ${
                      isNormal(posturograma.cabeza.desviacion)
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    } hover:scale-105`}
                  >
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                    Cabeza
                  </p>
                </div>

                <div></div>

                <div className="cursor-pointer text-center group">
                  <div
                    className={`w-24 h-12 mx-auto rounded-lg border-4 flex items-center justify-center transition-all ${
                      isNormal(posturograma.hombros.desviacion)
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    } hover:scale-105`}
                  >
                    <span className="text-lg">💪</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                    Hombros
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 px-8 mt-4">
                <div className="cursor-pointer text-center group">
                  <div
                    className={`w-8 h-32 mx-auto rounded-lg border-4 flex items-center justify-center transition-all ${
                      isNormal(posturograma.columna.desviacion)
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    } hover:scale-105`}
                  >
                    <span className="text-2xl">🦴</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                    Columna
                  </p>
                </div>

                <div className="cursor-pointer text-center group">
                  <div
                    className={`w-24 h-20 mx-auto rounded-lg border-4 flex items-center justify-center transition-all ${
                      isNormal(posturograma.pelvis.desviacion)
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    } hover:scale-105`}
                  >
                    <span className="text-2xl">🦴</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                    Pelvis
                  </p>
                </div>

                <div className="cursor-pointer text-center group">
                  <div
                    className={`w-20 h-16 mx-auto rounded-lg border-4 flex items-center justify-center transition-all ${
                      isNormal(posturograma.rodillas.desviacion)
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    } hover:scale-105`}
                  >
                    <span className="text-xl">🦵</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                    Rodillas
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-16 px-8 mt-4">
                {['izquierdo', 'derecho'].map((side) => (
                  <div key={side} className="cursor-pointer text-center group">
                    <div
                      className={`w-16 h-24 rounded-lg border-4 flex items-center justify-center transition-all ${
                        isNormal(posturograma.pies.desviacion)
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      } hover:scale-105`}
                    >
                      <span className="text-2xl">🦶</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                      Pies
                    </p>
                  </div>
                ))}
              </div>

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
            {(Object.keys(posturograma) as (keyof Posturograma)[]).map(
              (part) => (
                <div
                  key={part}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 capitalize mb-3">
                    {part === 'pies'
                      ? 'Pies'
                      : part.charAt(0).toUpperCase() + part.slice(1)}
                  </h3>
                  <div className="space-y-3">
                    {(
                      Object.keys(
                        posturograma[part],
                      ) as (keyof Posturograma[keyof Posturograma])[]
                    ).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">
                          {field}
                        </label>
                        <select
                          value={posturograma[part][field]}
                          onChange={(e) =>
                            handlePosturogramaChange(
                              part,
                              field,
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="normal">Normal</option>
                          <option value="anteversion">Anteversión</option>
                          <option value="retroversion">Retroversión</option>
                          <option value="cifosis">Cifosis</option>
                          <option value="lordosis">Lordosis</option>
                          <option value="escoliosis">Escoliosis</option>
                          <option value="valgo">Valgo</option>
                          <option value="varo">Varo</option>
                          <option value="rotacion-externa-izq">
                            Rotación Externa (Izq)
                          </option>
                          <option value="rotacion-externa-der">
                            Rotación Externa (Der)
                          </option>
                          <option value="lateralizacion-izq">
                            Lateralización Izq
                          </option>
                          <option value="lateralizacion-der">
                            Lateralización Der
                          </option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {activeSection === 'tests' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Tests Ortopédicos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(testOrtopedicos) as (keyof TestOrtopedicos)[]).map(
              (test) => (
                <div
                  key={test}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 capitalize mb-3">
                    {test === 'ott' ? 'Ott' : test}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Resultado
                      </label>
                      <input
                        type="number"
                        value={testOrtopedicos[test].resultado}
                        onChange={(e) =>
                          handleTestChange(
                            test,
                            Number(e.target.value),
                            testOrtopedicos[test].interpretacion,
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
                        value={testOrtopedicos[test].interpretacion}
                        onChange={(e) =>
                          handleTestChange(
                            test,
                            testOrtopedicos[test].resultado,
                            e.target.value,
                          )
                        }
                        rows={2}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        testOrtopedicos[test].resultado === 1
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : testOrtopedicos[test].resultado === 2
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {testOrtopedicos[test].resultado === 1
                        ? '✓ Normal'
                        : testOrtopedicos[test].resultado === 2
                          ? '⚠ Leve'
                          : '⚠ Moderado'}
                    </div>
                  </div>
                </div>
              ),
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
                    evaluacionAVD.barthel.total >= 12
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : evaluacionAVD.barthel.total >= 9
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  Total: {evaluacionAVD.barthel.total}/12
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {evaluacionAVD.barthel.interpretacion}
              </p>
              <div className="space-y-3">
                {[
                  { field: 'comer', label: 'Comer' },
                  { field: 'trasladarse', label: 'Trasladarse' },
                  { field: 'aseoPersonal', label: 'Aseo personal' },
                  { field: 'desplazarse', label: 'Desplazarse' },
                  { field: 'escaleras', label: 'Escaleras' },
                  { field: 'vestirse', label: 'Vestirse' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {item.label}
                    </label>
                    <select
                      value={
                        evaluacionAVD.barthel[
                          item.field as keyof typeof evaluacionAVD.barthel
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
                    evaluacionAVD.lawton.total >= 8
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : evaluacionAVD.lawton.total >= 6
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}
                >
                  Total: {evaluacionAVD.lawton.total}/10
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {evaluacionAVD.lawton.interpretacion}
              </p>
              <div className="space-y-3">
                {[
                  {
                    field: 'preparacionComida',
                    label: 'Preparación de comida',
                  },
                  { field: 'cuidadoCasa', label: 'Cuidado de la casa' },
                  { field: 'lavadoRopa', label: 'Lavado de ropa' },
                  { field: 'transporte', label: 'Transporte' },
                  { field: 'medicacion', label: 'Medicación' },
                ].map((item) => (
                  <div key={item.field}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {item.label}
                    </label>
                    <select
                      value={
                        evaluacionAVD.lawton[
                          item.field as keyof typeof evaluacionAVD.lawton
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

      {activeSection === 'dolor' && (
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
                    escalaDolor.actividad <= 3
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : escalaDolor.actividad <= 6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {escalaDolor.actividad}
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={escalaDolor.actividad}
                  onChange={(e) =>
                    handlePainChange('actividad', Number(e.target.value))
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
                    escalaDolor.reposo <= 3
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : escalaDolor.reposo <= 6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {escalaDolor.reposo}
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={escalaDolor.reposo}
                  onChange={(e) =>
                    handlePainChange('reposo', Number(e.target.value))
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
                    escalaDolor.palpacion <= 3
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : escalaDolor.palpacion <= 6
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {escalaDolor.palpacion}
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full"></div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={escalaDolor.palpacion}
                  onChange={(e) =>
                    handlePainChange('palpacion', Number(e.target.value))
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
                  onClick={() => handlePainTypeChange('cronico')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    escalaDolor.tipo === 'cronico'
                      ? 'bg-teal-600 text-white dark:bg-teal-500'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Crónico
                </button>
                <button
                  type="button"
                  onClick={() => handlePainTypeChange('agudo')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    escalaDolor.tipo === 'agudo'
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
