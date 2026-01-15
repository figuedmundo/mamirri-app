import { MousePointer2, Brush, Ruler, Download, LogOut } from 'lucide-react'
import { clsx } from 'clsx'

interface ToolbarProps {
  activeTool: 'select' | 'brush' | 'measure'
  onSelectTool: (tool: 'select' | 'brush' | 'measure') => void
  onExport: () => void
  onExit: () => void
}

export function Toolbar({ activeTool, onSelectTool, onExport, onExit }: ToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
    { id: 'brush', icon: Brush, label: 'Alivio' },
    { id: 'measure', icon: Ruler, label: 'Medir' },
  ] as const

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 flex gap-1 z-30">
      
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={clsx(
            "p-2.5 rounded-full transition-all duration-200 group relative",
            activeTool === tool.id 
              ? "bg-teal-500 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          )}
          title={tool.label}
        >
          <tool.icon size={20} strokeWidth={2} />
        </button>
      ))}

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />

      <button
        onClick={onExport}
        className="p-2.5 rounded-full text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/30 transition-colors"
        title="Exportar PDF"
      >
        <Download size={20} strokeWidth={2} />
      </button>

       <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />

      <button
        onClick={onExit}
        className="p-2.5 rounded-full text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors"
        title="Salir del editor"
      >
        <LogOut size={20} strokeWidth={2} />
      </button>

    </div>
  )
}
