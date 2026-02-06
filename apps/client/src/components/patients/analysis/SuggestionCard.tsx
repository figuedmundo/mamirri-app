import type { Suggestion } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SuggestionCardProps {
  suggestion: Suggestion;
  type?: 'primary' | 'alternative';
}

export function SuggestionCard({
  suggestion,
  type = 'alternative',
}: SuggestionCardProps) {
  const confidenceColor = {
    HIGH: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    MEDIUM:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    LOW: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  };

  const borderColor =
    type === 'primary'
      ? 'border-l-4 border-l-blue-500'
      : 'border-l-4 border-l-slate-300';

  return (
    <Card className={`mb-4 ${borderColor}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {suggestion.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={confidenceColor[suggestion.confidence]}
          >
            {suggestion.confidence}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
          {suggestion.description}
        </p>
        {suggestion.reasoning && (
          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs text-slate-600 dark:text-slate-400 italic">
            "{suggestion.reasoning}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}
