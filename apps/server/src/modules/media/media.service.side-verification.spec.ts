import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { FootprintType, FootprintSide } from './dto/upload-footprint.dto';

describe('MediaService - Footprint Side Verification', () => {
  let service: MediaService;
  let prismaService: PrismaService;
  let storageService: StorageService;

  const mockPrismaService = {
    footprint: {
      create: jest.fn(),
    },
    patient: {
      findUnique: jest.fn(),
    },
    evaluation: {
      findUnique: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
  };

  const mockTranscriptionService = {
    transcribe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: TranscriptionService, useValue: mockTranscriptionService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prismaService = module.get<PrismaService>(PrismaService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should pass side parameter to prisma create call', async () => {
    // Arrange
    const evaluationId = 'eval-123';
    const therapistId = 'therapist-123';
    const file = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    };
    const type = FootprintType.INITIAL;
    const side = FootprintSide.LEFT; // Testing specific side

    // Mock evaluation verification
    mockPrismaService.evaluation.findUnique.mockResolvedValue({
      id: evaluationId,
      clinicalCase: {
        patient: {
          therapistId: therapistId,
        },
      },
    });

    // Mock storage
    mockStorageService.uploadFile.mockResolvedValue('path/to/file.jpg');
    mockStorageService.getFileUrl.mockResolvedValue(
      'https://storage.com/file.jpg',
    );

    // Mock footprint creation result
    const expectedFootprint = {
      id: 'footprint-123',
      type,
      side, // Should match input
      url: 'path/to/file.jpg',
      date: new Date(),
      evaluationId,
    };
    mockPrismaService.footprint.create.mockResolvedValue(expectedFootprint);

    // Act
    const result = await service.uploadFootprint(
      evaluationId,
      file,
      type,
      side,
      therapistId,
    );

    // Assert
    expect(mockPrismaService.footprint.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type,
        side, // Verify side is passed
        evaluationId,
      }),
    });
    expect(result.side).toBe(FootprintSide.LEFT);
  });

  it('should default side to UNKNOWN if not provided', async () => {
    // Arrange
    const evaluationId = 'eval-123';
    const therapistId = 'therapist-123';
    const file = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    };
    const type = FootprintType.INITIAL;

    // Mock verification & storage setup (same as above)
    mockPrismaService.evaluation.findUnique.mockResolvedValue({
      id: evaluationId,
      clinicalCase: {
        patient: {
          therapistId: therapistId,
        },
      },
    });
    mockStorageService.uploadFile.mockResolvedValue('path/to/file.jpg');
    mockStorageService.getFileUrl.mockResolvedValue(
      'https://storage.com/file.jpg',
    );

    mockPrismaService.footprint.create.mockResolvedValue({
      id: 'footprint-123',
      type,
      side: FootprintSide.UNKNOWN,
      url: 'path/to/file.jpg',
      date: new Date(),
      evaluationId,
    });

    // Act
    await service.uploadFootprint(
      evaluationId,
      file,
      type,
      undefined, // No side provided
      therapistId,
    );

    // Assert
    expect(mockPrismaService.footprint.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        side: FootprintSide.UNKNOWN, // Should default to UNKNOWN
      }),
    });
  });
});
