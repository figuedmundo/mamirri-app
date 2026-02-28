import type { ConfidenceJustification } from '@/types/analysis';

interface ConfidenceJustificationSectionProps {
  confidence?: ConfidenceJustification;
}

export function ConfidenceJustificationSection({
  confidence,
}: ConfidenceJustificationSectionProps) {
  if (!confidence) {
    return null;
  }

  return (
    <details className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <summary className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
        Justificación de la Confianza
      </summary>
      <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
        <p>
          <span className="font-semibold">Soporte bibliográfico:</span>{' '}
          {confidence.literatureSupport}
        </p>
        <p>
          <span className="font-semibold">Alineación clínica:</span>{' '}
          {confidence.clinicalAlignment}
        </p>
        {confidence.limitingFactors?.length > 0 && (
          <div>
            <p className="mb-1 font-semibold">Factores limitantes:</p>
            <ul className="list-disc pl-5">
              {confidence.limitingFactors.map((factor, index) => (
                <li key={`${factor}-${index}`}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}
