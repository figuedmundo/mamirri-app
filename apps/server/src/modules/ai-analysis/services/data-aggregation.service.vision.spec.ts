import { Test, TestingModule } from '@nestjs/testing';
import { DataAggregationService } from './data-aggregation.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { VisionService } from './vision.service';
import { StorageService } from '../../storage/storage.service';

describe('DataAggregationService (Vision Integration)', () => {
  let service: DataAggregationService;
  let visionService: VisionService;
  let storageService: StorageService;
  let prisma: PrismaService;

  const mockPrismaService = {
    clinicalCase: {
      findUnique: jest.fn(),
    },
    evaluation: {
      findMany: jest.fn(),
    },
    treatmentSession: {
      findMany: jest.fn(),
    },
    footprint: {
      update: jest.fn(),
    },
  };

  const mockVisionService = {
    analyzeImage: jest.fn(),
  };

  const mockStorageService = {
    getFile: jest.fn(),
  };

  const mockDate = new Date('2024-01-01');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataAggregationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VisionService, useValue: mockVisionService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DataAggregationService>(DataAggregationService);
    visionService = module.get<VisionService>(VisionService);
    storageService = module.get<StorageService>(StorageService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should use cached analysis when it exists and forceVision is false', async () => {
    const caseId = 'case-1';
    const therapistId = 'therapist-1';
    const footprint = {
      id: 'fp-1',
      date: mockDate,
      url: 'path/to/image.jpg',
      analysis: { findings: ['Flat foot'] },
    };

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      patient: { therapistId },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        footprints: [footprint],
        posturogram: {},
        voiceNotes: [],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    const result = await service.aggregateCaseData(caseId, therapistId, false);

    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].findings).toContain('Flat foot');
    expect(result.visionStats?.cacheHits).toBe(1);
    expect(result.visionStats?.apiCalls).toBe(0);
    expect(mockVisionService.analyzeImage).not.toHaveBeenCalled();
  });

  it('should call VisionService when analysis is missing', async () => {
    const caseId = 'case-1';
    const therapistId = 'therapist-1';
    const footprint = {
      id: 'fp-1',
      date: mockDate,
      url: 'path/to/image.jpg',
      analysis: null,
    };

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      patient: { therapistId },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        footprints: [footprint],
        posturogram: {},
        voiceNotes: [],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    mockStorageService.getFile.mockResolvedValue(Buffer.from('image data'));
    mockVisionService.analyzeImage.mockResolvedValue({
      structuredAnalysis: { findings: ['New analysis'], confidence: 'HIGH' },
    });

    const result = await service.aggregateCaseData(caseId, therapistId, false);

    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].findings).toContain('New analysis');
    expect(result.visionStats?.apiCalls).toBe(1);
    expect(mockVisionService.analyzeImage).toHaveBeenCalled();
    expect(mockPrismaService.footprint.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: footprint.id },
        data: expect.objectContaining({
          analysis: { findings: ['New analysis'], confidence: 'HIGH' },
          analyzedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should call VisionService when forceVision is true even if analysis exists', async () => {
    const caseId = 'case-1';
    const therapistId = 'therapist-1';
    const footprint = {
      id: 'fp-1',
      date: mockDate,
      url: 'path/to/image.jpg',
      analysis: { findings: ['Old analysis'] },
    };

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      patient: { therapistId },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        footprints: [footprint],
        posturogram: {},
        voiceNotes: [],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    mockStorageService.getFile.mockResolvedValue(Buffer.from('image data'));
    mockVisionService.analyzeImage.mockResolvedValue({
      structuredAnalysis: { findings: ['Fresh analysis'], confidence: 'HIGH' },
    });

    const result = await service.aggregateCaseData(caseId, therapistId, true);

    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].findings).toContain('Fresh analysis');
    expect(result.visionStats?.apiCalls).toBe(1);
    expect(mockVisionService.analyzeImage).toHaveBeenCalled();
  });

  it('should continue processing other images if one fails', async () => {
    const caseId = 'case-1';
    const therapistId = 'therapist-1';
    const footprint1 = {
      id: 'fp-1',
      date: mockDate,
      url: 'path/to/image1.jpg',
      analysis: null,
    };
    const footprint2 = {
      id: 'fp-2',
      date: mockDate,
      url: 'path/to/image2.jpg',
      analysis: null,
    };

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      patient: { therapistId },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        footprints: [footprint1, footprint2],
        posturogram: {},
        voiceNotes: [],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    mockStorageService.getFile.mockResolvedValue(Buffer.from('image data'));

    mockVisionService.analyzeImage
      .mockRejectedValueOnce(new Error('Vision API error'))
      .mockResolvedValueOnce({
        structuredAnalysis: {
          findings: ['Success analysis'],
          confidence: 'HIGH',
        },
      });

    const result = await service.aggregateCaseData(caseId, therapistId, false);

    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].findings).toContain('Success analysis');
    expect(result.visionStats?.failures).toBe(1);
    expect(result.visionStats?.failedImageIds).toContain('fp-1');
    expect(result.visionStats?.totalImages).toBe(2);
  });
});
