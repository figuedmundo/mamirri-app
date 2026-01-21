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
        // Improved foot shape
        return 'M95 400 C70 400 65 350 65 300 C65 220 50 150 55 100 C58 70 70 50 85 50 C92 50 98 55 100 65 C102 55 110 50 120 50 C140 50 150 80 145 120 C140 180 135 250 135 300 C135 350 125 400 95 400';
      case 'footprint-right':
        // Right foot (plantar view): Big toe on left side
        // Improved foot shape
        return 'M105 400 C130 400 135 350 135 300 C135 220 150 150 145 100 C142 70 130 50 115 50 C108 50 102 55 100 65 C98 55 90 50 80 50 C60 50 50 80 55 120 C60 180 65 250 65 300 C65 350 75 400 105 400';
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
