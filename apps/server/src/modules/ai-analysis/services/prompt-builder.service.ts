import { Injectable } from '@nestjs/common';
import {
  AI_ANALYSIS_SYSTEM_PROMPT,
  buildUserPrompt,
} from '../constants/system-prompts';
import { RagChunk } from '../interfaces/analysis.interfaces';
import { VisionFinding, VoiceNote } from '../interfaces/aggregation.interfaces';

@Injectable()
export class PromptBuilderService {
  buildSystemPrompt(): string {
    return AI_ANALYSIS_SYSTEM_PROMPT;
  }

  buildUserPrompt(
    anonymizedCaseText: string,
    ragChunks: RagChunk[],
    visionFindings?: VisionFinding[],
    voiceTranscripts?: VoiceNote[],
  ): string {
    const ragContext = this.formatRagContext(ragChunks);

    let expandedCaseText = anonymizedCaseText;

    if (visionFindings && visionFindings.length > 0) {
      const visionContext = this.buildVisionContext(visionFindings);
      expandedCaseText += `\n\n### Hallazgos Visuales (IA)\n${visionContext}`;
    }

    if (voiceTranscripts && voiceTranscripts.length > 0) {
      const voiceContext = this.buildVoiceContext(voiceTranscripts);
      expandedCaseText += `\n\n### Transcripciones de Voz (Contexto Adicional)\n${voiceContext}`;
    }

    return buildUserPrompt(expandedCaseText, ragContext);
  }

  buildVisionContext(visionFindings: VisionFinding[]): string {
    return visionFindings
      .map((finding) => {
        return `- **${finding.source}** (${finding.date.toISOString().split('T')[0]}): ${finding.findings}`;
      })
      .join('\n');
  }

  buildVoiceContext(voiceTranscripts: VoiceNote[]): string {
    return voiceTranscripts
      .map((note) => {
        return `> **${note.source}** (${note.date.toISOString().split('T')[0]}): "${note.transcript}"`;
      })
      .join('\n\n');
  }

  private formatRagContext(chunks: RagChunk[]): string {
    if (!chunks || chunks.length === 0) {
      return 'No se encontró literatura médica relevante.';
    }

    const formattedChunks = chunks.map((chunk, index) => {
      return `### Fuente ${index + 1}
**Documento:** ${chunk.documentTitle}
**Autor:** ${chunk.documentAuthor}
**Relevancia:** ${(chunk.similarity * 100).toFixed(1)}%

${chunk.content}

---`;
    });

    return formattedChunks.join('\n\n');
  }

  buildDiagnosisQuery(caseData: {
    consultationReason?: string;
    initialMedicalDiagnosis?: string;
    evaluations?: Array<{ diagnosis?: Record<string, unknown> }>;
  }): string {
    const parts: string[] = [];

    if (caseData.consultationReason) {
      parts.push(caseData.consultationReason);
    }

    if (caseData.initialMedicalDiagnosis) {
      parts.push(caseData.initialMedicalDiagnosis);
    }

    if (caseData.evaluations && caseData.evaluations.length > 0) {
      const latestEval = caseData.evaluations[caseData.evaluations.length - 1];
      if (latestEval.diagnosis) {
        parts.push(JSON.stringify(latestEval.diagnosis));
      }
    }

    return parts.join(' ').slice(0, 500);
  }

  buildTreatmentQuery(caseData: {
    consultationReason?: string;
    initialMedicalDiagnosis?: string;
  }): string {
    const parts: string[] = ['tratamiento fisioterapia'];

    if (caseData.initialMedicalDiagnosis) {
      parts.push(caseData.initialMedicalDiagnosis);
    } else if (caseData.consultationReason) {
      parts.push(caseData.consultationReason);
    }

    return parts.join(' ').slice(0, 500);
  }

  buildContraindicationsQuery(pharmacologicalHistory?: string): string {
    if (!pharmacologicalHistory) {
      return 'contraindicaciones fisioterapia medicamentos';
    }

    return `contraindicaciones ${pharmacologicalHistory}`.slice(0, 500);
  }

  /**
   * Builds a HyDE (Hypothetical Document Embeddings) prompt for diagnosis
   * This generates a synthetic document that would ideally contain the information we're searching for
   *
   * @param symptoms - Patient symptoms and clinical presentation
   * @returns A prompt that asks the LLM to generate clinical descriptions and differential diagnoses
   */
  buildHydeDiagnosisPrompt(symptoms: string): string {
    return `Basado en los siguientes síntomas, genera un documento médico hipotético que describa en detalle:

Síntomas del paciente: ${symptoms}

Por favor, genera un texto que incluya:
1. **Clinical Descriptions**: Descripciones clínicas detalladas de las posibles condiciones basadas en los síntomas
2. **Differential Diagnoses**: Diagnósticos diferenciales considerados con sus características distintivas
3. **Etiología y patogénesis**: Posibles causas y mecanismos de desarrollo
4. **Manifestaciones clínicas**: Signos y síntomas típicos asociados

El documento debe ser técnico, profesional y basarse en evidencia médica actual. No te limites a una única condición; explora múltiples posibilidades diagnósticas.`;
  }

  /**
   * Builds a HyDE (Hypothetical Document Embeddings) prompt for treatment
   * This generates a synthetic document that would ideally contain treatment information
   *
   * @param condition - The medical condition or diagnosis
   * @returns A prompt that asks the LLM to generate clinical treatment descriptions
   */
  buildHydeTreatmentPrompt(condition: string): string {
    return `Basado en la siguiente condición médica, genera un documento médico hipotético que describa en detalle:

Condición: ${condition}

Por favor, genera un texto que incluya:
1. **Clinical Descriptions**: Descripciones clínicas del tratamiento fisioterapéutico recomendado
2. **Estrategias de tratamiento**: Enfoques terapéuticos y sus fundamentos fisiopatológicos
3. **Técnicas específicas**: Modalidades de intervención y su aplicación práctica
4. **Evidencia científica**: Apoyo de la literatura científica para las intervenciones recomendadas

El documento debe ser técnico, profesional y basarse en evidencia médica actual. Describe un abordaje completo de fisioterapia para esta condición.`;
  }
}
