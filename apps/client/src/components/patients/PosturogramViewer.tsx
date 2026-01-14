import { useState } from 'react'
import { Split } from 'lucide-react'

interface PosturogramViewerProps {
  imageBefore: string
  imageAfter: string
  labelBefore?: string
  labelAfter?: string
}

export function PosturogramViewer({ 
  imageBefore, 
  imageAfter,
  labelBefore = "Antes",
  labelAfter = "Después"
}: PosturogramViewerProps) {
  const [sliderPosition, setSliderPosition] = useState(50)

  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    
    // Calculate percentage, clamped between 0 and 100
    const position = ((clientX - rect.left) / rect.width) * 100
    setSliderPosition(Math.min(100, Math.max(0, position)))
  }

  return (
    <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden cursor-ew-resize select-none group border border-slate-200 dark:border-slate-700"
         onMouseMove={handleDrag}
         onTouchMove={handleDrag}
    >
      
      {/* Background Image (After) */}
      <img 
        src={imageAfter} 
        alt="Posturogram After" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
        {labelAfter}
      </div>

      {/* Foreground Image (Before) - Clipped */}
      <div 
        className="absolute inset-0 overflow-hidden border-r-2 border-white/50"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={imageBefore} 
          alt="Posturogram Before" 
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          // We need to set width to the parent container's width to prevent scaling distortion
          // In a real implementation, we'd use a ref to get the container width. 
          // For now, object-cover handles alignment reasonably well if aspect ratios match.
          style={{ width: '100vw' }} 
        />
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          {labelBefore}
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400">
          <Split size={16} className="rotate-90" />
        </div>
      </div>

    </div>
  )
}
