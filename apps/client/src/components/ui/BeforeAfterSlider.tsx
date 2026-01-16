import { useState, useRef, useEffect, useCallback } from 'react';
import { Split } from 'lucide-react';

export interface BeforeAfterSliderProps {
  imageBefore: string;
  imageAfter: string;
  labelBefore?: string;
  labelAfter?: string;
  onSliderChange?: (position: number) => void;
}

export function BeforeAfterSlider({
  imageBefore,
  imageAfter,
  labelBefore,
  labelAfter,
  onSliderChange,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const isAtExtremes = sliderPosition <= 5 || sliderPosition >= 95;

  const handleDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

      const position = ((clientX - rect.left) / rect.width) * 100;
      const clampedPosition = Math.min(100, Math.max(0, position));

      setSliderPosition(clampedPosition);
      onSliderChange?.(clampedPosition);
    },
    [onSliderChange],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleDrag(e);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        handleDrag(e);
      }
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchend', handleUp);
    };
  }, [handleDrag]);

  const handleStart = () => {
    isDragging.current = true;
  };

  // Wrapper to handle React synthetic events
  const onInteractionStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    handleStart();
    // We can call handleDrag here if we want immediate jump, but we need to convert event.
    // Since useEffect handles global move, clicking also triggers mouseDown then usually mouseMove if slight movement?
    // Or we can just let it be. But usually sliders jump on click.
    // Let's keep it simple: drag starts on down.
    // If we want jump on click, we need to pass native event.
    handleDrag(e.nativeEvent);
  };

  return (
    <div
      ref={sliderRef}
      role="slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onMouseDown={onInteractionStart}
      onTouchStart={onInteractionStart}
      className="w-full aspect-[4/3] relative rounded-xl overflow-hidden cursor-ew-resize select-none group border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
      style={{ touchAction: 'none' } as React.CSSProperties}
    >
      <img
        src={imageAfter}
        alt={labelAfter}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {labelAfter && (
        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          {labelAfter}
        </div>
      )}

      <div
        className="absolute inset-0 overflow-hidden border-r-2 border-white/50"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={imageBefore}
          alt={labelBefore}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: '100vw' }}
        />
        {labelBefore && (
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
            {labelBefore}
          </div>
        )}
      </div>

      <div
        className={`absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-xl z-10 ${
          isAtExtremes ? 'animate-pulse' : ''
        }`}
        style={{ left: `${sliderPosition}%` }}
        data-testid="slider-handle"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center border-2 border-white/90 hover:scale-110 transition-transform cursor-ew-resize">
          <Split size={20} className="rotate-90 text-slate-600" />
        </div>
      </div>
    </div>
  );
}
