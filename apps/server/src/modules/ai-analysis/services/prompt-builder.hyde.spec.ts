import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService - HyDE Methods', () => {
  let service: PromptBuilderService;

  beforeEach(() => {
    service = new PromptBuilderService();
  });

  describe('buildHydeDiagnosisPrompt', () => {
    it('should include the provided symptoms in the prompt', () => {
      const symptoms = 'Dolor plantar persistente en primeros pasos';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain(symptoms);
    });

    it('should explicitly ask for Clinical Descriptions', () => {
      const symptoms = 'Dolor de rodilla';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain('Clinical Descriptions');
      expect(prompt).toContain('Descripciones clínicas');
    });

    it('should explicitly ask for Differential Diagnoses', () => {
      const symptoms = 'Dolor lumbar';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain('Differential Diagnoses');
      expect(prompt).toContain('Diagnósticos diferenciales');
    });

    it('should include etiology and pathogenesis section', () => {
      const symptoms = 'Parestesia en mano';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain('Etiología y patogénesis');
      expect(prompt).toContain('causas');
    });

    it('should include clinical manifestations section', () => {
      const symptoms = 'Cefalea occipital';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain('Manifestaciones clínicas');
      expect(prompt).toContain('Signos y síntomas');
    });

    it('should request technical and evidence-based content', () => {
      const symptoms = 'Limitación de movilidad en hombro';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain('técnico');
      expect(prompt).toContain('profesional');
      expect(prompt).toContain('evidencia médica actual');
    });

    it('should encourage exploring multiple diagnostic possibilities', () => {
      const symptoms = 'Dolor cervical';
      const prompt = service.buildHydeDiagnosisPrompt(symptoms);

      expect(prompt).toContain('No te limites a una única condición');
      expect(prompt).toContain('múltiples posibilidades diagnósticas');
    });
  });

  describe('buildHydeTreatmentPrompt', () => {
    it('should include the provided condition in the prompt', () => {
      const condition = 'Fascitis plantar';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain(condition);
    });

    it('should explicitly ask for Clinical Descriptions', () => {
      const condition = 'Tendinitis de Aquiles';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain('Clinical Descriptions');
      expect(prompt).toContain('Descripciones clínicas');
    });

    it('should include treatment strategies section', () => {
      const condition = 'Síndrome del túnel carpiano';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain('Estrategias de tratamiento');
      expect(prompt).toContain('Enfoques terapéuticos');
    });

    it('should include specific techniques section', () => {
      const condition = 'Hombro congelado';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain('Técnicas específicas');
      expect(prompt).toContain('Modalidades de intervención');
    });

    it('should include scientific evidence section', () => {
      const condition = 'Dolor lumbar crónico';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain('Evidencia científica');
      expect(prompt).toContain('literatura científica');
    });

    it('should request technical and evidence-based content', () => {
      const condition = 'Lesión de menisco';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain('técnico');
      expect(prompt).toContain('profesional');
      expect(prompt).toContain('evidencia médica actual');
    });

    it('should specify physiotherapy approach', () => {
      const condition = 'Escoliosis';
      const prompt = service.buildHydeTreatmentPrompt(condition);

      expect(prompt).toContain('tratamiento fisioterapéutico');
      expect(prompt).toContain('fisioterapia');
    });
  });
});
