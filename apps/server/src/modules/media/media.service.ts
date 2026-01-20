import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FootprintType } from './dto/upload-footprint.dto';
import { PostureVideoType } from './dto/upload-posture-video.dto';
import { Footprint, PostureVideo } from '@prisma/client';

import { TranscriptionService } from '../transcription/transcription.service';

// Define File interface locally since it's not exported from StorageService
interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface VoiceNote {
  id: string;
  audioUrl: string;
  transcription: string | null;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionError?: string;
  durationSeconds: number;
  retryCount: number;
  createdAt: Date;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  async uploadPatientPhoto(
    patientId: string,
    file: File,
    therapistId: string,
  ): Promise<{ url: string; patientId: string }> {
    await this.verifyPatientOwnership(patientId, therapistId);

    const path = `patients/${patientId}/photos`;
    const url = await this.storage.uploadFile(file, path);
    const signedUrl = await this.storage.getFileUrl(url);

    return { url: signedUrl, patientId };
  }

  async uploadFootprint(
    evaluationId: string,
    file: File,
    type: FootprintType,
    therapistId: string,
  ): Promise<Footprint & { url: string }> {
    await this.verifyEvaluationOwnership(evaluationId, therapistId);

    const path = `evaluations/${evaluationId}/footprints`;
    const storagePath = await this.storage.uploadFile(file, path);
    const signedUrl = await this.storage.getFileUrl(storagePath);

    const footprint = await this.prisma.footprint.create({
      data: {
        type,
        date: new Date(),
        url: storagePath,
        evaluationId,
      },
    });

    return { ...footprint, url: signedUrl };
  }

  async uploadPostureVideo(
    evaluationId: string,
    file: File,
    type: PostureVideoType,
    duration: number,
    therapistId: string,
  ): Promise<PostureVideo & { url: string }> {
    await this.verifyEvaluationOwnership(evaluationId, therapistId);

    const path = `evaluations/${evaluationId}/videos`;
    const storagePath = await this.storage.uploadFile(file, path);
    const signedUrl = await this.storage.getFileUrl(storagePath);

    const video = await this.prisma.postureVideo.create({
      data: {
        type,
        date: new Date(),
        url: storagePath,
        duration,
        observations: '',
        evaluationId,
      },
    });

    return { ...video, url: signedUrl };
  }

  async uploadVoiceNote(
    entityType: 'evaluation' | 'session',
    entityId: string,
    file: File,
    durationSeconds: number,
    therapistId: string,
  ) {
    if (entityType === 'evaluation') {
      await this.verifyEvaluationOwnership(entityId, therapistId);
    } else {
      await this.verifySessionOwnership(entityId, therapistId);
    }

    const path = `voice-notes/${entityType}/${entityId}`;
    const storagePath = await this.storage.uploadFile(file, path);
    const signedUrl = await this.storage.getFileUrl(storagePath);

    const transcriptionResult = await this.transcriptionService.transcribe(
      file.buffer,
      file.originalname,
    );

    const voiceNoteId = crypto.randomUUID();
    const voiceNote: VoiceNote = {
      id: voiceNoteId,
      audioUrl: storagePath,
      transcription: transcriptionResult.text || null,
      transcriptionStatus:
        transcriptionResult.status === 'completed' ? 'completed' : 'pending',
      transcriptionError: transcriptionResult.error,
      durationSeconds,
      retryCount: 0,
      createdAt: new Date(),
    };

    if (entityType === 'evaluation') {
      const evaluation = await this.prisma.evaluation.findUnique({
        where: { id: entityId },
        select: { voiceNotes: true },
      });
      const existingNotes = (evaluation?.voiceNotes as any[]) || [];
      await this.prisma.evaluation.update({
        where: { id: entityId },
        data: {
          voiceNotes: [...existingNotes, voiceNote] as any,
        },
      });
    } else {
      const session = await this.prisma.treatmentSession.findUnique({
        where: { id: entityId },
        select: { voiceNotes: true },
      });
      const existingNotes = (session?.voiceNotes as any[]) || [];
      await this.prisma.treatmentSession.update({
        where: { id: entityId },
        data: {
          voiceNotes: [...existingNotes, voiceNote] as any,
        },
      });
    }

    return { ...voiceNote, audioUrl: signedUrl };
  }

  async getVoiceNoteStatus(
    entityType: 'evaluation' | 'session',
    entityId: string,
    voiceNoteId: string,
    therapistId: string,
  ): Promise<VoiceNote> {
    if (entityType === 'evaluation') {
      await this.verifyEvaluationOwnership(entityId, therapistId);
    } else {
      await this.verifySessionOwnership(entityId, therapistId);
    }

    const entity =
      entityType === 'evaluation'
        ? await this.prisma.evaluation.findUnique({
            where: { id: entityId },
            select: { voiceNotes: true },
          })
        : await this.prisma.treatmentSession.findUnique({
            where: { id: entityId },
            select: { voiceNotes: true },
          });

    if (!entity || !entity.voiceNotes) {
      throw new NotFoundException('Voice note not found');
    }

    const voiceNotes = entity.voiceNotes as unknown as VoiceNote[];
    const voiceNote = voiceNotes.find((vn) => vn.id === voiceNoteId);

    if (!voiceNote) {
      throw new NotFoundException('Voice note not found');
    }

    const signedUrl = await this.storage.getFileUrl(voiceNote.audioUrl);
    return { ...voiceNote, audioUrl: signedUrl };
  }

  private async verifyPatientOwnership(
    patientId: string,
    therapistId: string,
  ): Promise<void> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { therapistId: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (patient.therapistId !== therapistId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async verifyEvaluationOwnership(
    evaluationId: string,
    therapistId: string,
  ): Promise<void> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      select: {
        clinicalCase: {
          select: {
            patient: {
              select: { therapistId: true },
            },
          },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    if (evaluation.clinicalCase.patient.therapistId !== therapistId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async verifySessionOwnership(
    sessionId: string,
    therapistId: string,
  ): Promise<void> {
    const session = await this.prisma.treatmentSession.findUnique({
      where: { id: sessionId },
      select: { therapistId: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.therapistId !== therapistId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
