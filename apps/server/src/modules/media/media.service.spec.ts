import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FootprintType } from './dto/upload-footprint.dto';
import { PostureVideoType } from './dto/upload-posture-video.dto';

import { TranscriptionService } from '../transcription/transcription.service';

describe('MediaService', () => {
  let service: MediaService;
  let storageService: StorageService;
  let prismaService: PrismaService;
  let transcriptionService: TranscriptionService;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as any;

  const mockTherapistId = 'therapist-1';
  const mockEvaluationId = 'eval-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue('path/to/file.jpg'),
            getFileUrl: jest.fn().mockResolvedValue('http://url.com/file.jpg'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            patient: {
              findUnique: jest.fn(),
            },
            clinicalCase: {
              findUnique: jest.fn(),
            },
            evaluation: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            treatmentSession: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            footprint: {
              create: jest.fn(),
            },
            postureVideo: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: TranscriptionService,
          useValue: {
            transcribe: jest.fn().mockResolvedValue({
              text: 'Transcribed text',
              status: 'completed',
              retryCount: 0,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    storageService = module.get<StorageService>(StorageService);
    prismaService = module.get<PrismaService>(PrismaService);
    transcriptionService =
      module.get<TranscriptionService>(TranscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFootprint', () => {
    it('should upload footprint and create record if authorized', async () => {
      jest.spyOn(prismaService.evaluation, 'findUnique').mockResolvedValue({
        id: mockEvaluationId,
        clinicalCase: {
          patient: {
            therapistId: mockTherapistId,
          },
        },
      } as any);

      jest.spyOn(prismaService.footprint, 'create').mockResolvedValue({
        id: 'fp-1',
        url: 'path/to/file.jpg',
      } as any);

      const result = await service.uploadFootprint(
        mockEvaluationId,
        mockFile,
        FootprintType.INITIAL,
        mockTherapistId,
      );

      expect(storageService.uploadFile).toHaveBeenCalled();
      expect(prismaService.footprint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: FootprintType.INITIAL,
          evaluationId: mockEvaluationId,
          url: 'path/to/file.jpg',
        }),
      });
      expect(result.url).toBe('http://url.com/file.jpg');
    });

    it('should throw ForbiddenException if therapist does not own evaluation', async () => {
      jest.spyOn(prismaService.evaluation, 'findUnique').mockResolvedValue({
        id: mockEvaluationId,
        clinicalCase: {
          patient: {
            therapistId: 'other-therapist',
          },
        },
      } as any);

      await expect(
        service.uploadFootprint(
          mockEvaluationId,
          mockFile,
          FootprintType.INITIAL,
          mockTherapistId,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadPostureVideo', () => {
    it('should upload video and create record', async () => {
      jest.spyOn(prismaService.evaluation, 'findUnique').mockResolvedValue({
        id: mockEvaluationId,
        clinicalCase: {
          patient: {
            therapistId: mockTherapistId,
          },
        },
      } as any);

      jest.spyOn(prismaService.postureVideo, 'create').mockResolvedValue({
        id: 'vid-1',
        url: 'path/to/video.mp4',
      } as any);

      const result = await service.uploadPostureVideo(
        mockEvaluationId,
        mockFile,
        PostureVideoType.GAIT,
        120,
        mockTherapistId,
      );

      expect(prismaService.postureVideo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: PostureVideoType.GAIT,
          duration: 120,
          url: 'path/to/file.jpg', // Mock returns jpg path
        }),
      });
      expect(result.url).toBe('http://url.com/file.jpg');
    });
  });

  describe('uploadVoiceNote', () => {
    it('should append voice note with transcription to evaluation', async () => {
      jest.spyOn(prismaService.evaluation, 'findUnique').mockResolvedValue({
        id: mockEvaluationId,
        voiceNotes: [],
        clinicalCase: {
          patient: {
            therapistId: mockTherapistId,
          },
        },
      } as any);

      jest
        .spyOn(prismaService.evaluation, 'update')
        .mockResolvedValue({} as any);

      const result = await service.uploadVoiceNote(
        'evaluation',
        mockEvaluationId,
        mockFile,
        60,
        mockTherapistId,
      );

      expect(transcriptionService.transcribe).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
      );

      expect(prismaService.evaluation.update).toHaveBeenCalledWith({
        where: { id: mockEvaluationId },
        data: {
          voiceNotes: {
            push: expect.objectContaining({
              audioUrl: 'path/to/file.jpg',
              durationSeconds: 60,
              transcription: 'Transcribed text',
              transcriptionStatus: 'completed',
            }),
          },
        },
      });
      expect(result.durationSeconds).toBe(60);
      expect(result.transcription).toBe('Transcribed text');
    });

    it('should handle transcription timeout/failure by saving as pending', async () => {
      jest.spyOn(prismaService.evaluation, 'findUnique').mockResolvedValue({
        id: mockEvaluationId,
        voiceNotes: [],
        clinicalCase: {
          patient: {
            therapistId: mockTherapistId,
          },
        },
      } as any);

      jest
        .spyOn(prismaService.evaluation, 'update')
        .mockResolvedValue({} as any);

      // Mock failed transcription
      jest.spyOn(transcriptionService, 'transcribe').mockResolvedValue({
        text: '',
        status: 'failed',
        error: 'Timeout',
      });

      const result = await service.uploadVoiceNote(
        'evaluation',
        mockEvaluationId,
        mockFile,
        60,
        mockTherapistId,
      );

      expect(prismaService.evaluation.update).toHaveBeenCalledWith({
        where: { id: mockEvaluationId },
        data: {
          voiceNotes: {
            push: expect.objectContaining({
              audioUrl: 'path/to/file.jpg',
              transcription: null,
              transcriptionStatus: 'pending',
              transcriptionError: 'Timeout',
            }),
          },
        },
      });
      expect(result.transcriptionStatus).toBe('pending');
    });

    it('should throw NotFoundException if entity not found', async () => {
      jest
        .spyOn(prismaService.evaluation, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.uploadVoiceNote(
          'evaluation',
          'non-existent',
          mockFile,
          60,
          mockTherapistId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
