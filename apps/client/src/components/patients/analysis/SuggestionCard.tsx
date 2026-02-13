import { useState } from 'react';
import type { Suggestion } from '@/types/analysis';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: Suggestion;
  type?: 'primary' | 'alternative';
  analysisId?: string;
  suggestionIndex?: number;
  feedback?: { isPositive: boolean; comment?: string } | null;
  onFeedbackChange?: (isPositive: boolean | null, comment?: string) => void;
}

export function SuggestionCard({
  suggestion,
  type = 'alternative',
  analysisId,
  suggestionIndex,
  feedback,
  onFeedbackChange,
}: SuggestionCardProps) {
  const [comment, setComment] = useState(feedback?.comment || '');
  const [prevFeedbackComment, setPrevFeedbackComment] = useState(
    feedback?.comment,
  );

  if (feedback?.comment !== prevFeedbackComment) {
    setPrevFeedbackComment(feedback?.comment);
    setComment(feedback?.comment || '');
  }

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

  const handleLike = () => {
    if (!onFeedbackChange) return;
    if (feedback?.isPositive === true) {
      onFeedbackChange(null);
    } else {
      onFeedbackChange(true);
    }
  };

  const handleDislike = () => {
    if (!onFeedbackChange) return;
    if (feedback?.isPositive === false) {
      onFeedbackChange(null);
    } else {
      onFeedbackChange(false);
    }
  };

  const handleCommentBlur = () => {
    if (onFeedbackChange && feedback?.isPositive === false) {
      onFeedbackChange(false, comment);
    }
  };

  return (
    <Card
      className={cn('mb-4 overflow-hidden', borderColor)}
      data-suggestion-index={suggestionIndex}
    >
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
      <CardContent className="pb-2">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
          {suggestion.description}
        </p>
        {suggestion.reasoning && (
          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs text-slate-600 dark:text-slate-400 italic">
            "{suggestion.reasoning}"
          </div>
        )}
      </CardContent>

      {analysisId !== undefined && (
        <CardFooter className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              aria-label="thumbs-up"
              className={cn(
                'min-w-11 min-h-11',
                feedback?.isPositive === true &&
                  'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400',
              )}
            >
              <ThumbsUp
                size={18}
                className={cn(feedback?.isPositive === true && 'fill-current')}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              aria-label="thumbs-down"
              className={cn(
                'min-w-11 min-h-11',
                feedback?.isPositive === false &&
                  'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400',
              )}
            >
              <ThumbsDown
                size={18}
                className={cn(feedback?.isPositive === false && 'fill-current')}
              />
            </Button>
          </div>

          {feedback?.isPositive === false && (
            <div className="w-full animate-in slide-in-from-top-1 duration-200">
              <Textarea
                placeholder="¿Por qué no fue útil? (opcional)"
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setComment(e.target.value)
                }
                onBlur={handleCommentBlur}
                className="text-xs min-h-[60px] resize-none"
                maxLength={500}
              />
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
