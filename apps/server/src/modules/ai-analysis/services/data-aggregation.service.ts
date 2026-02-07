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
  VisionAnalysisStats,
} from '../interfaces/aggregation.interfaces';
import { VisionService } from './vision.service';
import { StorageService } from '../../storage/storage.service';

interface JsonVoiceNote {
  id: string;
  transcription: string | null;
  durationSeconds: number;
  createdAt: string;
}

@Injectable()
export class DataAggregationService {
  private readonly logger = new Logger(DataAggregationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visionService: VisionService,
    private readonly storageService: StorageService,
  ) {}

  async aggregateCaseData(
    clinicalCaseId: string,
    therapistId: string,
    forceVision = false,
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

    const { findings: visionFindings, stats: visionStats } =
      await this.extractVisionFindings(evaluations, forceVision);

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
      visionStats,
    };
  }

  private async extractVisionFindings(
    evaluations: any[],
    forceVision: boolean,
  ): Promise<{ findings: VisionFinding[]; stats: VisionAnalysisStats }> {
    const findings: VisionFinding[] = [];
    const stats: VisionAnalysisStats = {
      totalImages: 0,
      cacheHits: 0,
      apiCalls: 0,
      failures: 0,
      failedImageIds: [],
    };

    const footprintTasks: Promise<void>[] = [];

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
          stats.totalImages++;
          footprintTasks.push(
            (async () => {
              try {
                const finding = await this.analyzeFootprintIfNeeded(
                  footprint,
                  forceVision,
                  stats,
                );
                if (finding) {
                  findings.push(finding);
                }
              } catch (error) {
                this.logger.error(
                  `Error processing footprint ${footprint.id}: ${error.message}`,
                );
                stats.failures++;
                stats.failedImageIds.push(footprint.id);
              }
            })(),
          );
        }
      }
    }

    await Promise.allSettled(footprintTasks);

    return { findings, stats };
  }

  private async analyzeFootprintIfNeeded(
    footprint: any,
    forceVision: boolean,
    stats: VisionAnalysisStats,
  ): Promise<VisionFinding | null> {
    const hasAnalysis =
      footprint.analysis &&
      typeof footprint.analysis === 'object' &&
      Object.keys(footprint.analysis).length > 0;

    if (hasAnalysis && !forceVision) {
      stats.cacheHits++;
      return {
        source: 'FOOTPRINT',
        date: footprint.date,
        findings: JSON.stringify(footprint.analysis, null, 2),
        id: footprint.id,
      };
    }

    stats.apiCalls++;
    const imageBuffer = await this.storageService.getFile(footprint.url);
    const mimeType = this.inferMimeType(footprint.url);

    const result = await this.visionService.analyzeImage(
      imageBuffer,
      'FOOTPRINT',
      mimeType,
    );

    const analysisResults = result.structuredAnalysis;

    await this.prisma.footprint.update({
      where: { id: footprint.id },
      data: {
        analysis: analysisResults as any,
        analyzedAt: new Date(),
      },
    });

    return {
      source: 'FOOTPRINT',
      date: footprint.date,
      findings: JSON.stringify(analysisResults, null, 2),
      confidence: analysisResults.confidence,
      id: footprint.id,
    };
  }

  private inferMimeType(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'jpg':
      case 'jpeg':
      default:
        return 'image/jpeg';
    }
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
