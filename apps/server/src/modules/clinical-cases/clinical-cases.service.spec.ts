import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalCasesService } from './clinical-cases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ClinicalCasesService', () => {
  let service: ClinicalCasesService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    patient: {
      findFirst: jest.fn(),
    },
    clinicalCase: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockTherapistId = 'therapist-123';
  const mockPatientId = 'patient-456';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalCasesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClinicalCasesService>(ClinicalCasesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      patientId: mockPatientId,
      title: 'Lower Back Pain',
      consultationReason: 'Chronic pain for 3 months',
    };

    it('should create a clinical case successfully', async () => {
      const patient = { id: mockPatientId, therapistId: mockTherapistId };
      const createdCase = {
        id: 'c1',
        ...createDto,
        status: 'active',
        startDate: expect.any(Date),
      };

      mockPrismaService.patient.findFirst.mockResolvedValue(patient);
      mockPrismaService.$transaction.mockImplementation((cb) =>
        cb(mockPrismaService),
      );
      mockPrismaService.clinicalCase.create.mockResolvedValue(createdCase);

      const result = await service.create(createDto, mockTherapistId);

      expect(result).toEqual(createdCase);
      expect(mockPrismaService.patient.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockPatientId,
          therapistId: mockTherapistId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.clinicalCase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          consultationReason: createDto.consultationReason,
          patientId: mockPatientId,
          status: 'active',
        }),
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, mockTherapistId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if patient belongs to different therapist', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.create(createDto, 'other-therapist'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated clinical cases scoped to therapist', async () => {
      const cases = [
        { id: 'c1', title: 'Case 1', patient: { id: 'p1', name: 'John' } },
      ];
      mockPrismaService.$transaction.mockResolvedValue([1, cases]);

      const result = await service.findAll(mockTherapistId, 1, 20);

      expect(result).toEqual({
        data: cases,
        meta: { total: 1, page: 1, lastPage: 1 },
      });
      expect(mockPrismaService.clinicalCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            patient: { therapistId: mockTherapistId, deletedAt: null },
          }),
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should filter by patientId', async () => {
      mockPrismaService.$transaction.mockResolvedValue([0, []]);

      await service.findAll(mockTherapistId, 1, 20, mockPatientId);

      expect(mockPrismaService.clinicalCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            patientId: mockPatientId,
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.$transaction.mockResolvedValue([0, []]);

      await service.findAll(mockTherapistId, 1, 20, undefined, 'active');

      expect(mockPrismaService.clinicalCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });

    it('should filter by search term', async () => {
      mockPrismaService.$transaction.mockResolvedValue([0, []]);

      await service.findAll(
        mockTherapistId,
        1,
        20,
        undefined,
        undefined,
        'back pain',
      );

      expect(mockPrismaService.clinicalCase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'back pain', mode: 'insensitive' } },
              {
                consultationReason: {
                  contains: 'back pain',
                  mode: 'insensitive',
                },
              },
            ],
          }),
        }),
      );
    });

    it('should calculate lastPage correctly', async () => {
      mockPrismaService.$transaction.mockResolvedValue([45, []]);

      const result = await service.findAll(mockTherapistId, 1, 20);

      expect(result.meta.lastPage).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a clinical case by id', async () => {
      const clinicalCase = {
        id: 'c1',
        title: 'Lower Back Pain',
        patient: { id: mockPatientId, name: 'John' },
        evaluations: [],
        treatmentSessions: [],
        treatmentPlan: null,
      };
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(clinicalCase);

      const result = await service.findOne('c1', mockTherapistId);

      expect(result).toEqual(clinicalCase);
      expect(mockPrismaService.clinicalCase.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'c1',
          patient: { therapistId: mockTherapistId, deletedAt: null },
        },
        include: {
          patient: { select: { id: true, name: true } },
          evaluations: true,
          treatmentSessions: true,
          treatmentPlan: true,
        },
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(null);

      await expect(service.findOne('c1', mockTherapistId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if case belongs to different therapist', async () => {
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(null);

      await expect(service.findOne('c1', 'other-therapist')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
      status: 'completed' as const,
    };

    it('should update a clinical case successfully', async () => {
      const existingCase = {
        id: 'c1',
        title: 'Original Title',
        patient: { id: mockPatientId, name: 'John' },
        evaluations: [],
        treatmentSessions: [],
        treatmentPlan: null,
      };
      const updatedCase = {
        ...existingCase,
        ...updateDto,
      };

      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(existingCase);
      mockPrismaService.clinicalCase.update.mockResolvedValue(updatedCase);

      const result = await service.update('c1', updateDto, mockTherapistId);

      expect(result).toEqual(updatedCase);
      expect(mockPrismaService.clinicalCase.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: updateDto,
        include: {
          patient: { select: { id: true, name: true } },
        },
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(null);

      await expect(
        service.update('c1', updateDto, mockTherapistId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a clinical case', async () => {
      const existingCase = {
        id: 'c1',
        title: 'Lower Back Pain',
        patient: { id: mockPatientId, name: 'John' },
        evaluations: [],
        treatmentSessions: [],
        treatmentPlan: null,
      };
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(existingCase);
      mockPrismaService.clinicalCase.delete.mockResolvedValue(existingCase);

      await service.remove('c1', mockTherapistId);

      expect(mockPrismaService.clinicalCase.delete).toHaveBeenCalledWith({
        where: { id: 'c1' },
      });
    });

    it('should throw NotFoundException if case not found', async () => {
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(null);

      await expect(service.remove('c1', mockTherapistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
