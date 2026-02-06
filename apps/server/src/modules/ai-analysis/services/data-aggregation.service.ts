import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CaseDataAggregate,
  VisionFinding,
  VoiceNote,
} from '../interfaces/aggregation.interfaces';

interface JsonVoiceNote {
  id: string;
  transcription: string | null;
  durationSeconds: number;
  createdAt: string;
}

@Injectable()
export class DataAggregationService {
  private readonly logger = new Logger(DataAggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async aggregateCaseData(
    clinicalCaseId: string,
    therapistId: string,
  ): Promise<CaseDataAggregate> {
    const clinicalCase = await this.prisma.clinicalCase.findUnique({
      where: { id: clinicalCaseId },
      include: {
        patient: true,
      },
    });

    if (!clinicalCase) {
      throw new NotFoundException(`Clinical case not found: ${clinicalCaseId}`);
    }

    if (clinicalCase.patient.therapistId !== therapistId) {
      throw new ForbiddenException(
        'You do not have access to this clinical case',
      );
    }

    const [evaluations, recentSessions] = await Promise.all([
      this.prisma.evaluation.findMany({
        where: { clinicalCaseId },
        orderBy: { date: 'desc' },
        include: {
          footprints: true,
        },
      }),
      this.prisma.treatmentSession.findMany({
        where: { clinicalCaseId },
        orderBy: { date: 'desc' },
        take: 3,
      }),
    ]);

    const visionFindings = this.extractVisionFindings(evaluations);
    const voiceTranscripts = this.extractVoiceTranscripts(
      evaluations,
      recentSessions,
    );

    return {
      ...clinicalCase,
      evaluations: evaluations as any,
      recentSessions,
      visionFindings,
      voiceTranscripts,
    };
  }

  private extractVisionFindings(evaluations: any[]): VisionFinding[] {
    const findings: VisionFinding[] = [];

    for (const evaluation of evaluations) {
      if (
        evaluation.posturogram &&
        typeof evaluation.posturogram === 'object' &&
        Object.keys(evaluation.posturogram).length > 0
      ) {
        const content = JSON.stringify(evaluation.posturogram, null, 2);
        findings.push({
          source: 'POSTUROGRAM',
          date: evaluation.date,
          findings: content,
          id: `${evaluation.id}-posturogram`,
        });
      }

      if (evaluation.footprints && Array.isArray(evaluation.footprints)) {
        for (const footprint of evaluation.footprints) {
          if (
            footprint.analysis &&
            typeof footprint.analysis === 'object' &&
            Object.keys(footprint.analysis).length > 0
          ) {
            const content = JSON.stringify(footprint.analysis, null, 2);
            findings.push({
              source: 'FOOTPRINT',
              date: footprint.date,
              findings: content,
              id: footprint.id,
            });
          }
        }
      }
    }

    return findings;
  }

  private extractVoiceTranscripts(
    evaluations: any[],
    sessions: any[],
  ): VoiceNote[] {
    const notes: VoiceNote[] = [];

    for (const evaluation of evaluations) {
      if (evaluation.voiceNotes && Array.isArray(evaluation.voiceNotes)) {
        for (const note of evaluation.voiceNotes as JsonVoiceNote[]) {
          if (note.transcription) {
            notes.push({
              source: 'EVALUATION',
              date: new Date(note.createdAt || evaluation.date),
              transcript: note.transcription,
              duration: note.durationSeconds,
              id: note.id,
            });
          }
        }
      }
    }

    for (const session of sessions) {
      if (session.voiceNotes && Array.isArray(session.voiceNotes)) {
        for (const note of session.voiceNotes as JsonVoiceNote[]) {
          if (note.transcription) {
            notes.push({
              source: 'SESSION',
              date: new Date(note.createdAt || session.date),
              transcript: note.transcription,
              duration: note.durationSeconds,
              id: note.id,
            });
          }
        }
      }
    }

    return notes.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
