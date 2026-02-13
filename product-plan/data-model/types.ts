// Core Entities for Mamirri App

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: Date;
  contacto?: {
    telefono?: string;
    email?: string;
  };
  foto?: string;
  casos: CasoClinico[];
}

export interface CasoClinico {
  id: string;
  pacienteId: string;
  diagnostico: string;
  fechaInicio: Date;
  estado: 'activo' | 'completado' | 'en_seguimiento';
  evaluacionInicial?: Evaluacion;
  planTratamiento?: PlanTratamiento;
  sesiones: SesionTratamiento[];
  plantillas?: Plantilla[];
}

export interface Evaluacion {
  id: string;
  casoId: string;
  fecha: Date;
  motivoConsulta?: string;
  antecedentesPatologicos?: string;
  examenes: ExamenFuncional[];
  huellas: Huella[];
  videosPostura: VideoPostura[];
  notas?: string;
}

export interface ExamenFuncional {
  id: string;
  evaluacionId: string;
  tipo: 'Thomas' | 'Ely' | 'Schober' | 'Dedo_Suelo' | 'Barthel' | 'Lawton';
  resultado: string | number;
  observaciones?: string;
}

export interface PlanTratamiento {
  id: string;
  casoId: string;
  objetivos: string[];
  modalidades: ('plantillas' | 'masajes' | 'ejercicios' | 'combinado')[];
  referenciasBibliograficas: ReferenciaBibliografica[];
  notas?: string;
}

export interface SesionTratamiento {
  id: string;
  casoId: string;
  fecha: Date;
  numeroSesion: number;
  nivelDolor?: number; // Escala END 0-10
  indiceBarthel?: number; // 0-100
  notasEvolucion?: string;
  procedimientosRealizados: string[];
}

export interface Huella {
  id: string;
  evaluacionId: string;
  pie: 'izquierdo' | 'derecho';
  imagenUrl: string;
  tipoBoveda?: 'plano' | 'cavo' | 'normal';
  zonasPresion?: PresionZona[];
  fechaCaptura: Date;
}

export interface PresionZona {
  zona: string;
  nivel: number; // 0-10
  tipo: 'alta' | 'media' | 'baja';
}

export interface VideoPostura {
  id: string;
  evaluacionId: string;
  tipo: 'marcha' | 'postura_estatica';
  vistas: VistaPostura[];
  videoUrl: string;
  duracion?: number;
  fechaCaptura: Date;
}

export interface VistaPostura {
  id: string;
  videoId: string;
  tipo: 'anterior' | 'posterior' | 'lateral_izquierda' | 'lateral_derecha';
  imagenUrl?: string;
  puntosAnatomicos?: PuntoAnatomico[];
}

export interface PuntoAnatomico {
  id: string;
  vistaId: string;
  nombre: string;
  posicion: { x: number; y: number };
}

export interface Plantilla {
  id: string;
  casoId: string;
  diseño: PlantillaDiseño;
  materiales: MaterialPlanta[];
  pdfUrl?: string;
  fechaCreacion: Date;
}

export interface PlantillaDiseño {
  alturaArco: number;
  inclinacionTalon: number;
  zonasAlivio: ZonaAlivio[];
}

export interface ZonaAlivio {
  ubicacion: { x: number; y: number };
  radio: number;
  nivel: number;
}

export interface MaterialPlanta {
  capa: 'base' | 'media' | 'cubierta';
  tipo: 'EVA_rigido' | 'EVA_medio' | 'EVA_suave';
  espesor?: number;
}

export interface ReferenciaBibliografica {
  id: string;
  planId: string;
  autor?: string;
  año?: number;
  titulo: string;
  fuente: string;
  url?: string;
  idiomaOriginal?: string;
}
