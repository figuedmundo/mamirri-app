export function AnalysisDisclaimer() {
  return (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
      <p className="text-xs text-slate-400">
        AI-generated suggestion. Clinical judgment required.
      </p>
      <p className="text-[10px] text-slate-300 mt-1">
        Generated at {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
