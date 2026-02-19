import { Check } from 'lucide-react';

type ProgressIndicatorProps = {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  steps?: [string, string, string];
};

const defaultSteps: [string, string, string] = [
  'Esenciales',
  'Branding',
  'Equipo',
];

export function ProgressIndicator({
  currentStep,
  onStepClick,
  steps = defaultSteps,
}: ProgressIndicatorProps) {
  const stepIds: Array<1 | 2 | 3> = [1, 2, 3];

  return (
    <div aria-label="Progress indicator" className="space-y-3">
      <ol className="flex items-center gap-2">
        {stepIds.map((stepId, index) => {
          const isCompleted = stepId < currentStep;
          const isCurrent = stepId === currentStep;
          const clickable = Boolean(onStepClick) && stepId <= currentStep;

          return (
            <li key={stepId} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (clickable) {
                    onStepClick?.(stepId);
                  }
                }}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Paso ${stepId}: ${steps[stepId - 1]}`}
                disabled={!clickable}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-300 bg-white text-slate-500'
                } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepId}
              </button>
              {index < stepIds.length - 1 ? (
                <div
                  className={`h-1 flex-1 rounded ${
                    stepId < currentStep ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
        {steps.map((label, index) => (
          <span
            key={label}
            className={index + 1 === currentStep ? 'text-primary' : ''}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
