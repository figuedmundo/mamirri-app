// =============================================================================
// Data Types
// =============================================================================

export interface PuntoAnatomico {
  x: number
  y: number
  desviacion: 'normal' | 'lateralizacion' | 'rotacion' | string
  rotacion: 'normal' | 'rotacion-externa' | 'rotacion-interna' | string
  lateralizacion: 'normal' | 'valgo' | 'varo' | 'plano' | string
}

export interface VistaAnterior {
  cabeza: PuntoAnatomico
  hombros: PuntoAnatomico
  columna: PuntoAnatomico
  pelvis: PuntoAnatomico
  rodillas: { izquierda: PuntoAnatomico; derecha: PuntoAnatomico }
  pies: { izquierdo: PuntoAnatomico; derecho: PuntoAnatomico }
}

export interface VistaPosterior {
  columna: PuntoAnatomico
  pelvis: PuntoAnatomico
  pies: { izquierdo: PuntoAnatomico; derecho: PuntoAnatomico }
}

export interface VistaLateral {
  cabeza: PuntoAnatomico
  hombros: PuntoAnatomico
  columna: PuntoAnatomico
  pelvis: PuntoAnatomico
  rodillas: PuntoAnatomico
  pies: PuntoAnatomico
}

export interface DesviacionDetectada {
  vista: string
  estructura: string
  tipo: string
  severidad: 'leve' | 'moderada' | 'severa'
  estado?: 'mejorada' | 'empeorada' | 'estable'
}

export interface Posturograma {
  vistaAnterior: VistaAnterior
  vistaPosterior: VistaPosterior
  vistaLateralDerecha: VistaLateral
  vistaLateralIzquierda: VistaLateral
  desviacionesDetectadas: DesviacionDetectada[]
}

export interface TestOrtopedico {
  resultado: number
  interpretacion: string
}

export interface TestsOrtopedicos {
  thomas: TestOrtopedico
  ely: TestOrtopedico
  ober: TestOrtopedico
  schober: TestOrtopedico
  ott: TestOrtopedico
}

export interface EscalaAVD {
  comer: number
  trasladarse: number
  aseoPersonal: number
  desplazarse: number
  escaleras: number
  vestirse: number
  total: number
  interpretacion: string
}

export interface EvaluacionAVD {
  barthel: EscalaAVD
  lawton: {
    preparacionComida: number
    cuidadoCasa: number
    lavadoRopa: number
    transporte: number
    medicacion: number
    total: number
    interpretacion: string
  }
}

export interface EscalaDolor {
  actividad: number
  reposo: number
  palpacion: number
  tipo: 'cronico' | 'agudo'
}

export interface Diagnostico {
  indicadorFuncional: string
  aspectoClinico: string
  anatomopatologia: string
  consecuenciasAVD: string
}

export interface ZonaSensible {
  zona: string
  intensidad: 'baja' | 'media' | 'alta' | 'muy-alta'
  color: string
}

export interface PresionMapa {
  talon: number
  medio: number
  antepie: number
  borde: number
}

export interface AnalisisHuella {
  arco: 'normal' | 'colapsado' | 'cavo'
  presionTalon: 'normal' | 'alta' | 'baja'
  presionAntepie: 'normal' | 'alta' | 'baja'
  desviacion: 'normal' | 'valgo' | 'varo'
  zonasSensibles: ZonaSensible[]
  presionMapa: PresionMapa
}

export interface ComparacionHuella {
  diferenciaArco: number
  mejoraDolor: string
  recuperacionROM: string
}

export interface Huella {
  id: string
  evaluacionId: string
  tipo: 'inicial' | 'final' | 'seguimiento'
  fecha: string
  lado: 'izquierdo' | 'derecho'
  url: string
  analisis: AnalisisHuella
  comparacion?: ComparacionHuella
}

export interface AnalisisBiomecanico {
  faseContacto: 'talon' | 'antepie' | 'medio' | 'no-aplicable'
  despeguePie: 'normal' | 'lento' | 'no-aplicable'
  aterrizaje: 'plano' | 'forzado-talonero' | 'no-aplicable'
  actitudAntalgica: 'ninguna' | 'compensatoria-lumbar' | 'compensatoria-pelvis' | 'compensatoria-tronco'
  genuFlexo?: number
  inclinacionTronco?: number
  ayudaMecanica: boolean
}

export interface VideoPostura {
  id: string
  evaluacionId: string
  tipo: 'caminata' | 'postura-estatica' | 'marcha'
  fecha: string
  url: string
  duracion: number
  fps?: number
  observaciones: string
  analisisBiomecanico: AnalisisBiomecanico
}

export interface Evaluacion {
  id: string
  casoClinicoId: string
  pacienteId: string
  pacienteNombre: string
  fecha: string
  tipoEvaluacion: 'inicial' | 'final' | 'seguimiento'
  evaluacionInicialId?: string
  posturograma: Posturograma
  testOrtopedicos: TestsOrtopedicos
  evaluacionAVD: EvaluacionAVD
  escalaDolor: EscalaDolor
  diagnostico: Diagnostico
  huellas: Huella[]
  videosPostura: VideoPostura[]
}

export interface TestComparativo {
  test: string
  valorInicial: number
  valorFinal: number
  unidad: string
  mejora: string
  estado: 'mejorado' | 'empeorado' | 'estable' | 'igual'
}

export interface DolorComparativo {
  actividad: { valorInicial: number; valorFinal: number; mejora: string }
  reposo: { valorInicial: number; valorFinal: number; mejora: string }
  palpacion: { valorInicial: number; valorFinal: number; mejora: string }
}

export interface DiagnosticoPeriodo {
  inicial: Diagnostico
  final: Diagnostico
}

export interface Evolucion {
  id: string
  pacienteId: string
  pacienteNombre: string
  casoClinicoId: string
  evaluacionInicialId: string
  evaluacionFinalId: string
  fechaInicio: string
  fechaFin: string
  testsComparativos: TestComparativo[]
  dolorComparativo: DolorComparativo
  diagnosticoComparativo: DiagnosticoPeriodo
  conclusion: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface AnalisisProps {
  /** The list of evaluaciones to display */
  evaluaciones: Evaluacion[]
  /** The evolution data for comparing initial vs final evaluations */
  evoluciones?: Evolucion[]
  /** Called when user wants to view an evaluación's details */
  onVerEvaluacion?: (id: string) => void
  /** Called when user wants to analyze a huella */
  onAnalizarHuella?: (id: string) => void
  /** Called when user wants to analyze a video */
  onAnalizarVideo?: (id: string) => void
  /** Called when user wants to view evolution */
  onVerEvolucion?: (id: string) => void
  /** Called when user wants to create a new evaluación */
  onCrearEvaluacion?: () => void
}
