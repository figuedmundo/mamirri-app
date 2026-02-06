import type { ServiceStatus } from '@/types/analysis';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ServiceStatusIndicatorProps {
  status?: ServiceStatus;
}

export function ServiceStatusIndicator({
  status,
}: ServiceStatusIndicatorProps) {
  if (!status) return null;

  const allOperational = Object.values(status).every(Boolean);
  const someOperational = Object.values(status).some(Boolean);

  let color = 'bg-red-500';
  if (allOperational) color = 'bg-green-500';
  else if (someOperational) color = 'bg-yellow-500';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-xs text-muted-foreground">
              Estado del sistema
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>RAG (Literatura): {status.rag ? '✅' : '⚠️'}</p>
            <p>Visión (Imágenes): {status.vision ? '✅' : '⚠️'}</p>
            <p>Voz (Audio): {status.voice ? '✅' : '⚠️'}</p>
            <p>LLM (Análisis): {status.llm ? '✅' : '❌'}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
