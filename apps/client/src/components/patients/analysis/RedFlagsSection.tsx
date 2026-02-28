import { AlertTriangle } from 'lucide-react';
import type { RedFlag } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';

interface RedFlagsSectionProps {
  redFlags?: RedFlag[];
}

const urgencyStyles: Record<RedFlag['urgency'], string> = {
  HIGH: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  MEDIUM:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  LOW: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
};

export function RedFlagsSection({ redFlags }: RedFlagsSectionProps) {
  if (!redFlags || redFlags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-rose-300 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-900 dark:text-rose-100">
        <AlertTriangle size={16} />
        Red Flags / Derivación
      </h3>
      <div className="space-y-3">
        {redFlags.map((flag, index) => (
          <div
            key={`${flag.flag}-${index}`}
            className="rounded-md border border-rose-200 bg-white p-3 dark:border-rose-900 dark:bg-slate-950"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {flag.flag}
              </p>
              <Badge className={urgencyStyles[flag.urgency]}>
                {flag.urgency}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {flag.recommendedAction}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
