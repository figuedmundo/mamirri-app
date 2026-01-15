// =============================================================================
// Data Types
// =============================================================================

export interface VoiceNote {
  id: string
  tipo: 'anamnesis' | 'evolucion' | 'nota-rapida'
  fecha: string
  urlAudio: string
  transcripcion: string
  duracionSegundos: number
}

export interface Posturograma {
  vistaAnterior?: VistaPostural
  vistaPosterior?: VistaPostural
  vistaSagitalLateral?: VistaPostural
  marcha?: string
  // Legacy fields for backward compatibility if needed, though structure suggests moving to View-based
  cabeza?: DesviacionStatus | string
  hombros?: DesviacionStatus | string
  columna?: DesviacionStatus | string
  pelvis?: DesviacionStatus | string
  rodillas?: DesviacionStatus | string
  pies?: DesviacionStatus | string
}

export interface VistaPostural {
  cabeza?: string
  hombros?: string
  trianguloDeTales?: string
  espinaIliaca?: string
  columnaCervical?: string
  columnaDorsal?: string
  columnaLumbar?: string
  rodillas?: string
  pies?: string
}

export interface DesviacionStatus {
  desviacion: string
  rotacion: string
  lateralizacion: string
}

export interface TestOrtopedicos {
  thomas: TestResultado
  ely: TestResultado
  ober: TestResultado
  schober: TestResultado
  ott?: TestResultado
  otto?: TestResultado // Alternative spelling from source
}

export interface TestResultado {
  resultado: number | string
  interpretacion: string
}

export interface EvaluacionAVD {
  barthel: BarthelScore
  lawton: LawtonScore
}

export interface BarthelScore {
  comer: number
  trasladarse: number
  aseoPersonal: number
  desplazarse: number
  escaleras: number
  vestirse: number
  total: number
  interpretacion: string
}

export interface LawtonScore {
  preparacionComida: number
  cuidadoCasa: number
  lavadoRopa: number
  transporte: number
  medicacion: number
  total: number
  interpretacion: string
}

export interface EscalaDolor {
  actividad: number
  reposo: number
  palpacion: number
  tipo: 'agudo' | 'cronico'
}

export interface Diagnostico {
  indicadorFuncional: string
  aspectoClinico: string
  anatomopatologia: string
  consecuenciasAVD: string
}

export interface Huella {
  id: string
  evaluacionId: string
  tipo: 'inicial' | 'final' | 'seguimiento'
  fecha: string
  url: string
  analisis?: HuellaAnalisis
  comparacion?: HuellaComparacion
}

export interface HuellaAnalisis {
  arco: string
  presionTalón: string
  presionAntepie: string
  desviacion: string
}

export interface HuellaComparacion {
  diferenciaArco: number
  mejoraDolor: string
  recuperacionROM: string
}

export interface VideoDePostura {
  id: string
  evaluacionId: string
  tipo: 'caminata' | 'postura-estatica' | 'postura-dinamica'
  fecha: string
  url: string
  duracion: number
  observaciones: string
}

export interface Evaluacion {
  id: string
  casoClinicoId: string
  fecha: string
  posturograma: Posturograma
  testOrtopedicos: TestOrtopedicos
  evaluacionAVD: EvaluacionAVD
  escalaDolor: EscalaDolor
  diagnostico: Diagnostico
  huellas: Huella[]
  videosPostura: VideoDePostura[]
  notasVoz?: VoiceNote[]
}

export interface FaseTratamiento {
  numero: number
  nombre: string
  duracionSemanas: number
  tecnicas: string[]
  objetivos: string
}

export interface ObjetivosTratamiento {
  terapeutico: string
  profilactico: string
  educativo: string
}

export interface Plantilla {
  id: string
  casoClinicoId: string
  tipo: 'plantilla-ortopédica' | 'tobillera' | 'otro'
  material: 'corcho' | 'neopreno' | 'eva' | 'otro'
  caracteristicas?: {
    realceInterno?: number
    soporteArco?: string
    talonera?: string
    alturaTotal?: number
    tipoFijacion?: string
    nivelInmovilizacion?: string
    altura?: number | string
  }
}

export interface PlanDeTratamiento {
  id: string
  casoClinicoId: string
  fechaCreacion: string
  objetivos: ObjetivosTratamiento
  fases: FaseTratamiento[]
  plantilla?: Plantilla | null
}

export interface SesionDeTratamiento {
  id: string
  casoClinicoId: string
  fecha: string
  faseNumero: number
  tecnicasAplicadas: string[]
  respuestaPaciente: string
  dolorFinal: number
  observaciones: string
  notasVoz?: VoiceNote[]
}

export interface CasoClinico {
  id: string
  pacienteId: string
  titulo: string
  estado: 'activo' | 'completado' | 'inactivo'
  fechaInicio: string
  fechaFin?: string
  motivoConsulta: string
  antecedentesPatologicos?: string[]
  antecedentesFarmacologicos?: string
  diagnosticoMedicoInicial?: string
  evaluacion: Evaluacion
  planDeTratamiento: PlanDeTratamiento
  sesionesTratamiento: SesionDeTratamiento[]
}

export interface Paciente {
  id: string
  nombre: string
  edad: number
  ocupacion: string
  ocupacionAnterior?: string
  direccion?: string
  genero?: string
  telefono: string
  email?: string
  fechaNacimiento: string
  activo: boolean
  fechaCreacion: string
  casosClinicos: CasoClinico[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface PacientesListProps {
  /** The list of patients to display */
  pacientes: Paciente[]

  /** Called when user wants to view a patient's details */
  onView?: (id: string) => void

  /** Called when user wants to create a new patient */
  onCreate?: () => void

  /** Called when user wants to edit a patient */
  onEdit?: (id: string) => void

  /** Called when user wants to delete a patient */
  onDelete?: (id: string) => void

  /** Called when user wants to schedule appointment in Google Calendar */
  onSchedule?: (pacienteId: string) => void
}

export interface PacienteProfileProps {
  /** The patient to display */
  paciente: Paciente

  /** Called when user wants to edit patient info */
  onEdit?: () => void

  /** Called when user wants to start voice dictation */
  onVoiceDictation?: () => void

  /** Called when user wants to capture footprint */
  onCaptureHuella?: () => void

  /** Called when user wants to capture posture video */
  onCaptureVideo?: () => void

  /** Called when user wants to schedule appointment in Google Calendar */
  onSchedule?: () => void
}

export interface EvaluacionFormProps {
  /** The clinical case being evaluated */
  casoClinico: CasoClinico

  /** Called when user wants to save the evaluation */
  onSave?: (evaluacion: Evaluacion) => void

  /** Called when user starts voice dictation */
  onVoiceDictation?: () => void

  /** Called when user marks deviation on posturograma */
  onPosturogramaChange?: (posturograma: Posturograma) => void

  /** Called when user updates pain scale */
  onPainScaleChange?: (escalaDolor: EscalaDolor) => void
}

export interface ComparacionProps {
  /** The clinical case with initial and final evaluations */
  casoClinico: CasoClinico

  /** Called when user wants to export comparison report */
  onExport?: () => void

  /** Called when user wants to share comparison with patient */
  onShare?: () => void
}

export interface CronogramaProps {
  /** The treatment sessions to display */
  sesiones: SesionDeTratamiento[]

  /** Called when user wants to view session details */
  onViewSession?: (id: string) => void

  /** Called when user wants to add a new session */
  onAddSession?: () => void

  /** Called when user wants to edit a session */
  onEditSession?: (id: string) => void
}
