import { Test, TestingModule } from '@nestjs/testing';
import { DataAggregationService } from './services/data-aggregation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('DataAggregationService', () => {
  let service: DataAggregationService;

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
  };

  const mockDate = new Date('2024-01-01');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataAggregationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DataAggregationService>(DataAggregationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should aggregate case data correctly when all data exists', async () => {
    const caseId = 'case-1';
    const therapistId = 'therapist-1';

    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: caseId,
      patient: { therapistId },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        posturogram: { analysis: 'Scoliosis' },
        footprints: [],
        voiceNotes: [],
      },
    ]);

    mockPrismaService.treatmentSession.findMany.mockResolvedValue([
      {
        id: 'session-1',
        date: mockDate,
        voiceNotes: [],
      },
    ]);

    const result = await service.aggregateCaseData(caseId, therapistId);

    expect(result.id).toBe(caseId);
    expect(result.evaluations).toHaveLength(1);
    expect(result.recentSessions).toHaveLength(1);
    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].findings).toContain('Scoliosis');
  });

  it('should throw NotFoundException if case does not exist', async () => {
    mockPrismaService.clinicalCase.findUnique.mockResolvedValue(null);

    await expect(
      service.aggregateCaseData('non-existent', 'therapist-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if therapist is not owner', async () => {
    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: 'case-1',
      patient: { therapistId: 'other-therapist' },
    });

    await expect(
      service.aggregateCaseData('case-1', 'therapist-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should extract vision findings from posturogram', async () => {
    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: 'case-1',
      patient: { therapistId: 'therapist-1' },
    });

    const posturogramData = { analysis: 'Head deviation' };
    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        posturogram: posturogramData,
        footprints: [],
        voiceNotes: [],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    const result = await service.aggregateCaseData('case-1', 'therapist-1');

    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].source).toBe('POSTUROGRAM');
    expect(result.visionFindings[0].findings).toContain('Head deviation');
  });

  it('should extract vision findings from footprints', async () => {
    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: 'case-1',
      patient: { therapistId: 'therapist-1' },
    });

    const footprintData = { analysis: 'Flat foot' };
    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        posturogram: {},
        footprints: [
          {
            id: 'fp-1',
            date: mockDate,
            analysis: footprintData,
          },
        ],
        voiceNotes: [],
      },
    ]);
    mockPrismaService.treatmentSession.findMany.mockResolvedValue([]);

    const result = await service.aggregateCaseData('case-1', 'therapist-1');

    expect(result.visionFindings).toHaveLength(1);
    expect(result.visionFindings[0].source).toBe('FOOTPRINT');
    expect(result.visionFindings[0].findings).toContain('Flat foot');
  });

  it('should extract voice transcripts from evaluations and sessions', async () => {
    mockPrismaService.clinicalCase.findUnique.mockResolvedValue({
      id: 'case-1',
      patient: { therapistId: 'therapist-1' },
    });

    mockPrismaService.evaluation.findMany.mockResolvedValue([
      {
        id: 'eval-1',
        date: mockDate,
        posturogram: {},
        footprints: [],
        voiceNotes: [
          {
            id: 'vn-1',
            transcription: 'Eval note',
            durationSeconds: 10,
            createdAt: mockDate.toISOString(),
          },
        ],
      },
    ]);

    mockPrismaService.treatmentSession.findMany.mockResolvedValue([
      {
        id: 'session-1',
        date: mockDate,
        voiceNotes: [
          {
            id: 'vn-2',
            transcription: 'Session note',
            durationSeconds: 20,
            createdAt: mockDate.toISOString(),
          },
        ],
      },
    ]);

    const result = await service.aggregateCaseData('case-1', 'therapist-1');

    expect(result.voiceTranscripts).toHaveLength(2);
    expect(
      result.voiceTranscripts.find((v) => v.source === 'EVALUATION')
        ?.transcript,
    ).toBe('Eval note');
    expect(
      result.voiceTranscripts.find((v) => v.source === 'SESSION')?.transcript,
    ).toBe('Session note');
  });
});
