// =============================================================================
// Data Types
// =============================================================================

export interface Material {
  id: string;
  nombre: string;
  tipo: 'Base' | 'Estructura' | 'Amortiguación' | 'Forro';
  color: string;
  descripcion: string;
}

export interface HallazgoEvaluacion {
  id: string;
  descripcion: string;
  severidad?: 'leve' | 'moderada' | 'severa';
}

export interface Evaluacion {
  id: string;
  hallazgos: string[];
  posturogramaUrl: string;
  huellaUrl: string;
}

export interface CasoClinico {
  id: string;
  paciente: string;
  edad: number;
  diagnostico: string;
  evaluacion: Evaluacion;
}

export interface ZonaAlivio {
  x: number;
  y: number;
  radio: number;
  intensidad: number; // 0 to 1
  nota?: string;
}

export interface CapaPlantilla {
  tipo: 'base' | 'estructura' | 'amortiguacion' | 'forro';
  materialId: string;
  espesor: number; // mm
}

export interface Plantilla {
  id: string;
  casoId: string;
  estado: 'draft' | 'finalized' | 'exported';
  parametros: {
    alturaArco: number; // mm
    cuñaTalon: number; // degrees
    barrametatarsal: boolean;
    elevacionTalon: number; // mm
  };
  zonasAlivio: ZonaAlivio[];
  capas: CapaPlantilla[];
}

// =============================================================================
// Component Props
// =============================================================================

export interface PlantillasEditorProps {
  /** The current clinical case context */
  caso: CasoClinico;

  /** The insole design being edited */
  plantilla: Plantilla;

  /** Catalog of available materials */
  materiales: Material[];

  /** Called when structural parameters change (slider interactions) */
  onUpdateParameter: (
    param: keyof Plantilla['parametros'],
    value: number | boolean,
  ) => void;

  /** Called when a relief zone is added or modified (brush interaction) */
  onUpdateReliefZone: (zona: ZonaAlivio) => void;

  /** Called when a material layer is changed */
  onUpdateLayer: (index: number, materialId: string) => void;

  /** Called when the user wants to export the design */
  onExport: () => void;

  /** Called when toggling views (3D, 2D, Split) */
  onViewChange?: (view: '3d' | 'split' | 'analysis') => void;
}
