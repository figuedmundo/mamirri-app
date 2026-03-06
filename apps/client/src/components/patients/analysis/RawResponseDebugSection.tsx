import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { aiAnalysisApi } from '@/api/ai-analysis';

interface RawResponseDebugSectionProps {
  analysisId?: string;
  isVisible: boolean;
}

export function RawResponseDebugSection({
  analysisId,
  isVisible,
}: RawResponseDebugSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSensitiveView, setIsSensitiveView] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string | null>(null);
  const [isRedacted, setIsRedacted] = useState<boolean>(true);

  if (!isVisible || !analysisId) {
    return null;
  }

  const loadRawResponse = async (includeSensitive: boolean) => {
    setIsLoading(true);
    try {
      const response = await aiAnalysisApi.getRawModelResponse(
        analysisId,
        includeSensitive,
      );
      setResponseText(response.rawModelResponse);
      setSystemPrompt(response.systemPrompt);
      setUserPrompt(response.userPrompt);
      setIsRedacted(response.isRedacted);
      setIsSensitiveView(includeSensitive);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
        Depuracion IA (solo propietario/admin)
      </h3>
      <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
        La vista por defecto aplica redaccion para mostrar datos mas seguros.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadRawResponse(false)}
          disabled={isLoading}
        >
          {isLoading && !isSensitiveView
            ? 'Cargando...'
            : 'Ver respuesta raw (redactada)'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => loadRawResponse(true)}
          disabled={isLoading}
        >
          {isLoading && isSensitiveView
            ? 'Cargando...'
            : 'Mostrar version sensible'}
        </Button>
      </div>

      {responseText !== null && (
        <>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Modo actual: {isRedacted ? 'redactado' : 'sensible'}
          </p>

          {systemPrompt && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                System Prompt
              </h4>
              <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                {systemPrompt}
              </pre>
            </div>
          )}

          {userPrompt && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                User Prompt
              </h4>
              <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                {userPrompt}
              </pre>
            </div>
          )}

          <div className="mt-3">
            <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Respuesta LLM
            </h4>
            <pre className="mt-1 max-h-60 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
              {responseText || '(sin contenido raw)'}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
