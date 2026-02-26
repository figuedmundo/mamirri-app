import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TranscriptionService } from './transcription.service';
import { VoiceNote } from '../media/media.service';

@Injectable()
export class TranscriptionProcessor {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  @Cron('*/30 * * * * *')
  async handlePendingTranscriptions() {
    this.logger.log('Checking for pending transcriptions...');
    await this.runSafely('evaluation transcription scan', async () => {
      await this.processEvaluations();
    });
    await this.runSafely('session transcription scan', async () => {
      await this.processSessions();
    });
  }

  private async processEvaluations() {
    let evaluations: { id: string; voiceNotes: unknown }[] = [];
    try {
      evaluations = await this.prisma.evaluation.findMany({
        where: {
          voiceNotes: {
            string_contains: 'pending',
          },
        },
        select: {
          id: true,
          voiceNotes: true,
        },
      });
    } catch (error: unknown) {
      if (this.isMissingColumnError(error)) {
        this.logger.warn(
          'Skipping evaluation transcription scan because voiceNotes column is missing. Run Prisma migrations or db push.',
        );
        return;
      }
      throw error;
    }

    for (const evaluation of evaluations) {
      const voiceNotes = evaluation.voiceNotes as unknown as VoiceNote[];
      if (!Array.isArray(voiceNotes)) continue;

      let updated = false;
      const updatedNotes = await Promise.all(
        voiceNotes.map(async (note) => {
          if (note.transcriptionStatus === 'pending') {
            updated = true;
            return this.processNote(note);
          }
          return note;
        }),
      );

      if (updated) {
        await this.prisma.evaluation.update({
          where: { id: evaluation.id },
          data: { voiceNotes: updatedNotes as any },
        });
      }
    }
  }

  private async processSessions() {
    let sessions: { id: string; voiceNotes: unknown }[] = [];
    try {
      sessions = await this.prisma.treatmentSession.findMany({
        where: {
          voiceNotes: {
            string_contains: 'pending',
          },
        },
        select: {
          id: true,
          voiceNotes: true,
        },
      });
    } catch (error: unknown) {
      if (this.isMissingColumnError(error)) {
        this.logger.warn(
          'Skipping treatment session transcription scan because voiceNotes column is missing. Run Prisma migrations or db push.',
        );
        return;
      }
      throw error;
    }

    for (const session of sessions) {
      const voiceNotes = session.voiceNotes as unknown as VoiceNote[];
      if (!Array.isArray(voiceNotes)) continue;

      let updated = false;
      const updatedNotes = await Promise.all(
        voiceNotes.map(async (note) => {
          if (note.transcriptionStatus === 'pending') {
            updated = true;
            return this.processNote(note);
          }
          return note;
        }),
      );

      if (updated) {
        await this.prisma.treatmentSession.update({
          where: { id: session.id },
          data: { voiceNotes: updatedNotes as any },
        });
      }
    }
  }

  private async processNote(note: VoiceNote): Promise<VoiceNote> {
    try {
      if ((note.retryCount || 0) >= 5) {
        return {
          ...note,
          transcriptionStatus: 'failed',
          transcriptionError: 'Max retries exceeded',
        };
      }

      // getFile might throw if file not found in storage
      const audioBuffer = await this.storage.getFile(note.audioUrl);
      const filename = note.audioUrl.split('/').pop() || 'audio';

      const result = await this.transcriptionService.transcribe(
        audioBuffer,
        filename,
      );

      if (result.status === 'completed') {
        return {
          ...note,
          transcription: result.text,
          transcriptionStatus: 'completed',
          transcriptionError: undefined,
        };
      } else {
        return {
          ...note,
          retryCount: (note.retryCount || 0) + 1,
          transcriptionStatus: 'pending',
          transcriptionError: result.error,
        };
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to process voice note ${note.audioUrl}: ${error.message}`,
      );
      return {
        ...note,
        retryCount: (note.retryCount || 0) + 1,
        transcriptionStatus: 'pending',
        transcriptionError: error.message,
      };
    }
  }

  private isMissingColumnError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const maybeCode = (error as { code?: string }).code;
    if (maybeCode === 'P2022') {
      return true;
    }

    const maybeMessage = (error as { message?: string }).message;
    if (typeof maybeMessage !== 'string') {
      return false;
    }

    if (
      maybeMessage.includes('P2022') ||
      maybeMessage.includes('does not exist') ||
      maybeMessage.includes('ColumnNotFound')
    ) {
      return true;
    }

    try {
      const serialized = JSON.stringify(error);
      return (
        serialized.includes('P2022') ||
        serialized.includes('ColumnNotFound') ||
        serialized.includes('does not exist')
      );
    } catch {
      return false;
    }
  }

  private async runSafely(label: string, fn: () => Promise<void>) {
    try {
      await fn();
    } catch (error: unknown) {
      if (this.isMissingColumnError(error)) {
        this.logger.warn(
          `Skipping ${label} due to missing database column. Run Prisma migrations or db push and restart the server.`,
        );
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown transcription scheduler error';
      this.logger.error(`Failed during ${label}: ${message}`);
    }
  }
}
