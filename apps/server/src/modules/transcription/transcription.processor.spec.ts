import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptionProcessor } from './transcription.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TranscriptionService } from './transcription.service';

describe('TranscriptionProcessor', () => {
  let processor: TranscriptionProcessor;
  let prismaService: PrismaService;
  let storageService: StorageService;
  let transcriptionService: TranscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionProcessor,
        {
          provide: PrismaService,
          useValue: {
            evaluation: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            treatmentSession: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: StorageService,
          useValue: {
            getFile: jest.fn(),
          },
        },
        {
          provide: TranscriptionService,
          useValue: {
            transcribe: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<TranscriptionProcessor>(TranscriptionProcessor);
    prismaService = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);
    transcriptionService =
      module.get<TranscriptionService>(TranscriptionService);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('handlePendingTranscriptions', () => {
    it('should swallow P2022 missing column errors from evaluation scan', async () => {
      (prismaService.evaluation.findMany as jest.Mock).mockRejectedValue({
        code: 'P2022',
        message:
          'The column `(not available)` does not exist in the current database.',
      });
      (prismaService.treatmentSession.findMany as jest.Mock).mockResolvedValue(
        [],
      );

      await expect(
        processor.handlePendingTranscriptions(),
      ).resolves.toBeUndefined();
      expect(prismaService.evaluation.update).not.toHaveBeenCalled();
    });

    it('should process pending evaluation voice notes', async () => {
      const mockEvaluation = {
        id: 'eval-1',
        voiceNotes: [
          {
            audioUrl: 'path/audio.m4a',
            transcriptionStatus: 'pending',
            retryCount: 0,
          },
          {
            audioUrl: 'path/completed.m4a',
            transcriptionStatus: 'completed',
          },
        ],
      };

      (prismaService.evaluation.findMany as jest.Mock).mockResolvedValue([
        mockEvaluation,
      ]);
      (prismaService.treatmentSession.findMany as jest.Mock).mockResolvedValue(
        [],
      );
      (storageService.getFile as jest.Mock).mockResolvedValue(
        Buffer.from('audio'),
      );
      (transcriptionService.transcribe as jest.Mock).mockResolvedValue({
        text: 'Transcribed',
        status: 'completed',
      });

      await processor.handlePendingTranscriptions();

      expect(storageService.getFile).toHaveBeenCalledWith('path/audio.m4a');
      expect(transcriptionService.transcribe).toHaveBeenCalled();
      expect(prismaService.evaluation.update).toHaveBeenCalledWith({
        where: { id: 'eval-1' },
        data: {
          voiceNotes: expect.arrayContaining([
            expect.objectContaining({
              transcription: 'Transcribed',
              transcriptionStatus: 'completed',
            }),
          ]),
        },
      });
    });

    it('should handle transcription failure by incrementing retry count', async () => {
      const mockEvaluation = {
        id: 'eval-1',
        voiceNotes: [
          {
            audioUrl: 'path/audio.m4a',
            transcriptionStatus: 'pending',
            retryCount: 0,
          },
        ],
      };

      (prismaService.evaluation.findMany as jest.Mock).mockResolvedValue([
        mockEvaluation,
      ]);
      (prismaService.treatmentSession.findMany as jest.Mock).mockResolvedValue(
        [],
      );
      (storageService.getFile as jest.Mock).mockResolvedValue(
        Buffer.from('audio'),
      );
      (transcriptionService.transcribe as jest.Mock).mockResolvedValue({
        text: '',
        status: 'failed',
        error: 'API Error',
      });

      await processor.handlePendingTranscriptions();

      expect(prismaService.evaluation.update).toHaveBeenCalledWith({
        where: { id: 'eval-1' },
        data: {
          voiceNotes: [
            expect.objectContaining({
              retryCount: 1,
              transcriptionStatus: 'pending',
              transcriptionError: 'API Error',
            }),
          ],
        },
      });
    });

    it('should mark as failed if max retries exceeded', async () => {
      const mockEvaluation = {
        id: 'eval-1',
        voiceNotes: [
          {
            audioUrl: 'path/audio.m4a',
            transcriptionStatus: 'pending',
            retryCount: 5,
          },
        ],
      };

      (prismaService.evaluation.findMany as jest.Mock).mockResolvedValue([
        mockEvaluation,
      ]);
      (prismaService.treatmentSession.findMany as jest.Mock).mockResolvedValue(
        [],
      );

      await processor.handlePendingTranscriptions();

      expect(transcriptionService.transcribe).not.toHaveBeenCalled();
      expect(prismaService.evaluation.update).toHaveBeenCalledWith({
        where: { id: 'eval-1' },
        data: {
          voiceNotes: [
            expect.objectContaining({
              transcriptionStatus: 'failed',
              transcriptionError: 'Max retries exceeded',
            }),
          ],
        },
      });
    });
  });
});
