import type { DifferentialDiagnosisItem } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DifferentialDiagnosisSectionProps {
  diagnoses?: DifferentialDiagnosisItem[];
}

export function DifferentialDiagnosisSection({
  diagnoses,
}: DifferentialDiagnosisSectionProps) {
  if (!diagnoses || diagnoses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Diagnóstico Diferencial
      </h3>
      <div className="space-y-3">
        {diagnoses.map((diagnosis, index) => (
          <Card key={`${diagnosis.condition}-${index}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{diagnosis.condition}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-emerald-700 dark:text-emerald-300">
                <span className="font-semibold">A favor:</span>{' '}
                {diagnosis.supportingEvidence}
              </p>
              <p className="text-rose-700 dark:text-rose-300">
                <span className="font-semibold">En contra:</span>{' '}
                {diagnosis.contradictingEvidence}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
