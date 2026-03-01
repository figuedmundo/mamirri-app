import { Injectable } from '@nestjs/common';
import {
  AI_ANALYSIS_SYSTEM_PROMPT,
  buildUserPrompt,
} from '../constants/system-prompts';
import { RagChunk } from '../interfaces/analysis.interfaces';
import { SoapDecomposition } from '../interfaces/aggregation.interfaces';
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
    soapDecomposition?: SoapDecomposition,
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

    if (soapDecomposition) {
      const soapContext = this.buildSoapContext(soapDecomposition);
      if (soapContext) {
        expandedCaseText += `\n\n### Contexto SOAP Estructurado\n${soapContext}`;
      }
    }

    return buildUserPrompt(expandedCaseText, ragContext);
  }

  buildSoapContext(soap: SoapDecomposition): string {
    const sections: string[] = [];

    if (soap.subjective) {
      sections.push(`- **Subjetivo:** ${soap.subjective}`);
    }

    if (soap.objective) {
      sections.push(`- **Objetivo:** ${soap.objective}`);
    }

    if (soap.analysis) {
      sections.push(`- **Análisis del Terapeuta:** ${soap.analysis}`);
    }

    if (soap.plan) {
      sections.push(`- **Plan:** ${soap.plan}`);
    }

    return sections.join('\n');
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

    const optimizedChunks = this.optimizeChunksForContext(chunks);

    const formattedChunks = optimizedChunks.map((chunk, index) => {
      const section =
        typeof chunk.documentMetadata?.section === 'string'
          ? chunk.documentMetadata.section
          : null;
      const pageInfo = chunk.pageNumber
        ? `\n**Página:** ${chunk.pageNumber}`
        : '';
      const sectionInfo = section ? `\n**Sección:** ${section}` : '';
      return `### Fuente ${index + 1}
**Documento:** ${chunk.documentTitle}
**Autor:** ${chunk.documentAuthor}${pageInfo}${sectionInfo}
**Relevancia:** ${(chunk.similarity * 100).toFixed(1)}%

${chunk.content}

---`;
    });

    return formattedChunks.join('\n\n');
  }

  private optimizeChunksForContext(chunks: RagChunk[]): RagChunk[] {
    const ranked = [...chunks]
      .sort(
        (a, b) =>
          (b.relevanceScore ?? b.similarity) -
          (a.relevanceScore ?? a.similarity),
      )
      .slice(0, 5);

    if (ranked.length <= 2) {
      return ranked;
    }

    const first = ranked[0];
    const last = ranked[1];
    const middle = ranked.slice(2);

    return [first, ...middle, last];
  }

  buildDiagnosisQuery(caseData: {
    consultationReason?: string;
    initialMedicalDiagnosis?: string;
    evaluations?: Array<{ diagnosis?: Record<string, unknown> }>;
    soapDecomposition?: SoapDecomposition;
  }): string {
    const parts: string[] = [];

    if (caseData.consultationReason) {
      parts.push(caseData.consultationReason);
    }

    if (caseData.initialMedicalDiagnosis) {
      parts.push(caseData.initialMedicalDiagnosis);
    }

    if (caseData.soapDecomposition) {
      const soap = caseData.soapDecomposition;
      if (soap.subjective) {
        parts.push(`síntomas subjetivos ${soap.subjective}`);
      }
      if (soap.objective) {
        parts.push(`hallazgos objetivos ${soap.objective}`);
      }
      if (soap.analysis) {
        parts.push(`análisis clínico ${soap.analysis}`);
      }
      if (soap.plan) {
        parts.push(`plan terapéutico ${soap.plan}`);
      }
    }

    if (
      parts.length === 0 &&
      caseData.evaluations &&
      caseData.evaluations.length > 0
    ) {
      const latestEval = caseData.evaluations[0];
      if (latestEval.diagnosis && typeof latestEval.diagnosis === 'object') {
        for (const [key, value] of Object.entries(latestEval.diagnosis)) {
          if (typeof value === 'string' && value.trim()) {
            parts.push(`${key} ${value}`);
          }
        }
      }
    }

    return parts.join(' ').slice(0, 500);
  }

  buildTreatmentQuery(caseData: {
    consultationReason?: string;
    initialMedicalDiagnosis?: string;
    soapDecomposition?: SoapDecomposition;
  }): string {
    const parts: string[] = ['tratamiento fisioterapia'];

    if (caseData.initialMedicalDiagnosis) {
      parts.push(caseData.initialMedicalDiagnosis);
    } else if (caseData.consultationReason) {
      parts.push(caseData.consultationReason);
    }

    if (caseData.soapDecomposition?.plan) {
      parts.push(`plan propuesto ${caseData.soapDecomposition.plan}`);
    }

    if (caseData.soapDecomposition?.analysis) {
      parts.push(`análisis clínico ${caseData.soapDecomposition.analysis}`);
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
    return `Basado en los siguientes síntomas del paciente (proporcionados en español), genera un documento médico hipotético **en inglés**. Esto es crucial para coincidir con la literatura médica en inglés.

Síntomas del Paciente: ${symptoms}

Por favor, genera un texto clínico técnico que incluya:
1. **Clinical Descriptions**: Descripciones clínicas detalladas de las posibles afecciones.
2. **Differential Diagnoses**: Diagnósticos diferenciales con características distintivas.
3. **Etiology and Pathogenesis**: Etiología y patogénesis (causas y mecanismos posibles).
4. **Clinical Manifestations**: Manifestaciones clínicas (Signos y síntomas típicos y asociados).

El documento debe ser técnico, profesional, utilizando evidencia médica actual y terminología médica estándar en inglés. No te limites a una única condición; explora múltiples posibilidades diagnósticas (No te limites a una única condición).

---

Based on the following patient symptoms (provided in Spanish), generate a hypothetical medical document **in English**. This is crucial for matching with English medical literature.

Patient Symptoms: ${symptoms}

Please generate a technical clinical text including:
1. **Clinical Descriptions**: Detailed clinical descriptions of potential conditions.
2. **Differential Diagnoses**: Differential diagnoses with distinctive characteristics.
3. **Etiology and Pathogenesis**: Possible causes and mechanisms.
4. **Clinical Manifestations**: Typical signs and associated symptoms.

The document must be technical, professional, using standard medical English terminology. Do not limit to a single condition; explore multiple diagnostic possibilities.`;
  }

  /**
   * Builds a HyDE (Hypothetical Document Embeddings) prompt for treatment
   * This generates a synthetic document that would ideally contain treatment information
   *
   * @param condition - The medical condition or diagnosis
   * @returns A prompt that asks the LLM to generate clinical treatment descriptions
   */
  buildHydeTreatmentPrompt(condition: string): string {
    return `Basado en la siguiente condición médica (proporcionada en español), genera un documento médico hipotético **en inglés**. Esto es crucial para coincidir con la literatura médica en inglés.

Condición: ${condition}

Por favor, genera un texto clínico técnico que incluya:
1. **Clinical Descriptions**: Descripciones clínicas de los tratamientos fisioterapéuticos recomendados (fisioterapia).
2. **Treatment Strategies**: Estrategias de tratamiento (Enfoques terapéuticos y sus fundamentos fisiopatológicos).
3. **Specific Techniques**: Técnicas específicas (Modalidades de intervención y su aplicación práctica).
4. **Scientific Evidence**: Evidencia científica (respaldo de la literatura científica para las intervenciones recomendadas).

El documento debe ser técnico, profesional, utilizando evidencia médica actual y terminología médica estándar en inglés. Describe un enfoque de tratamiento fisioterapéutico integral para esta condición.

---

Based on the following medical condition (provided in Spanish), generate a hypothetical medical document **in English**. This is crucial for matching with English medical literature.

Condition: ${condition}

Please generate a technical clinical text including:
1. **Clinical Descriptions**: Clinical descriptions of recommended physiotherapy treatments.
2. **Treatment Strategies**: Therapeutic approaches and their pathophysiological foundations.
3. **Specific Techniques**: Intervention modalities and their practical application.
4. **Scientific Evidence**: Support from scientific literature for the recommended interventions.

The document must be technical, professional, using standard medical English terminology. Describe a comprehensive physiotherapy approach for this condition.`;
  }
}
