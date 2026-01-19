import { cn } from '@/lib/utils';
import type { PostureView } from '@/types/patient';

interface PostureOverlayProps {
  view: PostureView;
  className?: string;
}

export function PostureOverlay({ view, className }: PostureOverlayProps) {
  const getPathForView = (v: PostureView) => {
    switch (v) {
      case 'posture-anterior':
      case 'posture-posterior':
        return 'M100 30 C115 30 125 40 125 55 C125 70 115 80 100 80 C85 80 75 70 75 55 C75 40 85 30 100 30 M80 85 L120 85 M100 85 L100 200 M100 120 L60 170 L50 200 M100 120 L140 170 L150 200 M100 200 L70 350 L60 420 M100 200 L130 350 L140 420';
      case 'posture-lateral-left':
        return 'M100 30 C110 30 115 40 115 55 C115 70 110 80 100 80 C90 80 85 70 85 55 C85 40 90 30 100 30 M100 85 L100 200 M100 120 L110 170 L115 200 M100 200 L110 350 L120 420 M100 200 L90 350 L80 420';
      case 'posture-lateral-right':
        return 'M100 30 C110 30 115 40 115 55 C115 70 110 80 100 80 C90 80 85 70 85 55 C85 40 90 30 100 30 M100 85 L100 200 M100 120 L90 170 L85 200 M100 200 L90 350 L80 420 M100 200 L110 350 L120 420';
      case 'footprint-left':
        // Left foot (plantar view): Big toe on right side
        return 'M110 70 C130 70 140 90 140 120 L135 300 C135 360 110 390 100 390 C90 390 65 360 65 300 L70 150 C70 100 80 70 110 70 M130 75 C135 75 140 80 140 90';
      case 'footprint-right':
        // Right foot (plantar view): Big toe on left side
        return 'M90 70 C70 70 60 90 60 120 L65 300 C65 360 90 390 100 390 C110 390 135 360 135 300 L130 150 C130 100 120 70 90 70 M70 75 C65 75 60 80 60 90';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none flex items-center justify-center opacity-50',
        className,
      )}
    >
      <svg
        viewBox="0 0 200 450"
        className="w-full h-full max-h-[90%]"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={getPathForView(view)}
          className="fill-none stroke-white stroke-[3] drop-shadow-md"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
