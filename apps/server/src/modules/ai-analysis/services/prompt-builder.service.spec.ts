import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService', () => {
  let service: PromptBuilderService;

  beforeEach(() => {
    service = new PromptBuilderService();
  });

  describe('buildSystemPrompt', () => {
    it('should include Chain-of-Thought structure', () => {
      const prompt = service.buildSystemPrompt();

      expect(prompt).toContain('PASO 1');
      expect(prompt).toContain('PASO 2');
      expect(prompt).toContain('PASO 3');
      expect(prompt).toContain('COMPRENSIÓN');
      expect(prompt).toContain('LITERATURA');
      expect(prompt).toContain('SÍNTESIS');
    });

    it('should enforce Spanish output', () => {
      const prompt = service.buildSystemPrompt();

      expect(prompt).toContain('español');
      expect(prompt).toContain('JSON');
    });
  });

  describe('buildUserPrompt', () => {
    it('should inject anonymized case data', () => {
      const caseText = 'Paciente [PATIENT] con dolor lumbar';
      const ragChunks = [
        {
          content: 'Treatment for low back pain...',
          pageNumber: 42,
          documentTitle: 'Manual de Fisioterapia',
          documentAuthor: 'Dr. García',
          documentFilePath: '/path/to/file.pdf',
          documentMetadata: {},
          similarity: 0.95,
        },
      ];

      const prompt = service.buildUserPrompt(caseText, ragChunks);

      expect(prompt).toContain('[PATIENT]');
      expect(prompt).toContain('dolor lumbar');
    });

    it('should format RAG context correctly', () => {
      const caseText = 'Test case';
      const ragChunks = [
        {
          content: 'Medical content here',
          pageNumber: 1,
          documentTitle: 'Test Book',
          documentAuthor: 'Test Author',
          documentFilePath: '/path.pdf',
          documentMetadata: {},
          similarity: 0.9,
        },
      ];

      const prompt = service.buildUserPrompt(caseText, ragChunks);

      expect(prompt).toContain('Test Book');
      expect(prompt).toContain('Test Author');
      expect(prompt).toContain('90.0%');
    });

    it('should include therapist analysis when SOAP context is provided', () => {
      const prompt = service.buildUserPrompt('Caso clínico', [], [], [], {
        analysis: 'Sospecha de sobrecarga plantar con patrón mecánico.',
      });

      expect(prompt).toContain('Contexto SOAP Estructurado');
      expect(prompt).toContain('Análisis del Terapeuta');
    });
  });

  describe('query builders', () => {
    it('should build diagnosis query from case data', () => {
      const caseData = {
        consultationReason: 'Dolor plantar',
        initialMedicalDiagnosis: 'Fascitis plantar',
      };

      const query = service.buildDiagnosisQuery(caseData);

      expect(query).toContain('Dolor plantar');
      expect(query).toContain('Fascitis plantar');
    });

    it('should build diagnosis query from decomposed SOAP fields', () => {
      const query = service.buildDiagnosisQuery({
        soapDecomposition: {
          subjective: 'Dolor al primer apoyo matutino',
          objective: 'Sensibilidad en tubérculo medial del calcáneo',
          analysis: 'Compatible con fascitis plantar',
          plan: 'Manejo conservador',
        },
      });

      expect(query).toContain('síntomas subjetivos');
      expect(query).toContain('hallazgos objetivos');
      expect(query).toContain('análisis clínico');
      expect(query).toContain('plan terapéutico');
    });

    it('should format at most 5 RAG sources in context', () => {
      const chunks = Array.from({ length: 8 }, (_, index) => ({
        content: `contenido ${index}`,
        pageNumber: index + 1,
        documentTitle: `Doc ${index}`,
        documentAuthor: `Autor ${index}`,
        documentFilePath: `/doc-${index}.pdf`,
        documentMetadata: {},
        similarity: 0.9 - index * 0.01,
      }));

      const prompt = service.buildUserPrompt('Caso', chunks);

      expect(prompt).toContain('### Fuente 5');
      expect(prompt).not.toContain('### Fuente 6');
    });
  });
});
