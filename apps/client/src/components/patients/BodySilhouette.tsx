import * as React from 'react';
import { cn } from '@/lib/utils';
import type {
  AnatomicalPoint,
  DeviationType,
  DeviationSeverity,
  BodySilhouetteProps,
} from './body-silhouette-types';

const ANATOMICAL_POINTS: { id: AnatomicalPoint; label: string; cy: number }[] =
  [
    { id: 'head', label: 'Cabeza', cy: 50 },
    { id: 'shoulders', label: 'Hombros', cy: 100 },
    { id: 'spine', label: 'Columna', cy: 170 },
    { id: 'pelvis', label: 'Pelvis', cy: 230 },
    { id: 'knees', label: 'Rodillas', cy: 320 },
    { id: 'feet', label: 'Pies', cy: 420 },
  ];

const DEVIATION_OPTIONS: {
  value: DeviationType;
  label: string;
  severity: DeviationSeverity;
}[] = [
  { value: 'normal', label: 'Normal', severity: 'normal' },
  { value: 'anteversion', label: 'Anteversión', severity: 'mild' },
  { value: 'retroversion', label: 'Retroversión', severity: 'mild' },
  { value: 'kyphosis', label: 'Cifosis', severity: 'mild' },
  { value: 'lordosis', label: 'Lordosis', severity: 'mild' },
  { value: 'scoliosis', label: 'Escoliosis', severity: 'severe' },
  { value: 'valgus', label: 'Valgo', severity: 'mild' },
  { value: 'varus', label: 'Varo', severity: 'mild' },
  {
    value: 'external-rotation-left',
    label: 'Rotación Ext. Izq.',
    severity: 'mild',
  },
  {
    value: 'external-rotation-right',
    label: 'Rotación Ext. Der.',
    severity: 'mild',
  },
  {
    value: 'lateralization-left',
    label: 'Lateralización Izq.',
    severity: 'mild',
  },
  {
    value: 'lateralization-right',
    label: 'Lateralización Der.',
    severity: 'mild',
  },
];

function getSeverityColor(severity: DeviationSeverity): string {
  switch (severity) {
    case 'normal':
      return 'fill-emerald-500';
    case 'mild':
      return 'fill-amber-500';
    case 'severe':
      return 'fill-rose-500';
  }
}

function getSeverityStroke(severity: DeviationSeverity): string {
  switch (severity) {
    case 'normal':
      return 'stroke-emerald-600';
    case 'mild':
      return 'stroke-amber-600';
    case 'severe':
      return 'stroke-rose-600';
  }
}

export function BodySilhouette({
  values,
  onChange,
  className,
}: BodySilhouetteProps) {
  const [activePoint, setActivePoint] = React.useState<AnatomicalPoint | null>(
    null,
  );
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePointClick = (point: AnatomicalPoint) => {
    if (activePoint === point) {
      setActivePoint(null);
      setDropdownPosition(null);
      return;
    }

    const svg = containerRef.current?.querySelector('svg');
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const pointData = ANATOMICAL_POINTS.find((p) => p.id === point);
      if (pointData) {
        const x = rect.left + rect.width / 2 + 40;
        const y = rect.top + (pointData.cy / 450) * rect.height;
        setDropdownPosition({ x, y });
      }
    }
    setActivePoint(point);
  };

  const handleDeviationSelect = (deviation: DeviationType) => {
    if (activePoint) {
      const option = DEVIATION_OPTIONS.find((o) => o.value === deviation);
      onChange(activePoint, {
        deviation,
        severity: option?.severity || 'normal',
      });
      setActivePoint(null);
      setDropdownPosition(null);
    }
  };

  const handleKeyDown =
    (point: AnatomicalPoint) => (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePointClick(point);
      } else if (event.key === 'Escape') {
        setActivePoint(null);
        setDropdownPosition(null);
      }
    };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActivePoint(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <svg
        viewBox="0 0 200 450"
        className="w-full max-w-[200px] mx-auto"
        role="img"
        aria-label="Diagrama de postura corporal - Vista anterior"
      >
        <path
          d="M100 30 
             C115 30 125 40 125 55 
             C125 70 115 80 100 80 
             C85 80 75 70 75 55 
             C75 40 85 30 100 30
             M80 85 L120 85
             M100 85 L100 200
             M100 120 L60 170 L50 200
             M100 120 L140 170 L150 200
             M100 200 L70 350 L60 420
             M100 200 L130 350 L140 420"
          className="fill-none stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {ANATOMICAL_POINTS.map((point) => {
          const status = values[point.id];
          const isActive = activePoint === point.id;

          return (
            <g key={point.id}>
              <circle
                cx={100}
                cy={point.cy}
                r={isActive ? 24 : 20}
                className={cn(
                  'cursor-pointer transition-all duration-150',
                  getSeverityColor(status.severity),
                  getSeverityStroke(status.severity),
                  'stroke-2',
                  isActive && 'ring-2 ring-teal-500 ring-offset-2',
                )}
                tabIndex={0}
                role="button"
                aria-label={`${point.label} - ${status.deviation === 'normal' ? 'Normal' : status.deviation}`}
                aria-pressed={isActive}
                onClick={() => handlePointClick(point.id)}
                onKeyDown={handleKeyDown(point.id)}
                style={{ outline: 'none' }}
              />
              <text
                x={100}
                y={point.cy + 4}
                textAnchor="middle"
                className="fill-white text-[10px] font-medium pointer-events-none select-none"
              >
                {point.label.charAt(0)}
              </text>
            </g>
          );
        })}
      </svg>

      {activePoint && dropdownPosition && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[180px] max-h-[300px] overflow-y-auto"
          style={{
            left: dropdownPosition.x,
            top: dropdownPosition.y,
            transform: 'translateY(-50%)',
          }}
          role="listbox"
          aria-label={`Seleccionar desviación para ${ANATOMICAL_POINTS.find((p) => p.id === activePoint)?.label}`}
        >
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 mb-1">
            {ANATOMICAL_POINTS.find((p) => p.id === activePoint)?.label}
          </div>
          {DEVIATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDeviationSelect(option.value)}
              className={cn(
                'w-full text-left px-3 py-3 sm:py-2 rounded-md text-sm transition-colors',
                'hover:bg-slate-100 dark:hover:bg-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-teal-500',
                values[activePoint].deviation === option.value &&
                  'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
                'min-h-[44px]',
              )}
              role="option"
              aria-selected={values[activePoint].deviation === option.value}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    option.severity === 'normal' && 'bg-emerald-500',
                    option.severity === 'mild' && 'bg-amber-500',
                    option.severity === 'severe' && 'bg-rose-500',
                  )}
                />
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Normal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Leve
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Severo
          </span>
        </div>
      </div>
    </div>
  );
}
