import * as React from 'react';
import { cn } from '@/lib/utils';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/use-debounce';
import { patientsApi } from '@/api/patients';
import { useToast } from '@/hooks/use-toast';
import type {
  Posturogram,
  PosturalView,
  AnatomicalPoint,
  DeviationType,
  DeviationSeverity,
  ClinicalCase,
  DeviationStatus,
  AnatomicalPointStatus,
} from '@/types/patient';

export interface PosturogramViewerProps {
  clinicalCase: ClinicalCase;
  onPosturogramChange?: (posturogram: Posturogram) => void;
  initialPosturogramUrl?: string;
  currentPosturogramUrl?: string;
}

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
  { value: 'scoliosis', label: 'Escoliosis', severity: 'severe' },
  { value: 'lordosis', label: 'Lordosis', severity: 'mild' },
  { value: 'kyphosis', label: 'Cifosis', severity: 'mild' },
  { value: 'rotation', label: 'Rotación', severity: 'mild' },
  { value: 'lateralization', label: 'Lateralización', severity: 'mild' },
  { value: 'valgus', label: 'Valgo', severity: 'mild' },
  { value: 'varus', label: 'Varo', severity: 'mild' },
];

function getSeverityColor(severity: DeviationSeverity): string {
  switch (severity) {
    case 'normal':
      return 'bg-emerald-500 fill-emerald-500';
    case 'mild':
      return 'bg-amber-500 fill-amber-500';
    case 'severe':
      return 'bg-rose-500 fill-rose-500';
    default:
      return 'bg-slate-500 fill-slate-500';
  }
}

function mapLegacyPoint(
  data: DeviationStatus | string | AnatomicalPointStatus | undefined,
): AnatomicalPointStatus {
  if (!data) return { deviation: 'normal', severity: 'normal' };
  if (typeof data === 'string') return { deviation: data, severity: 'normal' };
  if ('severity' in data) return data as AnatomicalPointStatus;
  // It's DeviationStatus
  return { deviation: data.deviation, severity: 'normal' };
}

