interface SummarySectionProps {
  summary?: string;
}

export function SummarySection({ summary }: SummarySectionProps) {
  if (!summary) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
      <h3 className="mb-2 text-sm font-semibold text-sky-900 dark:text-sky-100">
        Resumen Clínico
      </h3>
      <p className="text-sm text-slate-700 dark:text-slate-300">{summary}</p>
    </div>
  );
}
