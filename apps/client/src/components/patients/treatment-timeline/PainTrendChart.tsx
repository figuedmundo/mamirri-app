import type { TreatmentSession } from '../../../types/patient';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PainTrendChartProps {
  sessions: TreatmentSession[];
  maxSessions?: number;
  height?: number;
}

function getPainColor(level: number): string {
  if (level <= 3) return '#10b981';
  if (level <= 6) return '#f59e0b';
  return '#ef4444';
}

export function PainTrendChart({
  sessions,
  maxSessions = 5,
  height = 40,
}: PainTrendChartProps) {
  const sortedSessions = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-maxSessions);

  if (sortedSessions.length < 2) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Tendencia no disponible</span>
        <span className="text-xs">(mínimo 2 sesiones)</span>
      </div>
    );
  }

  const painLevels = sortedSessions.map((s) => s.finalPainLevel);
  const firstLevel = painLevels[0];
  const lastLevel = painLevels[painLevels.length - 1];
  const avgLevel =
    painLevels.reduce((sum, l) => sum + l, 0) / painLevels.length;

  const trend =
    lastLevel < firstLevel
      ? 'improving'
      : lastLevel > firstLevel
        ? 'worsening'
        : 'stable';

  const width = 120;
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const minPain = 0;
  const maxPain = 10;
  const xStep = chartWidth / (painLevels.length - 1);

  const points = painLevels.map((level, i) => {
    const x = padding + i * xStep;
    const y =
      padding + chartHeight - (level / (maxPain - minPain)) * chartHeight;
    return { x, y, level };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="flex items-center gap-3">
      <svg
        width={width}
        height={height}
        className="flex-shrink-0"
        role="img"
        aria-label={`Tendencia de dolor: ${trend === 'improving' ? 'mejorando' : trend === 'worsening' ? 'empeorando' : 'estable'}`}
      >
        <defs>
          <linearGradient id="pain-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill="url(#pain-gradient)"
          rx={4}
        />

        <path
          d={pathD}
          fill="none"
          stroke="#64748b"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={getPainColor(p.level)}
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>

      <div className="flex flex-col">
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend === 'improving' && 'text-emerald-600 dark:text-emerald-400',
            trend === 'worsening' && 'text-red-600 dark:text-red-400',
            trend === 'stable' && 'text-amber-600 dark:text-amber-400',
          )}
        >
          {trend === 'improving' && <TrendingDown className="w-4 h-4" />}
          {trend === 'worsening' && <TrendingUp className="w-4 h-4" />}
          {trend === 'stable' && <Minus className="w-4 h-4" />}
          <span>
            {trend === 'improving'
              ? 'Mejorando'
              : trend === 'worsening'
                ? 'Empeorando'
                : 'Estable'}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Promedio: {avgLevel.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
