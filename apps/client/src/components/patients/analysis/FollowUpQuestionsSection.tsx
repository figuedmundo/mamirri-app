import type { FollowUpQuestion } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';

interface FollowUpQuestionsSectionProps {
  questions?: FollowUpQuestion[];
}

export function FollowUpQuestionsSection({
  questions,
}: FollowUpQuestionsSectionProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
        Preguntas de Seguimiento
      </h3>
      <div className="space-y-3">
        {questions.map((item, index) => (
          <div
            key={`${item.question}-${index}`}
            className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.question}
              </p>
              <Badge variant="outline" className="text-[10px]">
                {item.soapSection}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {item.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
