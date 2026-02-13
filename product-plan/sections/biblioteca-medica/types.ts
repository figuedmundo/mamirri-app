// =============================================================================
// Data Types
// =============================================================================

export interface CategoriaClinica {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
}

export interface ReferenciaBibliografica {
  id: string;
  autor: string;
  anio: number;
  titulo: string;
  fuente: string;
  idiomaOriginal: 'es' | 'en' | 'fr' | 'de';
  resumenEs: string;
  textoOriginal?: string | null;
}

export interface Protocolo {
  id: string;
  titulo: string;
  categoriaId: string;
  referenciaIds: string[];
  definicion: string;
  justificacion: string;
  procedimiento: string[];
  tags: string[];
}

export interface DiagramaAnatomico {
  id: string;
  titulo: string;
  url: string;
  descripcion: string;
}

// =============================================================================
// Component Props
// =============================================================================

export interface BibliotecaMedicaProps {
  /** List of clinical categories for navigation */
  categorias: CategoriaClinica[];

  /** List of available protocols and techniques */
  protocolos: Protocolo[];

  /** List of bibliographic references */
  referencias: ReferenciaBibliografica[];

  /** List of anatomical diagrams */
  diagramas: DiagramaAnatomico[];

  /** Called when user searches with a query */
  onSearch: (query: string) => void;

  /** Called when user selects a category to filter */
  onSelectCategory: (categoryId: string) => void;

  /** Called when user selects a specific protocol to view details */
  onSelectProtocol: (protocolId: string) => void;

  /** Called when user toggles the language of a reference (EN/ES) */
  onToggleLanguage: (referenciaId: string) => void;
}
