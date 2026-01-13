import type { PlantillasEditorProps, Plantilla, ZonaAlivio } from '../types'
import { PropertiesPanel } from './PropertiesPanel'
import { ClinicalSidePanel } from './ClinicalSidePanel'
import { Toolbar } from './Toolbar'
import { InsoleViewer3D } from './InsoleViewer3D'
import { useState } from 'react'

interface ExtendedEditorProps extends PlantillasEditorProps {
  onExit?: () => void
}

export function PlantillasEditor({
  caso,
  plantilla: initialPlantilla,
  materiales,
  onUpdateParameter,
  onUpdateLayer,
  onUpdateReliefZone,
  onExport,
  onExit
}: ExtendedEditorProps) {
  const [activeTool, setActiveTool] = useState<'select' | 'brush' | 'measure'>('select')
  const [plantilla, setPlantilla] = useState<Plantilla>(initialPlantilla)

  const handleParamUpdate = (param: keyof Plantilla['parametros'], value: number | boolean) => {
    setPlantilla(prev => ({
      ...prev,
      parametros: { ...prev.parametros, [param]: value }
    }))
    onUpdateParameter(param, value)
  }

  const handleReliefAdd = (x: number, y: number) => {
    const newZone: ZonaAlivio = { x, y, radio: 20, intensidad: 1 }
    setPlantilla(prev => ({
      ...prev,
      zonasAlivio: [...prev.zonasAlivio, newZone]
    }))
    onUpdateReliefZone(newZone)
  }

  const handleExit = () => {
    if (onExit) {
      onExit()
    } else {
      console.log('Exiting editor...')
    }
  }

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans text-slate-200">
      
      <PropertiesPanel 
        plantilla={plantilla}
        materiales={materiales}
        onUpdateParameter={handleParamUpdate}
        onUpdateLayer={onUpdateLayer}
      />

      <div className="flex-1 relative flex flex-col">
        <Toolbar 
          activeTool={activeTool} 
          onSelectTool={setActiveTool} 
          onExport={onExport}
          onExit={handleExit}
        />
        
        <InsoleViewer3D 
          plantilla={plantilla}
          activeTool={activeTool}
          onAddRelief={handleReliefAdd}
        />
      </div>

      <ClinicalSidePanel caso={caso} />

    </div>
  )
}
