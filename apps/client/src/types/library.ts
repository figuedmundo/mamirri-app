export interface ClinicalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string;
}

export interface BibliographicReference {
  id: string;
  author: string;
  year: number;
  title: string;
  source: string;
  originalLanguage: string;
  summaryEs: string;
  originalText?: string | null;
  url?: string | null;
  createdAt: string;
}

export interface ProtocolReference {
  protocolId: string;
  referenceId: string;
  reference: BibliographicReference;
}

export interface Protocol {
  id: string;
  title: string;
  categoryId: string;
  definition: string;
  rationale: string;
  procedure: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  documentId?: string | null;
  category: ClinicalCategory;
  references: ProtocolReference[];
}

export interface SearchResult {
  protocols: Protocol[];
  ragResults: RagResult[];
}

export interface RagResult {
  id: string;
  content: string;
  parentContent?: string;
  pageNumber: number;
  documentTitle: string;
  documentAuthor: string;
  similarity?: number;
  rerankScore?: number;
}

export interface TreatmentPlanProtocol {
  treatmentPlanId: string;
  protocolId: string;
  addedAt: string;
  notes?: string | null;
  protocol: Protocol;
}
