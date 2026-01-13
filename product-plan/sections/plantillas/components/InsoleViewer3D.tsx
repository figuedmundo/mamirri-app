import type { Plantilla } from '../types'

interface InsoleViewer3DProps {
  plantilla: Plantilla
  activeTool: 'select' | 'brush' | 'measure'
  onAddRelief: (x: number, y: number) => void
}

export function InsoleViewer3D({ plantilla, activeTool, onAddRelief }: InsoleViewer3DProps) {
  // Simulating 3D view with CSS perspective and an SVG representation.
  // Necessary comments explaining the visual layers of the CSS-based 3D simulation.
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'brush') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      onAddRelief(x, y)
    }
  }

  return (
    <div className="flex-1 bg-slate-100 dark:bg-black relative overflow-hidden flex items-center justify-center perspective-[1000px]">
      
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} 
      />

      {/* Simulated 3D Insole Container */}
      <div 
        className="relative w-[300px] h-[600px] transition-transform duration-500 ease-out preserve-3d cursor-crosshair group"
        onClick={handleCanvasClick}
        style={{ transform: `rotateX(40deg) rotateZ(0deg) translateY(-50px)` }}
      >
        {/* Base Layer Shadow */}
        <div className="absolute inset-0 rounded-[100px_100px_80px_80px] bg-slate-900/20 blur-xl translate-z-[-20px] scale-95" />

        {/* Main Insole Body */}
        <div className={`absolute inset-0 rounded-[100px_100px_80px_80px] bg-gradient-to-b from-teal-500 to-sky-600 shadow-2xl
                        border-4 border-white/10 overflow-hidden transition-all duration-300
                        ${activeTool === 'brush' ? 'cursor-none' : ''}`}
        >
          {/* Internal Texture/Contour Lines */}
          <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 11px)' 
             }} 
          />
          
          {/* Arch Bump Simulation */}
          <div 
            className="absolute right-0 top-[40%] w-[40%] h-[30%] bg-white/20 blur-2xl rounded-full"
            style={{ opacity: plantilla.parametros.alturaArco / 30 }}
          />
          
          {/* Metatarsal Bar Simulation */}
          {plantilla.parametros.barrametatarsal && (
             <div className="absolute left-[10%] top-[25%] w-[80%] h-[8%] bg-white/30 blur-md rounded-full" />
          )}

          {/* Relief Zones */}
          {plantilla.zonasAlivio.map((zona, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-rose-500/50 blur-md border border-rose-400/50"
              style={{
                left: `${zona.x}%`,
                top: `${zona.y}%`,
                width: `${zona.radio * 2}px`,
                height: `${zona.radio * 2}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

        </div>
        
        {/* Cursor Follower for Brush */}
        {activeTool === 'brush' && (
           <div className="absolute w-8 h-8 rounded-full border-2 border-rose-400 bg-rose-500/20 pointer-events-none z-50 hidden group-hover:block mix-blend-screen" />
        )}

      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-8 left-8 text-xs font-mono text-slate-400 bg-slate-900/50 p-3 rounded-lg backdrop-blur-sm border border-white/5">
        <div>ROTAR: Click izquierdo + Arrastrar</div>
        <div>ZOOM: Rueda del mouse</div>
        <div>ALIVIO: Click en el modelo</div>
      </div>

    </div>
  )
}
