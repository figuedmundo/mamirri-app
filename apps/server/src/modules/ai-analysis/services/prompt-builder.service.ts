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
}