export function PosturogramViewer({
  clinicalCase,
  onPosturogramChange,
  initialPosturogramUrl = '/placeholder/posture-initial.png',
  currentPosturogramUrl = '/placeholder/posture-current.png',
}: PosturogramViewerProps) {
  const { toast } = useToast();
  const [activePoint, setActivePoint] = React.useState<AnatomicalPoint | null>(
    null,
  );

  // Initialize state from props, handling legacy flat structure migration
  const [posturogram, setPosturogram] = React.useState<Posturogram>(() => {
    const current = clinicalCase.evaluation.posturogram;

    // Check if we need to migrate from legacy flat structure to nested anteriorView
    if (!current.anteriorView && (current.head || current.shoulders)) {
      return {
        ...current,
        anteriorView: {
          head: mapLegacyPoint(current.head),
          shoulders: mapLegacyPoint(current.shoulders),
          spine: mapLegacyPoint(current.spine),
          pelvis: mapLegacyPoint(current.pelvis),
          knees: mapLegacyPoint(current.knees),
          feet: mapLegacyPoint(current.feet),
        },
      };
    }

    // Ensure anteriorView exists with defaults if completely empty
    if (!current.anteriorView) {
      return {
        ...current,
        anteriorView: {
          head: { deviation: 'normal', severity: 'normal' },
          shoulders: { deviation: 'normal', severity: 'normal' },
          spine: { deviation: 'normal', severity: 'normal' },
          pelvis: { deviation: 'normal', severity: 'normal' },
          knees: { deviation: 'normal', severity: 'normal' },
          feet: { deviation: 'normal', severity: 'normal' },
        },
      };
    }

    return current;
  });

  // Debounced save function
  const debouncedSavePosturogram = useDebounce(async (data: Posturogram) => {
    try {
      await patientsApi.updateEvaluation(clinicalCase.evaluation.id, {
        posturogram: data,
      });
      toast({
        title: 'Posturograma guardado',
        description: 'Los cambios se han guardado correctamente.',
      });
    } catch (error) {
      console.error('Failed to save posturogram:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el posturograma. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  }, 300);

  const handleDeviationChange = (
    point: AnatomicalPoint,
    field: 'deviation' | 'severity',
    value: string,
  ) => {
    const currentAnterior = posturogram.anteriorView || {};
    // Use type assertion or check for property existence if needed, but PosturalView keys match AnatomicalPoint
    const currentPointData = (currentAnterior[
      point as keyof PosturalView
    ] as AnatomicalPointStatus) || {
      deviation: 'normal',
      severity: 'normal',
    };

    const updatedPointData = {
      ...currentPointData,
      [field]: value,
    };

    // Auto-update severity based on deviation type if changing deviation
    if (field === 'deviation') {
      const option = DEVIATION_OPTIONS.find((o) => o.value === value);
      if (option) {
        updatedPointData.severity = option.severity;
      }
    }

    const updatedPosturogram = {
      ...posturogram,
      anteriorView: {
        ...currentAnterior,
        [point]: updatedPointData,
      },
    };

    setPosturogram(updatedPosturogram);
    onPosturogramChange?.(updatedPosturogram);
    debouncedSavePosturogram(updatedPosturogram);
  };

  const getPointStatus = (point: AnatomicalPoint) => {
    const anterior = posturogram.anteriorView || {};
    return (
      (anterior[point as keyof PosturalView] as AnatomicalPointStatus) || {
        deviation: 'normal',
        severity: 'normal',
      }
    );
  };

  const hasImages = initialPosturogramUrl && currentPosturogramUrl;

  if (!hasImages) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          No hay posturogramas disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
      {/* Background Comparison Slider */}
      <div className="absolute inset-0 z-0">
        <BeforeAfterSlider
          imageBefore={initialPosturogramUrl}
          imageAfter={currentPosturogramUrl}
          labelBefore="Antes"
          labelAfter="Después"
        />
      </div>

      {/* SVG Overlay for Markers */}
      <svg
        viewBox="0 0 200 450"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        preserveAspectRatio="none"
      >
        {/* Helper Silhouette (Optional - faint guide) */}
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
          className="fill-none stroke-white/30"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />

        {ANATOMICAL_POINTS.map((point) => {
          const status = getPointStatus(point.id);
          const isActive = activePoint === point.id;

          return (
            <foreignObject
              key={point.id}
              x={90} // Centered roughly at 100 - half width (20)
              y={point.cy - 10}
              width={20}
              height={20}
              className="overflow-visible pointer-events-auto"
            >
              <Popover
                open={isActive}
                onOpenChange={(open) => !open && setActivePoint(null)}
              >
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => setActivePoint(point.id)}
                          className={cn(
                            'w-5 h-5 rounded-full border-2 shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
                            getSeverityColor(status.severity),
                            isActive
                              ? 'ring-2 ring-white ring-offset-2 scale-110'
                              : 'border-white',
                          )}
                          aria-label={`${point.label}: ${status.deviation} (${status.severity})`}
                          aria-pressed={isActive}
                        />
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-semibold">{point.label}</p>
                      <p className="text-xs text-slate-500">
                        {status.deviation === 'normal'
                          ? 'Normal'
                          : status.deviation}
                        {' • '}
                        {status.severity === 'normal'
                          ? 'Normal'
                          : status.severity === 'mild'
                            ? 'Leve'
                            : 'Severo'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PopoverContent className="w-64 p-3" side="right" align="start">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm border-b pb-2 mb-2">
                      {point.label}
                    </h4>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        Desviación
                      </label>
                      <Select
                        value={status.deviation}
                        onValueChange={(val) =>
                          handleDeviationChange(point.id, 'deviation', val)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEVIATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        Severidad
                      </label>
                      <Select
                        value={status.severity}
                        onValueChange={(val) =>
                          handleDeviationChange(point.id, 'severity', val)
                        }
                        disabled={status.deviation === 'normal'}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Normal
                            </span>
                          </SelectItem>
                          <SelectItem value="mild">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Leve
                            </span>
                          </SelectItem>
                          <SelectItem value="severe">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Severo
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}
