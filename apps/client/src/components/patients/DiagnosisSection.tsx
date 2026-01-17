import type { Diagnosis } from '../../types/patient';

interface DiagnosisSectionProps {
  diagnosis: Diagnosis;
}

export function DiagnosisSection({ diagnosis }: DiagnosisSectionProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
        Diagnóstico
      </h4>
      <div className="space-y-2 text-sm">
        <DiagnosisField
          label="Indicador funcional"
          value={diagnosis.functionalIndicator}
        />
        <DiagnosisField
          label="Aspecto clínico"
          value={diagnosis.clinicalAspect}
        />
        <DiagnosisField
          label="Anatomopatología"
          value={diagnosis.anatomopathology}
        />
      </div>
    </div>
  );
}

function DiagnosisField({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div>
      <span className="text-slate-600 dark:text-slate-400">{label}:</span>
      <p className="text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  );
}
